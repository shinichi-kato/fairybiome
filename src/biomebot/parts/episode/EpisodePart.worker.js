/*
 EpisodePartWorker
===================
 EpisodePartをworker化するラッパー。
 EpisodePartはプロセス管理用に自分のメッセージングチャンネルを使用し、
 会話用にbroadcastチャンネルを使用する。それらのpostMessage/onmessageは
 全てEpisodePartWorkerに集約する。worker部分とロジックを明確に分ける
 ことで、ロジック側ののテストと デバッグが容易になり、 通信経路が明確化する。
*/

import EpisodePart from './EpisodePart.js';

const episodePart = new EpisodePart();
let broadcastChannel = null;
let currentTurnId = null;
const closedTurns = [];
const MAX_CLOSED_TURNS = 20;

const getMaxHops = () => {
  const value = episodePart.factor?.maxHops;
  return Number.isInteger(value) && value > 0 ? value : 2;
};

const postInnerVoices = (messages, turnId, hop) => {
  for (const message of messages) {
    broadcastChannel.postMessage({ type: 'innerVoice', turnId, hop, message });
  }
};

onmessage = async (messageEvent) => {
  const event = messageEvent.data ?? {};

  switch (event.type) {
    case 'init': {
      await episodePart.init(event.botName, event.partName, event.firestoreToken ?? null);
      broadcastChannel = new BroadcastChannel(`biomebot-${event.botName}`);
      broadcastChannel.onmessage = (channelEvent) => {
        const payload = channelEvent.data ?? {};

        switch (payload.type) {
          case 'input': {
            currentTurnId = payload.turnId ?? null;
            postInnerVoices(episodePart.input(payload.message), currentTurnId, 1);
            break;
          }
          case 'innerVoice': {
            const hop = payload.hop ?? 1;
            if (
              payload.turnId !== currentTurnId ||
              closedTurns.includes(payload.turnId) ||
              hop >= getMaxHops()
            ) {
              break;
            }
            postInnerVoices(episodePart.inputinnerVoice(payload.message), payload.turnId, hop + 1);
            break;
          }
          case 'outputCandidate': {
            if (payload.turnId != null) {
              closedTurns.push(payload.turnId);
              if (closedTurns.length > MAX_CLOSED_TURNS) closedTurns.shift();
            }
            if (payload.message?.props?.episode?.partName === episodePart.partName) {
              broadcastChannel.postMessage({
                type: 'output',
                turnId: payload.turnId,
                botName: payload.botName,
                message: episodePart.resolveCandidate(payload.message),
                props: payload.props,
              });
            }
            break;
          }
          case 'output': {
            if (payload.turnId != null) {
              closedTurns.push(payload.turnId);
              if (closedTurns.length > MAX_CLOSED_TURNS) closedTurns.shift();
            }
            episodePart.getOutput(payload.message);
            break;
          }
          default:
            break;
        }
      };
      postMessage({ type: 'initialized', status: 'ok' });
      return;
    }

    case 'deploy': {
      const res = await episodePart.deploy();
      postMessage({ type: 'deployed', status: res ? 'ok' : 'error' });
      return;
    }

    case 'activate': {
      const res = episodePart.activate();
      if (res?.status === 'ok') {
        postMessage({ type: 'activated' });
      }
      postMessage(res);
      return;
    }

    case 'deactivate': {
      const res = episodePart.deactivate();
      if (res?.status === 'ok') {
        postMessage({ type: 'deactivated' });
      }
      postMessage(res);
      return;
    }

    case 'report': {
      const res = episodePart.report();
      postMessage({ type: 'reported', ...res });
      return;
    }

    case 'terminate': {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      postMessage({ type: 'terminated', status: 'ok' });
      return;
    }

    default:
      postMessage({ type: 'ignored', status: 'ok' });
      return;
  }
};