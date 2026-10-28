import EmoGeologyPart from "./EmoGeologyPart.js";

const emoGeologyPart = new EmoGeologyPart();
let broadcastChannel = null;
let currentTurnId = null;

const channelName = (botName, userId) =>
  userId ? `biomebot-${botName}-${userId}` : `biomebot-${botName}`;

const postInnerVoices = (messages, turnId) => {
  for (const message of messages) {
    broadcastChannel?.postMessage({ type: "innerVoice", turnId, hop: 1, message });
  }
};

onmessage = async (messageEvent) => {
  const event = messageEvent.data ?? {};
  switch (event.type) {
    case "init":
      if (!await emoGeologyPart.init(
        event.botName,
        event.partName,
        event.firestoreToken ?? null,
        event.userId ?? null,
      )) {
        postMessage({ type: "initialized", status: "error", message: "userId is required" });
        break;
      }
      broadcastChannel = new BroadcastChannel(channelName(event.botName, event.userId));
      broadcastChannel.onmessage = (channelEvent) => {
        const payload = channelEvent.data ?? {};
        if (payload.type === "input") {
          currentTurnId = payload.turnId ?? null;
          Promise.resolve(emoGeologyPart.input(payload.message))
            .then((messages) => postInnerVoices(messages, currentTurnId))
            .catch((error) => console.error("EmoGeologyPart input failed", error));
        }
      };
      postMessage({ type: "initialized", status: "ok" });
      break;
    case "deploy":
      postMessage({ type: "deployed", status: (await emoGeologyPart.deploy()) ? "ok" : "error" });
      break;
    case "activate": {
      const result = emoGeologyPart.activate();
      if (result.status === "ok") postMessage({ type: "activated" });
      postMessage(result);
      break;
    }
    case "deactivate": {
      const result = emoGeologyPart.deactivate();
      if (result.status === "ok") postMessage({ type: "deactivated" });
      postMessage(result);
      break;
    }
    case "report":
      postMessage({ type: "reported", ...emoGeologyPart.report() });
      break;
    case "terminate":
      broadcastChannel?.close();
      postMessage({ type: "terminated", status: "ok" });
      break;
    default:
      postMessage({ type: "ignored", status: "ok" });
  }
};
