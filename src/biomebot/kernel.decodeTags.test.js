import { describe, it, expect } from 'vitest';
import { Biomebot } from './kernel.js';

describe('Biomebot._decodeTags', () => {
  it('replaces "{user}" with the current user name', () => {
    const kernel = Object.create(Biomebot.prototype);
    kernel.currentUserName = 'たろう';
    kernel.tags = {
      demo: {
        decode: {},
        tagNames: {},
      },
    };

    const result = kernel._decodeTags('demo', 'こんにちは{user}さん');

    expect(result).toBe('こんにちはたろうさん');
  });

  it('returns text unchanged when the bot has no tags', () => {
    const kernel = Object.create(Biomebot.prototype);
    kernel.currentUserName = 'たろう';
    kernel.tags = {};

    const result = kernel._decodeTags('unknown', 'こんにちは{user}さん');

    expect(result).toBe('こんにちは{user}さん');
  });
});
