/**
 * Retriever.test.js
 *
 * Retriever の基本動作確認
 */

import { describe, expect, test } from 'vitest';
import { Retriever } from '../Retriever.js';

describe('Retriever', () => {
  test('vectorDot は内積を返す', () => {
    const retriever = new Retriever();

    const a = { a: 1, b: 2 };
    const b = { a: 3, b: 4 };

    expect(retriever.vectorDot(a, b)).toBe(11);
  });

  test('getTextIndex は text 列を返す', () => {
    const retriever = new Retriever();
    const index = retriever.getTextIndex({
      staticSource: {
        columns: ['role', 'text', 'target'],
      },
    });

    expect(index).toBe(1);
  });

  test('hasNextDataRow は次の行があるか判定する', () => {
    const retriever = new Retriever();

    const dataRows = [
      { separator: false, row: ['user', 'hello'] },
      { separator: false, row: ['bot', 'goodbye'] },
    ];

    expect(retriever.hasNextDataRow(0, dataRows)).toBe(true);
    expect(retriever.hasNextDataRow(1, dataRows)).toBe(false);
  });

  test('findNextBotRow はuser行を飛ばしセパレータを跨がずbot行を探す', () => {
    const retriever = new Retriever();
    const dataRows = [
      { separator: false, row: ['bot', 'a'] },
      { separator: false, row: ['user', 'b'] },
      { separator: false, row: ['user', 'c'] },
      { separator: false, row: ['bot', 'd'] },
      { separator: true },
      { separator: false, row: ['bot', 'e'] },
    ];

    expect(retriever.findNextBotRow(1, dataRows, 0)).toEqual({ index: 3, row: ['bot', 'd'] });
    expect(retriever.findNextBotRow(3, dataRows, 0)).toBeNull();
  });

  test('retrieve は候補を score と row で返す', () => {
    const retriever = new Retriever();
    const rowVectors = new Map([
      [0, { a: 1, b: 0 }],
      [1, { a: 0.5, b: 0.5 }],
    ]);
    const dataRows = [
      { separator: false, row: ['user', 'hello'], index: 0 },
      { separator: false, row: ['bot', 'world'], index: 1 },
      { separator: false, row: ['bot', 'fallback'], index: 2 },
    ];

    const result = retriever.retrieve({
      message: 'hello',
      messageVector: { a: 1, b: 0 },
      rowVectors,
      dataRows,
      totalPrecision: 0,
      textIndex: 1,
      verbose: false,
    });

    expect(result.status).toBe('ok');
    expect(Array.isArray(result.row)).toBe(true);
  });

  test('retrieve は既知のroleが不一致ならrole penaltyを閾値判定前に適用する', () => {
    const retriever = new Retriever();
    const dataRows = [
      { separator: false, row: ['bot', 'hello'], text: 'hello', index: 0 },
      { separator: false, row: ['user', 'reply'], text: 'reply', index: 1 },
    ];

    const result = retriever.retrieve({
      message: 'hello',
      messageRole: 'user',
      messageVector: { 'role:user': 0.6, 'text:hello': 0.8 },
      rowVectors: new Map([[0, { 'role:bot': 0.6, 'text:hello': 0.8 }]]),
      dataRows,
      totalPrecision: 0.5,
      roleIndex: 0,
      rolePenalty: -0.4,
      verbose: true,
    });

    expect(result.status).toBe('low score');
    expect(result.message).toMatch(/^score: 0\.24\d*, rowIndex: 0/);
  });

  test('retrieve は一致、欠落、未知のroleにはrole penaltyを適用しない', () => {
    const retriever = new Retriever();
    const dataRows = [
      { separator: false, row: ['user', 'hello'], text: 'hello', index: 0 },
      { separator: false, row: ['bot', 'reply'], text: 'reply', index: 1 },
    ];
    const common = {
      message: 'hello',
      messageVector: { 'role:user': 0.6, 'text:hello': 0.8 },
      rowVectors: new Map([[0, { 'role:user': 0.6, 'text:hello': 0.8 }]]),
      dataRows,
      totalPrecision: 0.5,
      roleIndex: 0,
      rolePenalty: -0.4,
    };

    const matchingRole = retriever.retrieve({ ...common, messageRole: 'user' });
    const missingRole = retriever.retrieve({ ...common, messageRole: null });
    const unknownRole = retriever.retrieve({
      ...common,
      messageRole: 'visitor',
      messageVector: { 'role:visitor': 0.6, 'text:hello': 0.8 },
    });

    expect(matchingRole.score).toBe(1);
    expect(missingRole.score).toBe(1);
    expect(unknownRole.score).toBeCloseTo(0.64);
  });

  test('retrieve はrole weightが0またはpenalty未設定なら減点しない', () => {
    const retriever = new Retriever();
    const dataRows = [
      { separator: false, row: ['bot', 'hello'], text: 'hello', index: 0 },
      { separator: false, row: ['bot', 'reply'], text: 'reply', index: 1 },
    ];
    const common = {
      message: 'hello',
      messageRole: 'user',
      messageVector: { 'role:user': 0.6, 'text:hello': 0.8 },
      rowVectors: new Map([[0, { 'role:bot': 0.6, 'text:hello': 0.8 }]]),
      dataRows,
      totalPrecision: 0.5,
      roleIndex: 0,
    };

    const noPenalty = retriever.retrieve(common);
    const disabledRole = retriever.retrieve({ ...common, rolePenalty: -0.4, roleWeight: 0 });

    expect(noPenalty.score).toBeCloseTo(0.64);
    expect(disabledRole.score).toBeCloseTo(0.64);
  });

  test('retrieve はslot調整後にrole penaltyを適用する', () => {
    const retriever = new Retriever();
    const dataRows = [
      { separator: false, row: ['bot', '{UNKNOWN_1}'], text: '{UNKNOWN_1}', index: 0 },
      { separator: false, row: ['user', 'reply'], text: 'reply', index: 1 },
    ];

    const result = retriever.retrieve({
      message: 'hello',
      messageRole: 'user',
      messageVector: { 'role:user': 0.6, 'text:hello': 0.8 },
      rowVectors: new Map([[0, { 'role:bot': 0.6, 'text:hello': 0.8 }]]),
      dataRows,
      totalPrecision: 0.7,
      roleIndex: 0,
      rolePenalty: -0.2,
      verbose: true,
    });

    expect(result.status).toBe('low score');
    expect(result.message).toMatch(/^score: 0\.62\d*, rowIndex: 0/);
  });

  test('retrieve はスロットに未知語を捕捉して返信の明示 placeholder を置換する', () => {
    const tokens = ['貂', '犬', 'を', '見た', 'こと', 'が', 'ある'];
    const textEmbedding = {
      segmentText: (text) => tokens.filter((token) => text.includes(token)),
      _isParticle: (token) => token === 'を' || token === 'が',
    };
    const retriever = new Retriever({ textEmbedding });
    const dataRows = [
      { separator: false, row: ['user', '{UNKNOWN_1}を見たことがある'], text: '{UNKNOWN_1}を見たことがある', index: 0 },
      { separator: false, row: ['bot', '{UNKNOWN_1}なんだね'], index: 1 },
    ];

    const result = retriever.retrieve({
      message: '貂を見たことがある',
      messageVector: { context: 1 },
      rowVectors: new Map([[0, { context: 1 }]]),
      dataRows,
      totalPrecision: 0.5,
      textIndex: 1,
    });

    expect(result).toMatchObject({
      status: 'ok',
      row: ['bot', '貂なんだね'],
      score: 1,
    });
  });

  test('retrieve はスロット直後の助詞に対応する語がない候補を選ばない', () => {
    const textEmbedding = {
      segmentText: (text) => text.split(/(?=を)|(?<=を)/u).filter(Boolean),
      _isParticle: (token) => token === 'を',
    };
    const retriever = new Retriever({ textEmbedding });
    const dataRows = [
      { separator: false, row: ['user', '{UNKNOWN_1}を見た'], text: '{UNKNOWN_1}を見た', index: 0 },
      { separator: false, row: ['bot', '{UNKNOWN_1}'], index: 1 },
    ];

    const result = retriever.retrieve({
      message: 'を見た',
      messageVector: { context: 1 },
      rowVectors: new Map([[0, { context: 1 }]]),
      dataRows,
      totalPrecision: 0,
      textIndex: 1,
    });

    expect(result).toBeNull();
  });

  test('retrieve は「って」「だよ」の前にあるUNKNOWNを返信へ復元する', () => {
    const retriever = new Retriever();
    const examples = [
      {
        prompt: '{UNKNOWN_1}って思った。',
        input: '異世界系って思った。',
        reply: '{UNKNOWN_1}って思ったんだね。',
        expected: '異世界系って思ったんだね。',
      },
      {
        prompt: '{UNKNOWN_1}だよ',
        input: '宿題だよ',
        reply: '{UNKNOWN_1}って何？',
        expected: '宿題って何？',
      },
    ];

    for (const example of examples) {
      const dataRows = [
        { separator: false, row: ['user', example.prompt], text: example.prompt, index: 0 },
        { separator: false, row: ['bot', example.reply], index: 1 },
      ];
      const result = retriever.retrieve({
        message: example.input,
        messageVector: { context: 1 },
        rowVectors: new Map([[0, { context: 1 }]]),
        dataRows,
        totalPrecision: 0.4,
      });

      expect(result.row[1]).toBe(example.expected);
    }
  });

  test('rewriteTextWithUnknownSlots は未取得のUNKNOWNを「それ」に置き換える', () => {
    const retriever = new Retriever();

    expect(retriever.rewriteTextWithUnknownSlots('{UNKNOWN_1}って何？')).toBe('それって何？');
  });

  describe('applyRepetitionPenalty', () => {
    const textEmbedding = {
      embedText: (text) => (text.startsWith('A') ? { a: 1 } : { b: 1 }),
    };
    const dataRows = [
      { index: 0, text: 'A1' },
      { index: 1, text: 'B1' },
    ];
    const candidates = [
      { rowIndex: 0, score: 0.9 },
      { rowIndex: 1, score: 0.8 },
    ];
    const base = { alpha: 0.5, lambda: 1, baseline: 0.3 };

    test('直近の類似発言を抑制し、順位を入れ替える', () => {
      const retriever = new Retriever({ textEmbedding });
      const ranked = retriever.applyRepetitionPenalty(candidates, dataRows, {
        ...base,
        memories: [{ vector: { a: 1 }, dt: 1 }],
      });
      // penalty = (1-0.3)*0.5 = 0.35
      expect(ranked.map((c) => c.rowIndex)).toEqual([1, 0]);
      expect(ranked[1].adjustedScore).toBeCloseTo(0.55);
    });

    test('時間が経つと減衰して元の順位に戻る', () => {
      const retriever = new Retriever({ textEmbedding });
      const ranked = retriever.applyRepetitionPenalty(candidates, dataRows, {
        ...base,
        memories: [{ vector: { a: 1 }, dt: 6 }],
      });
      expect(ranked.map((c) => c.rowIndex)).toEqual([0, 1]);
    });

    test('ベースライン以下の類似度は無視し、記憶なしなら何もしない', () => {
      const retriever = new Retriever({ textEmbedding });
      const unrelated = retriever.applyRepetitionPenalty(candidates, dataRows, {
        ...base,
        memories: [{ vector: { c: 1 }, dt: 1 }],
      });
      expect(unrelated.map((c) => c.adjustedScore)).toEqual([0.9, 0.8]);
      expect(retriever.applyRepetitionPenalty(candidates, dataRows, { ...base, memories: [] })).toBe(candidates);
    });
  });
});
