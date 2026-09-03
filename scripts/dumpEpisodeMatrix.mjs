/**
 * .episode.json から特徴量行列を pandas 用 CSV にダンプする。
 *
 * Usage:
 *   npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json
 *
 * 会話行を縦軸、特徴トークンを横軸にする場合:
 *   npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json --format row-features
 *
 * attention を含む正規化済み最終特徴量行列を出力する場合:
 *   npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json --format final-row-features
 *
 * 出力先を指定する場合:
 *   npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json --output tmp/aurula.csv
 *
 * pandas での読み込み:
 *   pd.read_csv("tmp/greeting.episode.row-features.csv", index_col="conversation_row")
 *   pd.read_csv("tmp/greeting.episode.final-row-features.csv", index_col="conversation_row")
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TinySegmenter } from '../src/tinysegmenter.js';
import { AttentionEmbedding } from '../src/EpisodeStorage/modules/AttentionEmbedding.js';
import { FeatureExtractor } from '../src/EpisodeStorage/modules/FeatureExtractor.js';
import { MatrixBuilder } from '../src/EpisodeStorage/modules/MatrixBuilder.js';
import { TextEmbedding } from '../src/EpisodeStorage/modules/TextEmbedding.js';
import { WordEmbedding } from '../src/EpisodeStorage/modules/WordEmbedding.js';

function usage() {
  return 'Usage: node scripts/dumpEpisodeMatrix.mjs <path-to-episode.json> [--format token-matrix|row-features|final-row-features] [--output <path>]';
}

function parseArguments(argumentsList) {
  const [inputPath, ...options] = argumentsList;
  let outputPath;
  let format = 'token-matrix';

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    const value = options[index + 1];
    if (!value) {
      throw new Error(`${option} requires a value`);
    }

    if (option === '--output') {
      if (outputPath) {
        throw new Error('--output can only be specified once');
      }
      outputPath = value;
    } else if (option === '--format') {
      if (!['token-matrix', 'row-features', 'final-row-features'].includes(value)) {
        throw new Error(`Unsupported format: ${value}`);
      }
      format = value;
    } else {
      throw new Error(`Unknown option: ${option}`);
    }
    index += 1;
  }

  if (!inputPath) {
    throw new Error('An episode JSON path is required');
  }

  return { inputPath, outputPath, format };
}

function ensureEpisodeData(episode, inputPath) {
  if (!episode || typeof episode !== 'object' || Array.isArray(episode)) {
    throw new Error(`Episode file must contain a JSON object: ${inputPath}`);
  }
  if (!Array.isArray(episode.data)) {
    throw new Error(`Episode file must contain a data array: ${inputPath}`);
  }
}

function addTagSets(wordEmbedding, tagSets) {
  tagSets.filter(Array.isArray).forEach((tags, index) => {
    const compatibleTags = tags.flatMap((tag) => {
      const embedding = tag?.embedding || tag?.embeddings;
      const sum = embedding && typeof embedding === 'object'
        ? Object.values(embedding).reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0)
        : 0;
      return sum > 0 ? [{ ...tag, embedding }] : [];
    });
    wordEmbedding.addWordTags(compatibleTags, `tags[${index}]`);
  });
}

async function loadCommonFeatureTags() {
  const commonPath = path.join(process.cwd(), 'static', 'common');
  const filenames = (await readdir(commonPath)).filter((filename) => /^feature_.*\.embed\.json$/u.test(filename));
  const tagSets = await Promise.all(filenames.map(async (filename) => {
    const contents = await readFile(path.join(commonPath, filename), 'utf8');
    try {
      const tags = JSON.parse(contents);
      if (!Array.isArray(tags)) {
        throw new Error('must contain a JSON array');
      }
      return tags;
    } catch (error) {
      throw new Error(`Invalid common feature tags in ${filename}: ${error.message}`);
    }
  }));
  return tagSets;
}

export function buildEpisodeMatrix(episode) {
  ensureEpisodeData(episode, '<input>');

  const wordEmbedding = new WordEmbedding();
  if (Array.isArray(episode.tags)) {
    wordEmbedding.addWordTags(episode.tags, 'episode.tags');
  }

  const textEmbedding = new TextEmbedding(wordEmbedding, new TinySegmenter());
  const matrixBuilder = new MatrixBuilder({ textEmbedding, wordEmbedding });
  const dataRows = matrixBuilder.collectDataRows({ staticSource: episode });
  const { blocks } = matrixBuilder.buildWordVectorBlocks(dataRows);

  return matrixBuilder.buildCacheMeta(blocks);
}

export function buildEpisodeRowFeatures(episode) {
  ensureEpisodeData(episode, '<input>');

  const wordEmbedding = new WordEmbedding();
  if (Array.isArray(episode.tags)) {
    wordEmbedding.addWordTags(episode.tags, 'episode.tags');
  }

  const textEmbedding = new TextEmbedding(wordEmbedding, new TinySegmenter());
  const matrixBuilder = new MatrixBuilder({ textEmbedding, wordEmbedding });
  const dataRows = matrixBuilder.collectDataRows({ staticSource: episode });
  const { blocks, indexMap } = matrixBuilder.buildWordVectorBlocks(dataRows);
  const vectors = blocks.flat();
  const rowIndexes = indexMap.flat();
  const vocab = Array.from(new Set(vectors.flatMap((vector) => Object.keys(vector)))).sort();

  const rows = vectors.map((vector, index) => {
    const sourceRow = dataRows[rowIndexes[index]]?.row;
    const role = Array.isArray(sourceRow) ? sourceRow[0] : '';
    const textIndex = Array.isArray(episode.columns) ? episode.columns.indexOf('text') : 1;
    const text = Array.isArray(sourceRow) ? sourceRow[textIndex === -1 ? 1 : textIndex] : '';
    return {
      label: `${rowIndexes[index]}:${role}:${text}`,
      values: vocab.map((token) => vector[token] || 0),
    };
  });

  return { vocab, rows };
}

function normalizeVector(vector) {
  const norm = Math.sqrt(Object.values(vector).reduce((sum, value) => sum + value ** 2, 0));
  if (norm === 0) {
    return vector;
  }
  return Object.fromEntries(Object.entries(vector).map(([key, value]) => [key, value / norm]));
}

function prefixVector(prefix, vector) {
  if (!vector || typeof vector !== 'object' || Array.isArray(vector)) {
    return {};
  }
  return Object.fromEntries(Object.entries(vector)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([key, value]) => [`${prefix}:${key}`, value]));
}

function arrayVector(prefix, values) {
  return Object.fromEntries((Array.isArray(values) ? values : [])
    .filter((value) => typeof value === 'number' && Number.isFinite(value))
    .map((value, index) => [`${prefix}:${index}`, value]));
}

function addWeightedVector(target, vector, weight) {
  for (const [key, value] of Object.entries(normalizeVector(vector))) {
    target[key] = value * weight;
  }
}

export function buildEpisodeFinalRowFeatures(episode, commonFeatureTags = []) {
  ensureEpisodeData(episode, '<input>');

  const wordEmbedding = new WordEmbedding();
  addTagSets(wordEmbedding, [episode.tags, ...commonFeatureTags]);

  const textEmbedding = new TextEmbedding(wordEmbedding, new TinySegmenter());
  const matrixBuilder = new MatrixBuilder({ textEmbedding, wordEmbedding });
  const dataRows = matrixBuilder.collectDataRows({ staticSource: episode });
  const { blocks, indexMap } = matrixBuilder.buildWordVectorBlocks(dataRows);
  const attentionBlocks = new AttentionEmbedding().buildAttentionVectors(blocks);
  const attentionByRow = new Map();
  indexMap.forEach((blockIndexes, blockIndex) => {
    blockIndexes.forEach((rowIndex, vectorIndex) => {
      attentionByRow.set(rowIndex, attentionBlocks[blockIndex]?.[vectorIndex] || {});
    });
  });

  const columns = Array.isArray(episode.columns) ? episode.columns : [];
  const weights = episode.factor?.weight || {};
  const featureExtractor = new FeatureExtractor(commonFeatureTags.flat());
  const continuousMaximums = Object.fromEntries(columns.map((column, columnIndex) => {
    const maximum = Math.max(0, ...episode.data
      .filter(Array.isArray)
      .map((row) => row[columnIndex])
      .filter((value) => typeof value === 'number' && Number.isFinite(value)));
    return [column, maximum];
  }));

  const rows = dataRows.filter((item) => !item.separator && Array.isArray(item.row)).map((item) => {
    const values = {};
    columns.forEach((column, columnIndex) => {
      const value = item.row[columnIndex];
      const weight = typeof weights[column] === 'number' ? weights[column] : 1;
      let vector;

      if (column === 'text') {
        vector = prefixVector(column, textEmbedding.embedText(typeof value === 'string' ? value.trim() : ''));
      } else if (column === 'date') {
        vector = arrayVector(column, featureExtractor.extractDate(value));
      } else if (column === 'time') {
        vector = arrayVector(column, featureExtractor.extractTime(value));
      } else if (column === 'emo') {
        vector = arrayVector(column, featureExtractor.extractEmotion(value));
      } else if (typeof value === 'number') {
        vector = arrayVector(column, featureExtractor.extractContinuous(value, continuousMaximums[column]));
      } else {
        vector = prefixVector(column, wordEmbedding.getEmbedding(value));
      }

      addWeightedVector(values, vector, weight);
    });

    addWeightedVector(values, prefixVector('attention', attentionByRow.get(item.index)),
      typeof weights.text === 'number' ? weights.text : 1);
    const roleIndex = columns.indexOf('role');
    const textIndex = columns.indexOf('text');
    const role = item.row[roleIndex === -1 ? 0 : roleIndex] || '';
    const text = item.row[textIndex === -1 ? 1 : textIndex] || '';
    return { label: `${item.index}:${role}:${text}`, vector: normalizeVector(values) };
  });

  const vocab = Array.from(new Set(rows.flatMap(({ vector }) => Object.keys(vector)))).sort();
  return {
    vocab,
    rows: rows.map(({ label, vector }) => ({
      label,
      values: vocab.map((feature) => vector[feature] || 0),
    })),
  };
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function matrixToCsv({ vocab, matrix }) {
  const header = ['token', ...vocab].map(escapeCsv).join(',');
  const rows = matrix.map((row, index) => [vocab[index], ...row].map(escapeCsv).join(','));
  return `${[header, ...rows].join('\n')}\n`;
}

export function rowFeaturesToCsv({ vocab, rows }) {
  const header = ['conversation_row', ...vocab].map(escapeCsv).join(',');
  const csvRows = rows.map(({ label, values }) => [label, ...values].map(escapeCsv).join(','));
  return `${[header, ...csvRows].join('\n')}\n`;
}

function defaultOutputPath(inputPath, format) {
  const parsedPath = path.parse(inputPath);
  const suffix = format === 'token-matrix' ? 'matrix' : format;
  const filename = `${parsedPath.name.replace(/\.episode$/u, '')}.episode.${suffix}.csv`;
  return path.join(process.cwd(), 'tmp', filename);
}

export async function dumpEpisodeMatrix(inputPath, {
  format = 'token-matrix',
  outputPath,
  commonFeatureTags,
} = {}) {
  const resolvedInputPath = path.resolve(inputPath);
  const resolvedOutputPath = path.resolve(outputPath || defaultOutputPath(inputPath, format));
  const rawEpisode = await readFile(resolvedInputPath, 'utf8');

  let episode;
  try {
    episode = JSON.parse(rawEpisode);
  } catch (error) {
    throw new Error(`Invalid JSON in ${resolvedInputPath}: ${error.message}`);
  }

  ensureEpisodeData(episode, resolvedInputPath);
  const resolvedCommonFeatureTags = format === 'final-row-features'
    ? commonFeatureTags || await loadCommonFeatureTags()
    : [];
  const matrixData = format === 'token-matrix'
    ? buildEpisodeMatrix(episode)
    : format === 'final-row-features'
      ? buildEpisodeFinalRowFeatures(episode, resolvedCommonFeatureTags)
      : buildEpisodeRowFeatures(episode);
  const csv = format === 'token-matrix'
    ? matrixToCsv(matrixData)
    : rowFeaturesToCsv(matrixData);
  await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
  await writeFile(resolvedOutputPath, csv, 'utf8');

  return {
    inputPath: resolvedInputPath,
    outputPath: resolvedOutputPath,
    rows: format === 'token-matrix' ? matrixData.matrix.length : matrixData.rows.length,
    columns: matrixData.vocab.length,
    format,
  };
}

async function main() {
  try {
    const { inputPath, outputPath, format } = parseArguments(process.argv.slice(2));
    const result = await dumpEpisodeMatrix(inputPath, { format, outputPath });
    console.log(`Wrote ${result.rows}x${result.columns} ${result.format} CSV to ${result.outputPath}`);
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}