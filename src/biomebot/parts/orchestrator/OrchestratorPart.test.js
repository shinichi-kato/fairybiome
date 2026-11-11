import { describe, it, expect, vi } from 'vitest';

import { OrchestratorPart } from './OrchestratorPart.js';
import { Message } from '../../../Message.js';

describe('OrchestratorPart', () => {
  it('returns an empty output when there are no inner speech candidates', () => {
    const part = new OrchestratorPart();

    const result = part.integrate();

    expect(result).toMatchObject({
      type: 'output',
      message: null,
      props: { partNames: [] },
    });
  });

  it('prefers the stronger self message and merges part names when both self and other exist', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const part = new OrchestratorPart();
    part.innerVoicePool = [
      new Message({
        role: 'bot',
        text: 'other message',
        target: 'other',
        emo: 'neutral',
        props: { score: 8, partNames: ['episode'], botName: 'demo' },
      }),
      new Message({
        role: 'bot',
        text: 'self message',
        target: 'self',
        emo: 'happy',
        props: { score: 10, partNames: ['orchestrator'], botName: 'demo' },
      }),
    ];

    const result = part.integrate();

    expect(result.message.text).toBe('other message');
    expect(result.message.emo).toBe('happy');
    expect(result.props.partNames).toEqual(expect.arrayContaining(['episode', 'orchestrator']));

    vi.restoreAllMocks();
  });

  it('preserves the other emotion when the stronger self message has no emotion', () => {
    const part = new OrchestratorPart();
    part.innerVoicePool = [
      new Message({
        role: 'bot',
        text: 'other message',
        target: 'other',
        emo: 'joy',
        props: { score: 8, partNames: ['episode'], botName: 'demo' },
      }),
      new Message({
        role: 'bot',
        text: 'self message',
        target: 'self',
        emo: null,
        props: { score: 10, partNames: ['orchestrator'], botName: 'demo' },
      }),
    ];

    const result = part.integrate();

    expect(result.message.emo).toBe('joy');
  });

  it('penalizes recently selected episode parts when ranking candidates', () => {
    const part = new OrchestratorPart();
    part.partName = 'orchestrator';
    part.factor = {
      refractory: 0.5,
      penalty: { repetition: 6 },
    };
    part.recordOutput(new Message({
      role: 'bot',
      text: 'greeting',
      props: { partNames: ['greeting.episode', 'orchestrator'] },
    }));
    part.innerVoicePool = [
      new Message({
        role: 'bot',
        text: 'greeting again',
        target: 'other',
        props: { score: 10, partNames: ['greeting.episode'] },
      }),
      new Message({
        role: 'bot',
        text: 'fortune',
        target: 'other',
        props: { score: 8, partNames: ['fortune.episode'] },
      }),
    ];

    const result = part.integrate();

    expect(result.message.text).toBe('fortune');
  });

  it('records only topic parts and keeps the most recent eight outputs', () => {
    const part = new OrchestratorPart();
    part.partName = 'orchestrator';

    for (let index = 0; index < 9; index += 1) {
      part.recordOutput(new Message({
        props: { partNames: [`episode-${index}`, 'orchestrator'] },
      }));
    }
    part.recordOutput(new Message({
      props: { partNames: ['orchestrator'] },
    }));

    expect(part.repetitionMemory).toHaveLength(8);
    expect(part.repetitionMemory[0]).toEqual(['episode-1']);
    expect(part.repetitionMemory.at(-1)).toEqual(['episode-8']);
  });
});
