/**
 * MatrixBuilder.test.js
 *
 * MatrixBuilder の基本動作確認
 */

import { describe, expect, test } from 'vitest';
import { MatrixBuilder } from '../MatrixBuilder.js';

function createTextEmbedding() {
  return {
    embedText(text) {
      const map = {
        'hello': { hello: 1.0 },
        'world': { world: 1.0 },
        'hello world': { hello: 1.0, world: 1.0 },
      };
      return map[text] || { [text]: 1.0 };
    },
  };
}

describe('MatrixBuilder', () => {
  test('collectDataRows は separator を考慮して row を収集する', () => {
    const builder = new MatrixBuilder({ textEmbedding: createTextEmbedding() });

    const staticSource = {
      columns: ['role', 'text'],
      data: [
        ['user', 'hello'],
        'separator',
        ['bot', 'world'],
      ],
    };

    const rows = builder.collectDataRows({ staticSource, firestoreSource: null });

    expect(rows).toHaveLength(3);
    expect(rows[0].text).toBe('hello');
    expect(rows[2].text).toBe('world');
  });

  test('buildWordVectorBlocks は embedding を block として返す', () => {
    const builder = new MatrixBuilder({ textEmbedding: createTextEmbedding() });

    const rows = [
      { separator: false, index: 0, text: 'hello' },
      { separator: false, index: 1, text: 'world' },
    ];

    const { blocks, indexMap } = builder.buildWordVectorBlocks(rows);

    expect(blocks).toHaveLength(1);
    expect(indexMap).toHaveLength(1);
    expect(blocks[0][0]).toMatchObject({ hello: 1.0 });
  });

  test('buildCacheMeta は vocab と matrix を生成する', () => {
    const builder = new MatrixBuilder({ textEmbedding: createTextEmbedding() });

    const wordVector = [
      [{ hello: 1.0 }, { world: 1.0 }],
    ];

    const meta = builder.buildCacheMeta(wordVector);

    expect(meta.vocab).toContain('hello');
    expect(meta.vocab).toContain('world');
    expect(Array.isArray(meta.matrix)).toBe(true);
    expect(meta.matrix[0]).toHaveLength(meta.vocab.length);
  });

  test('buildRowFeatureVectors は列ごとの特徴量とattentionを重み付け・正規化して合成する', () => {
    const textEmbedding = createTextEmbedding();
    const wordEmbedding = {
      getEmbedding(surface) {
        return surface === 'other' ? { other: 1.0 } : undefined;
      },
    };
    const featureExtractor = {
      extractDate: () => [0, 1],
      extractTime: () => [1, 0],
      extractEmotion: () => [0, 0],
      extractContinuous: () => [0, 0],
    };
    const builder = new MatrixBuilder({ textEmbedding, wordEmbedding, featureExtractor });

    const dataRows = [
      { separator: false, index: 0, text: 'hello', row: ['bot', 'hello', 'other', '10/12'] },
      { separator: false, index: 1, text: 'world', row: ['user', 'world', 'other', '10/12'] },
    ];
    const columns = ['role', 'text', 'target', 'date'];
    const factor = { weight: { role: 0, text: 1, target: 1, date: 1 } };
    const { blocks, indexMap } = builder.buildWordVectorBlocks(dataRows);
    const attentionVectors = blocks.map((block) => block.map(() => ({})));
    attentionVectors[0][1] = { hello: 1.0 }; // 2行目は1行目にattentionで畳み込まれたと仮定

    const { rowVectors, vocab } = builder.buildRowFeatureVectors({
      dataRows,
      columns,
      factor,
      attentionVectors,
      indexMap,
    });

    expect(rowVectors.size).toBe(2);
    const firstVector = rowVectors.get(0);
    const secondVector = rowVectors.get(1);

    // role は語彙埋め込みが無くても one-hot で含まれる(重み0なので値は0)
    expect(Object.keys(firstVector).some((key) => key.startsWith('role:'))).toBe(true);
    expect(Object.keys(firstVector).some((key) => key.startsWith('text:'))).toBe(true);
    expect(Object.keys(firstVector).some((key) => key.startsWith('target:'))).toBe(true);
    expect(Object.keys(firstVector).some((key) => key.startsWith('date:'))).toBe(true);
    expect(Object.keys(secondVector).some((key) => key.startsWith('attention:'))).toBe(true);

    // L2正規化されている(ノルム=1)
    const norm = Math.sqrt(Object.values(firstVector).reduce((sum, v) => sum + v ** 2, 0));
    expect(norm).toBeCloseTo(1, 5);

    expect(vocab.length).toBeGreaterThan(0);
  });
});
