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
});
