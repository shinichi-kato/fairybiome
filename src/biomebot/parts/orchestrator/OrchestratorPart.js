/*
OrchestratorPart
================
* パートから受け取ったメッセージを蓄積し、定期的にそれらを統合し
  UIに返す。


*/

import { Part } from '../part.js';
import { Message } from '../../../Message.js';

const MAX_REPETITION_MEMORY = 8;

export class OrchestratorPart extends Part {
  constructor() {
    super();
    this.innerVoicePool = [];
    this.inputQueue = [];
    this.repetitionMemory = [];
    // orchestratorはEpisodeStorage等のengineを持たないため_checkEngineを通す
    this.engineName = 'Orchestrator';
    this.engine = this;
  }

  async init(botName, partName, firestoreToken = null) {
    const data = await this._init(botName, partName, firestoreToken);
    
    const factor = data?.factor ?? {};
    const intervals = factor.intervals_msec ?? [300];
    this.factor = { ...factor, intervals_msec: intervals };
    this.repetitionMemory = [];
    this.botName = botName;
    this.partName = partName;
    this.displayName = typeof data?.displayName === 'string' && data.displayName ? data.displayName : botName;
    return true;
  }

  /*
  * 全てのpartをactivate
  */
  deploy() {
    postMessage({type:"activate",botName:this.botName})
  }

  /*
  ポーリング中に受信した他のpartからのinnerVoiceを蓄積
  */
  receiveinnerVoice(message) {
    this.innerVoicePool.push(new Message(message));
  }

  polling() {
    const intervals = this.factor?.intervals_msec;
    if (!intervals.length) {
      return null;
    }

    const interv = intervals[Math.floor(Math.random() * intervals.length)];

    return new Promise((resolve) => {
      setTimeout(() => {
        const output = this.integrate();
        resolve(output);
      }, interv);
    });
  }

  integrate() {
    // 同一part・同一テキストの重複を除く
    const seen = new Set();
    const pool = this.innerVoicePool.filter((message) => {
      const key = `${(message.props?.partNames ?? []).join(',')}|${message.target}|${message.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const otherCandidates = this._applyRepetitionPenalty(pool
      .filter((message) => message.target === 'other')
    )
      .slice(0, 3);

    const selfCandidates = this._applyRepetitionPenalty(pool
      .filter((message) => message.target === 'self')
    )
      .slice(0, 3);

    const chosenOther = otherCandidates[0] ?? null;
    const chosenSelf = selfCandidates[0] ?? null;

    const output = this._buildOutput(chosenOther, chosenSelf);

    this.innerVoicePool = [];
    this.inputQueue = [];

    return output;
  }

  _applyRepetitionPenalty(candidates) {
    const alpha = this.factor?.refractory;
    const lambda = this.factor?.penalty?.repetition;
    if (
      !(typeof alpha === 'number' && alpha > 0 && alpha < 1) ||
      !(typeof lambda === 'number' && lambda > 0) ||
      this.repetitionMemory.length === 0
    ) {
      return candidates.sort((a, b) => (b.props?.score ?? 0) - (a.props?.score ?? 0));
    }

    const memoryCount = this.repetitionMemory.length;
    return candidates
      .map((message) => {
        const partNames = this._getTopicPartNames(message);
        let penalty = 0;
        this.repetitionMemory.forEach((memoryPartNames, index) => {
          if (partNames.some((partName) => memoryPartNames.includes(partName))) {
            const dt = memoryCount - index;
            penalty = Math.max(penalty, alpha ** dt);
          }
        });
        const score = message.props?.score ?? 0;
        return { message, adjustedScore: score - lambda * penalty };
      })
      .sort((a, b) => b.adjustedScore - a.adjustedScore)
      .map(({ message }) => message);
  }

  _getTopicPartNames(message) {
    return [...new Set(
      (message?.props?.partNames ?? [])
        .filter((partName) => typeof partName === 'string' && partName && partName !== this.partName)
    )];
  }

  recordOutput(message) {
    const partNames = this._getTopicPartNames(message);
    if (partNames.length === 0) {
      return;
    }
    this.repetitionMemory.push(partNames);
    while (this.repetitionMemory.length > MAX_REPETITION_MEMORY) {
      this.repetitionMemory.shift();
    }
  }

  _buildOutput(chosenOther, chosenSelf) {
    if (!chosenOther && !chosenSelf) {
      return {
        type: 'output',
        message: null,
        props: {
          partNames: [],
        },
      };
    }

    const otherScore = chosenOther?.props?.score ?? 0;
    const selfScore = chosenSelf?.props?.score ?? 0;

    const selectedOther = chosenOther ?? null;
    const selectedSelf = chosenSelf ?? null;

    const message = selectedOther ? new Message(selectedOther) : (selectedSelf ? new Message(selectedSelf) : null);
    const allPartNames = [...new Set([
      ...(selectedOther?.props?.partNames ?? []),
      ...(selectedSelf?.props?.partNames ?? []),
    ])];

    if (
      message &&
      selectedOther &&
      selectedSelf &&
      selfScore > otherScore &&
      typeof selectedSelf.emo === 'string' &&
      selectedSelf.emo
    ) {
      message.emo = selectedSelf.emo;
    }

    if (message) {
      message.props = {
        ...message.props,
        partNames: allPartNames,
      };
      message.text = message.text.replace(/\{bot\}/g, this.displayName);
    }


    // user行の想起は発話できないため、担当partがbot行へ解決する(outputCandidate)
    const needsResolve = message?.props?.episode?.role === 'user';

    return {
      type: needsResolve ? 'outputCandidate' : 'output',
      message,
      props: {
        partNames: allPartNames,
      },
    };
  }
}
