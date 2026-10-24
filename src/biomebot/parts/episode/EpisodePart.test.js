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

  it('expands outputTags recursively and keeps each tag value fixed', () => {
    const part = new EpisodePart();
    part._loadOutputTags({
      '{animal}': ['柴犬', '白猫'],
      '{where}': ['公園'],
      '{card}': ['{animal}が{where}にいる'],
    });
    part.rng = () => 0.99;
    expect(part.expandOutputTags('{card}と{animal}')).toBe('白猫が公園にいると白猫');
    part.rng = () => 0;
    expect(part.expandOutputTags('{animal}')).toBe('白猫');
  });

  it('stops expanding self-referencing tags at the depth limit', () => {
    const part = new EpisodePart();
    part._loadOutputTags({ '{a}': ['{a}の'] });
    expect(() => part.expandOutputTags('{a}')).not.toThrow();
  });

  it('reports invalid outputTags', () => {
    const part = new EpisodePart();
    part._loadOutputTags({ '{x}': [] });
    expect(part.outputTags).toEqual({});
    expect(part.engine.loadErrors?.length).toBe(1);
  });
});
