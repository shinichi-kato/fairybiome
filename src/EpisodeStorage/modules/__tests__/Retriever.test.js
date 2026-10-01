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
});
