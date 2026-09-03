import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { dumpEpisodeMatrix } from './dumpEpisodeMatrix.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe('dumpEpisodeMatrix', () => {
  it('writes a labeled square CSV that pandas can load with index_col=0', async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'fairybiome-matrix-'));
    temporaryDirectories.push(temporaryDirectory);
    const episodePath = path.join(temporaryDirectory, 'sample.episode.json');
    const outputPath = path.join(temporaryDirectory, 'sample.csv');
    await writeFile(episodePath, JSON.stringify({
      tags: [{ surfaces: ['greeting'], embedding: { hello: 1 } }],
      columns: ['role', 'text'],
      data: [
        ['user', 'greeting world'],
        ['bot', 'hello'],
      ],
    }), 'utf8');

    const result = await dumpEpisodeMatrix(episodePath, { outputPath });
    const csv = await readFile(outputPath, 'utf8');
    const lines = csv.trimEnd().split('\n');
    const header = lines[0].split(',');

    expect(result.rows).toBe(result.columns);
    expect(lines).toHaveLength(result.rows + 1);
    expect(header[0]).toBe('"token"');
    expect(header).toContain('"hello"');
    expect(lines[1].split(',')).toHaveLength(result.columns + 1);
  });

  it('writes one feature vector per conversation row', async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'fairybiome-row-features-'));
    temporaryDirectories.push(temporaryDirectory);
    const episodePath = path.join(temporaryDirectory, 'sample.episode.json');
    const outputPath = path.join(temporaryDirectory, 'rows.csv');
    await writeFile(episodePath, JSON.stringify({
      tags: [{ surfaces: ['greeting'], embedding: { hello: 1 } }],
      columns: ['role', 'text'],
      data: [
        ['user', 'greeting world'],
        null,
        ['bot', 'hello'],
      ],
    }), 'utf8');

    const result = await dumpEpisodeMatrix(episodePath, { format: 'row-features', outputPath });
    const csv = await readFile(outputPath, 'utf8');
    const lines = csv.trimEnd().split('\n');

    expect(result.format).toBe('row-features');
    expect(result.rows).toBe(2);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('"conversation_row"');
    expect(lines[1]).toContain('"0:user:greeting world"');
    expect(lines[2]).toContain('"2:bot:hello"');
  });

  it('writes normalized final row vectors with attention and non-text features', async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'fairybiome-final-row-features-'));
    temporaryDirectories.push(temporaryDirectory);
    const episodePath = path.join(temporaryDirectory, 'sample.episode.json');
    const outputPath = path.join(temporaryDirectory, 'final-rows.csv');
    await writeFile(episodePath, JSON.stringify({
      tags: [
        { surfaces: ['bot'], embedding: { speaker: 1 } },
        { surfaces: ['hello'], embedding: { greeting: 1 } },
      ],
      factor: { weight: { role: 0.5, text: 1, date: 0.25, emo: 0.5, barometer: 0.75 } },
      columns: ['role', 'text', 'date', 'emo', 'barometer'],
      data: [
        ['bot', 'hello', '10/12', 'happy', 1000],
        ['bot', 'hello', '10/12', 'happy', 900],
      ],
    }), 'utf8');

    const commonFeatureTags = [[{ surfaces: ['happy'], embedding: { emo_sin: 0, emo_cos: 1 } }]];
    const result = await dumpEpisodeMatrix(episodePath, { format: 'final-row-features', outputPath, commonFeatureTags });
    const csv = await readFile(outputPath, 'utf8');
    const [header, ...csvRows] = csv.trimEnd().split('\n').map((line) => line.split(',').map((value) => value.slice(1, -1)));
    const featureIndexes = Object.fromEntries(header.map((feature, index) => [feature, index]));

    expect(result.format).toBe('final-row-features');
    expect(result.rows).toBe(2);
    expect(header).toContain('attention:greeting');
    expect(header).toContain('role:speaker');
    expect(header).toContain('date:0');
    expect(header).toContain('emo:1');
    expect(header).toContain('barometer:4');
    expect(Number(csvRows[0][featureIndexes['attention:greeting']])).toBe(0);
    expect(Number(csvRows[1][featureIndexes['attention:greeting']])).toBeGreaterThan(0);
    csvRows.forEach((row) => {
      const norm = Math.sqrt(row.slice(1).reduce((sum, value) => sum + Number(value) ** 2, 0));
      expect(norm).toBeCloseTo(1);
    });
  });
});