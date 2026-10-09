import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatBiomebot } from './kernel.js';

describe('ChatBiomebot', () => {
  let worker;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    worker = {
      postMessage: vi.fn(event => {
        if (event.type === 'init') {
          worker.onmessage?.({ data: { type: 'initialized' } });
        }
        if (event.type === 'deploy') {
          worker.onmessage?.({ data: { type: 'deployed' } });
        }
        if (event.type === 'activate') {
          worker.onmessage?.({ data: { type: 'activated' } });
        }
      }),
      terminate: vi.fn(),
      onerror: null,
      onmessageerror: null,
    };
    global.Worker = class {
      constructor() {
        return worker;
      }
    };
  });

  it('builds the avatar file dictionary preferring png over svg', async () => {
    const bot = new ChatBiomebot({ aurula: [
      '/static/bots/aurula/avatar/neutral.png',
      '/static/bots/aurula/avatar/neutral.svg',
      '/static/bots/aurula/avatar/joy.svg',
    ] });

    const result = await bot.deploy('aurula');
    expect(result.avatarFiles).toEqual({ neutral: 'neutral.png', joy: 'joy.svg' });
  });

  it('deploys workers and returns the display metadata required by ChatUI', async () => {
    const bot = new ChatBiomebot({ aurula: ['static/bots/aurula/greeting.episode.json'] });

    await expect(bot.deploy('aurula')).resolves.toEqual({
      botName: 'aurula',
      displayName: 'aurula',
      backgroundColor: '#DDDDDD',
      avatarFiles: {},
    });
    expect(worker.postMessage).toHaveBeenNthCalledWith(1, { type: 'init', botName: 'aurula', partName: 'greeting.episode' });
    expect(worker.postMessage).toHaveBeenNthCalledWith(2, { type: 'deploy', botName: 'aurula', partName: 'greeting.episode' });
    expect(worker.postMessage).toHaveBeenNthCalledWith(3, { type: 'activate', botName: 'aurula', partName: 'greeting.episode' });
    expect(console.log).toHaveBeenCalledWith('[ChatBiomebot] Starting aurula');
    expect(console.log).toHaveBeenCalledWith('[ChatBiomebot] Started aurula');
    expect(console.log).toHaveBeenCalledWith('[ChatBiomebot] Activated aurula:greeting.episode');
  });

  it('reports Worker startup errors', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const bot = new ChatBiomebot({ aurula: ['static/bots/aurula/greeting.episode.json'] });
    await bot.deploy('aurula');

    worker.onerror({ message: 'failed to load Worker' });

    expect(error).toHaveBeenCalledWith('[ChatBiomebot] Worker error aurula:greeting.episode', 'failed to load Worker');
  });

  it('queues input until workers initialize without blocking deployment', async () => {
    worker.postMessage.mockImplementation(() => {});
    const bot = new ChatBiomebot({ aurula: ['static/bots/aurula/greeting.episode.json'] });
    await expect(bot.deploy('aurula')).resolves.toMatchObject({ botName: 'aurula' });
    const channel = bot.broadcastChannels.get('aurula');
    const postMessage = vi.spyOn(channel, 'postMessage');

    await bot.input('aurula', { messageId: 'first', text: 'こんにちは' });
    expect(postMessage).not.toHaveBeenCalled();

    worker.onmessage({ data: { type: 'initialized' } });
    expect(postMessage).not.toHaveBeenCalledWith({ type: 'input', turnId: 'first', message: { messageId: 'first', text: 'こんにちは' } });

    worker.onmessage({ data: { type: 'deployed' } });
    expect(postMessage).not.toHaveBeenCalledWith({ type: 'input', turnId: 'first', message: { messageId: 'first', text: 'こんにちは' } });

    worker.onmessage({ data: { type: 'activated' } });
    expect(postMessage).toHaveBeenCalledWith({ type: 'input', turnId: 'first', message: { messageId: 'first', text: 'こんにちは' } });
  });

  it('adds display and correlation fields before delivering a Bot reply callback', async () => {
    const bot = new ChatBiomebot({ aurula: [] });
    const callback = vi.fn();
    bot.replyCallbackFunction = callback;
    await bot.deploy('aurula');
    await bot.input('aurula', { messageId: 'user-message-1', text: 'こんにちは' });

    bot._handleBroadcast('aurula', { type: 'output', turnId: 'user-message-1', message: { text: 'やあ', emo: 'happy' } });

    expect(callback).toHaveBeenCalledWith('aurula', expect.objectContaining({
      role: 'bot', text: 'やあ', avatar: 'happy', emo: 'happy', replyTo: 'user-message-1',
    }));
  });

  it('decodes tags in the output before delivering a Bot reply callback', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tags: {
          '{bot}': ['アウルラ'],
          '{you}': ['あなた', '{user}さん'],
        },
      }),
    });
    const bot = new ChatBiomebot({ aurula: ['static/bots/Aurula/main.tags.json'] });
    const callback = vi.fn();
    bot.replyCallbackFunction = callback;
    bot.botDisplayNames.set('aurula', 'アウルラ');

    try {
      await bot.deploy('aurula');
      await bot.input('aurula', { messageId: 'user-message-1', displayName: 'たろう', text: 'こんにちは' });

      bot._handleBroadcast('aurula', {
        type: 'output',
        turnId: 'user-message-1',
        message: { text: '{bot}さん、{user}さん。{you}です。' },
      });

      expect(callback).toHaveBeenCalledWith('aurula', expect.objectContaining({
        text: 'アウルラさん、たろうさん。あなたです。',
      }));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('queues input until the current reply arrives', async () => {
    const bot = new ChatBiomebot({ aurula: [] });
    await bot.deploy('aurula');
    const channel = bot.broadcastChannels.get('aurula');
    const postMessage = vi.spyOn(channel, 'postMessage');

    await bot.input('aurula', { messageId: 'first', text: '一つ目' });
    await bot.input('aurula', { messageId: 'second', text: '二つ目' });
    expect(postMessage).toHaveBeenCalledTimes(1);

    bot._handleBroadcast('aurula', { type: 'output', turnId: 'first', message: { text: '返信' } });
    expect(postMessage).toHaveBeenCalledTimes(2);
  });
});