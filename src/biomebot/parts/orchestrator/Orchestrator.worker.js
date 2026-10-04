/*

 OrchrstratorPartWorker
 ======================
 デバッグを容易にするためOrchestratorPartにはロジックを、
 Orchestator.worker.jsにはメッセージング関連を記述している。
 */

 import { OrchestratorPart } from './OrchestratorPart.js';

 const orchestratorPart = new OrchestratorPart();

 let broadcastChannel = null;
 let currentTurnId = null;
 const RESOLVE_TIMEOUT_MSEC = 1000;
 const pendingCandidates = new Map();
 onmessage = async (messageEvent) => {
    const event = messageEvent.data;
    switch (event.type) {
        case 'init': {
            broadcastChannel = new BroadcastChannel(`biomebot-${event.botName}`);

            await orchestratorPart.init(event.botName, event.partName, event.firestoreToken);
            broadcastChannel.onmessage = (channelEvent) => {
                const payload = channelEvent.data;
                switch (payload.type) {
                    case 'input': {
                        const turnId = payload.turnId ?? null;
                        currentTurnId = turnId;
                        orchestratorPart.polling().then((output) => {
                            if (!output) return;
                            currentTurnId = null;
                            const message = {
                                type: output.type ?? 'output',
                                turnId,
                                botName: orchestratorPart.botName,
                                message: output.message,
                                props: output.props,
                            };
                            if (broadcastChannel) {
                                broadcastChannel.postMessage(message);
                            }
                            if (message.type === 'outputCandidate') {
                                // 担当partが解決できない場合にターンが止まらないようにする
                                const timeout = orchestratorPart.factor?.resolveTimeout_msec ?? RESOLVE_TIMEOUT_MSEC;
                                pendingCandidates.set(turnId, setTimeout(() => {
                                    pendingCandidates.delete(turnId);
                                    broadcastChannel?.postMessage({
                                        type: 'output',
                                        turnId,
                                        botName: orchestratorPart.botName,
                                        message: null,
                                        props: { partNames: [] },
                                    });
                                }, timeout));
                            }
                        });
                        break;
                    }
                    case 'output': {
                        clearTimeout(pendingCandidates.get(payload.turnId));
                        pendingCandidates.delete(payload.turnId);
                        break;
                    }
                    case 'innerVoice': {
                        if (currentTurnId !== null && payload.turnId === currentTurnId) {
                            orchestratorPart.receiveinnerVoice(payload.message);
                        }
                        break;
                    }
                    default:
                        break;
                }
            };
            postMessage({ type: 'initialized', status: 'ok', displayName: orchestratorPart.displayName });
            return;
        }


        case 'deploy': {
            // orchestratorにはdeploy事項がない
            // const res = await orchestratorPart.deploy();
            postMessage({ type: "deployed", status: "ok"});
            return;
        }

        case 'activate': {
            const res = orchestratorPart.activate();
            if (res.status == 'ok') {
                postMessage({ type: "activated" });
            }
            postMessage(res);
            return;
        }

        case 'deactivate': {
            const res = orchestratorPart.deactivate();
            if (res.status == 'ok') {
                postMessage({ type: "deactivated" });
            }
            postMessage(res);
            return;
        }

        case 'report': {
            const res = orchestratorPart.report();
            postMessage(res)
        }

        case 'terminate': {
            orchestratorPart.terminate();
            return;
        }

                
    }

 }
