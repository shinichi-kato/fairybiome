import { describe, it, expect, vi } from 'vitest';
import EpisodePart from './EpisodePart.js';

describe('EpisodePart', () => {
  it('initializes with bot and part metadata and exposes the lifecycle API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        factor: { precision: 0.1 },
        columns: ['role', 'text'],
        data: [
          ['bot', 'hello'],
          ['user', 'hi'],
          null,
        ],
      }),
    });

    const part = new EpisodePart();
    const initialized = await part.init('demo-bot', 'greeting');

    expect(initialized).toBe(true);
    expect(part.botName).toBe('demo-bot');
    expect(part.partName).toBe('greeting');
    expect(typeof part.receive).toBe('function');
    expect(part.activate().status).toBe('ok');

    fetchSpy.mockRestore();
  });

  it('reads emotion from its configured column instead of a fixed row index', () => {
    const part = new EpisodePart();
    part.botName = 'demo-bot';
    part.partName = 'greeting';
    part.columns = ['role', 'text', 'date', 'time', 'emo', 'target', 'facing', 'location'];
    vi.spyOn(part, 'receive').mockReturnValue({
      status: 'ok',
      row: ['bot', 'おはよ〜。早起きだねえ。', null, '05:00', 'joy', 'other', 'face', 'public'],
      score: 0.8,
    });

    const [message] = part.input({ text: 'おはよう！' });

    expect(message.emo).toBe('joy');
  });
});
