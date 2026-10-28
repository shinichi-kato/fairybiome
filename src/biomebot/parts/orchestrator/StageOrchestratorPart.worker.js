/*

 OrchrstratorPartWorker
 ======================

 */

 import { OrchestratorPart } from './OrchestratorPart';

 const orchestratorPart = new OrchestratorPart();

 let broadcastChannel = null;
 const channelName = (botName, userId) =>
   userId ? `biomebot-${botName}-${userId}` : `biomebot-${botName}`;
 onmessage = async (messageEvent) => {
    const event = messageEvent.data;
    switch (event.type) {
        case 'init': {
            broadcastChannel = new BroadcastChannel(channelName(event.botName, event.userId));

            orchestratorPart.init(event.botName, event.partName,self,broadcastChannel,event.firestoreToken)
            return;
        }

        case 'deploy': {
            const res = await orchestratorPart.deploy();
            postMessage({ type: "deployed", status: res ? "ok" : "error" })
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
