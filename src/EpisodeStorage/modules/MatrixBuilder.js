/**
 * MatrixBuilder
 *
 * EpisodeStorage のビルド処理を責務ごとに分離したモジュール。
 * - dataRows の収集
 * - text → word vector への変換
 * - Attention vector の構築
 * - キャッシュ metadata の生成
 */

export class MatrixBuilder {
  constructor({
    dataLoader = null,
    wordEmbedding = null,
    textEmbedding = null,
    featureExtractor = null,
    attentionEmbedding = null,
  } = {}) {
    this.dataLoader = dataLoader;
    this.wordEmbedding = wordEmbedding;
    this.textEmbedding = textEmbedding;
    this.featureExtractor = featureExtractor;
    this.attentionEmbedding = attentionEmbedding;
  }

  async build({
    botName,
    partName,
    staticSource = null,
    firestoreSource = null,
    tags = [],
  } = {}) {
    if (!botName || !partName) {
      throw new Error('build: botName と partName は必須です');
    }

    const sources = [
      { name: 'staticSource', source: staticSource },
      { name: 'firestoreSource', source: firestoreSource },
    ].filter((entry) => entry.source);

    if (!sources.length) {
      throw new Error('build: 読み込まれたソースがありません');
    }

    if (Array.isArray(tags) && tags.length > 0) {
      if (this.wordEmbedding && typeof this.wordEmbedding.addWordTags === 'function') {
        tags.forEach((tagSet) => this.wordEmbedding.addWordTags(tagSet, 'matrix-builder'));
      }
    }

    const dataRows = this.collectDataRows({ staticSource, firestoreSource });
    const { blocks, indexMap } = this.buildWordVectorBlocks(dataRows);
    const attentionVectors = this.attentionEmbedding && typeof this.attentionEmbedding.buildAttentionVectors === 'function'
      ? this.attentionEmbedding.buildAttentionVectors(blocks)
      : [];

    const cacheMeta = this.buildCacheMeta(blocks);

    return {
      botName,
      partName,
      dataRows,
      wordVector: blocks,
      indexMap,
      attentionVectors,
      cacheMeta,
    };
  }

  collectDataRows({ staticSource = null, firestoreSource = null } = {}) {
    const rows = [];
    let index = 0;

    const appendRows = (source) => {
      if (!source || !Array.isArray(source.data)) {
        return;
      }

      const columns = Array.isArray(source.columns) ? source.columns : [];
      const textIndex = columns.indexOf('text') !== -1 ? columns.indexOf('text') : 1;

      for (const row of source.data) {
        if (row === null || typeof row === 'string') {
          rows.push({ separator: true, row, index });
          index += 1;
          continue;
        }

        if (!Array.isArray(row)) {
          index += 1;
          continue;
        }

        const text = row[textIndex];
        rows.push({
          separator: false,
          row,
          text: typeof text === 'string' ? text : '',
          index,
        });
        index += 1;
      }
    };

    appendRows(staticSource);
    appendRows(firestoreSource);

    return rows;
  }

  buildWordVectorBlocks(dataRows = []) {
    const blocks = [];
    const indexMap = [];
    let currentBlock = [];
    let currentIndexBlock = [];

    const flushBlock = () => {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        indexMap.push(currentIndexBlock);
      }
      currentBlock = [];
      currentIndexBlock = [];
    };

    for (const item of dataRows) {
      if (item?.separator) {
        flushBlock();
        continue;
      }

      if (item?.text && item.text.trim().length) {
        const vector = this.textEmbedding && typeof this.textEmbedding.embedText === 'function'
          ? this.textEmbedding.embedText(item.text.trim())
          : {};

        if (vector && Object.keys(vector).length) {
          currentBlock.push(vector);
          currentIndexBlock.push(item.index);
        }
      }
    }

    flushBlock();
    return { blocks, indexMap };
  }

  embedBlock(lines = []) {
    const block = [];

    for (const line of lines) {
      if (!line || typeof line !== 'string') {
        continue;
      }

      const vector = this.textEmbedding && typeof this.textEmbedding.embedText === 'function'
        ? this.textEmbedding.embedText(line)
        : {};

      if (vector && Object.keys(vector).length) {
        block.push(vector);
      }
    }

    return block;
  }

  buildCacheMeta(wordVector = []) {
    const tokenSet = new Set();

    for (const block of Array.isArray(wordVector) ? wordVector : []) {
      if (!Array.isArray(block)) {
        continue;
      }

      for (const item of block) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          continue;
        }

        Object.keys(item).forEach((token) => tokenSet.add(token));
      }
    }

    const vocab = Array.from(tokenSet).sort();
    const indexMap = vocab.reduce((map, token, idx) => {
      map[token] = idx;
      return map;
    }, {});

    const matrix = vocab.map(() => Array(vocab.length).fill(0));

    for (const block of Array.isArray(wordVector) ? wordVector : []) {
      if (!Array.isArray(block)) {
        continue;
      }

      for (const item of block) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          continue;
        }

        const entries = Object.entries(item).filter(([, value]) => typeof value === 'number');
        for (let i = 0; i < entries.length; i += 1) {
          const [tokenA, weightA] = entries[i];
          const indexA = indexMap[tokenA];
          if (indexA === undefined) {
            continue;
          }

          for (let j = 0; j < entries.length; j += 1) {
            const [tokenB, weightB] = entries[j];
            const indexB = indexMap[tokenB];
            if (indexB === undefined) {
              continue;
            }

            matrix[indexA][indexB] += weightA * weightB;
          }
        }
      }
    }

    for (const row of matrix) {
      const sum = row.reduce((acc, value) => acc + value, 0);
      if (sum > 0) {
        for (let i = 0; i < row.length; i += 1) {
          row[i] = row[i] / sum;
        }
      }
    }

    return { vocab, matrix };
  }

  /**
   * 列の値を prefix 付き疎ベクトルへ変換（列ごとに固有の key 空間になる）
   */
  vectorizeColumnValue(column, value, { continuousMaximums = {} } = {}) {
    if (column === 'text') {
      const vector = this.textEmbedding && typeof this.textEmbedding.embedText === 'function'
        ? this.textEmbedding.embedText(typeof value === 'string' ? value.trim() : '')
        : {};
      return this.prefixVector(column, vector);
    }
    if (column === 'date') {
      const vector = this.featureExtractor && typeof this.featureExtractor.extractDate === 'function'
        ? this.featureExtractor.extractDate(value)
        : [];
      return this.arrayVector(column, vector);
    }
    if (column === 'time') {
      const vector = this.featureExtractor && typeof this.featureExtractor.extractTime === 'function'
        ? this.featureExtractor.extractTime(value)
        : [];
      return this.arrayVector(column, vector);
    }
    if (column === 'emo') {
      const vector = this.featureExtractor && typeof this.featureExtractor.extractEmotion === 'function'
        ? this.featureExtractor.extractEmotion(value)
        : [];
      return this.arrayVector(column, vector);
    }
    if (typeof value === 'number') {
      const maximum = continuousMaximums[column] || 1;
      const vector = this.featureExtractor && typeof this.featureExtractor.extractContinuous === 'function'
        ? this.featureExtractor.extractContinuous(value, maximum)
        : [];
      return this.arrayVector(column, vector);
    }

    const vector = this.wordEmbedding && typeof this.wordEmbedding.getEmbedding === 'function'
      ? this.wordEmbedding.getEmbedding(value)
      : undefined;
    return this.prefixVector(column, vector);
  }

  /**
   * row(=columns順の値配列) を factor.weight で重み付けした特徴量ベクトルへ変換（attention抜き）
   */
  vectorizeRowColumns(row = [], columns = [], weights = {}, continuousMaximums = {}) {
    const result = {};
    columns.forEach((column, columnIndex) => {
      const value = Array.isArray(row) ? row[columnIndex] : undefined;
      const weight = typeof weights[column] === 'number' ? weights[column] : 1;
      const vector = this.vectorizeColumnValue(column, value, { continuousMaximums });
      this.addWeightedVector(result, vector, weight);
    });
    return result;
  }

  /**
   * attention ベクトルを合成し、全体を L2 正規化して最終特徴量ベクトルを得る
   */
  finalizeRowVector(baseVector = {}, attentionVector = {}, textWeight = 1) {
    const combined = { ...baseVector };
    this.addWeightedVector(combined, this.prefixVector('attention', attentionVector), textWeight);
    return this.normalizeVector(combined);
  }

  /**
   * dataRows(非separator行)ごとに、列特徴量+attentionを合成した最終特徴量ベクトルを構築する
   * @returns {{ rowVectors: Map<number, object>, vocab: string[], continuousMaximums: object }}
   */
  buildRowFeatureVectors({ dataRows = [], columns = [], factor = {}, attentionVectors = [], indexMap = [] } = {}) {
    const weights = (factor && typeof factor === 'object' && factor.weight) || {};
    const rows = (Array.isArray(dataRows) ? dataRows : []).filter(
      (item) => item && !item.separator && Array.isArray(item.row),
    );

    const continuousMaximums = {};
    columns.forEach((column, columnIndex) => {
      const maximum = Math.max(
        0,
        ...rows
          .map((item) => item.row[columnIndex])
          .filter((value) => typeof value === 'number' && Number.isFinite(value)),
      );
      continuousMaximums[column] = maximum;
    });

    const attentionByRow = new Map();
    (Array.isArray(indexMap) ? indexMap : []).forEach((blockIndexes, blockIndex) => {
      (Array.isArray(blockIndexes) ? blockIndexes : []).forEach((rowIndex, vectorIndex) => {
        attentionByRow.set(rowIndex, attentionVectors[blockIndex]?.[vectorIndex] || {});
      });
    });

    const textWeight = typeof weights.text === 'number' ? weights.text : 1;
    const rowVectors = new Map();
    const vocabSet = new Set();

    rows.forEach((item) => {
      const base = this.vectorizeRowColumns(item.row, columns, weights, continuousMaximums);
      const finalVector = this.finalizeRowVector(base, attentionByRow.get(item.index), textWeight);
      rowVectors.set(item.index, finalVector);
      Object.keys(finalVector).forEach((key) => vocabSet.add(key));
    });

    return { rowVectors, vocab: Array.from(vocabSet).sort(), continuousMaximums };
  }

  prefixVector(prefix, vector) {
    if (!vector || typeof vector !== 'object' || Array.isArray(vector)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(vector)
        .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
        .map(([key, value]) => [`${prefix}:${key}`, value]),
    );
  }

  arrayVector(prefix, values) {
    return Object.fromEntries(
      (Array.isArray(values) ? values : [])
        .filter((value) => typeof value === 'number' && Number.isFinite(value))
        .map((value, index) => [`${prefix}:${index}`, value]),
    );
  }

  normalizeVector(vector) {
    if (!vector || typeof vector !== 'object') {
      return {};
    }
    const norm = Math.sqrt(Object.values(vector).reduce((sum, value) => sum + value ** 2, 0));
    if (norm === 0) {
      return { ...vector };
    }
    return Object.fromEntries(Object.entries(vector).map(([key, value]) => [key, value / norm]));
  }

  addWeightedVector(target, vector, weight) {
    Object.entries(this.normalizeVector(vector)).forEach(([key, value]) => {
      target[key] = value * weight;
    });
    return target;
  }
}

export default MatrixBuilder;
