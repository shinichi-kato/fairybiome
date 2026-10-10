import { Part } from "../part.js";
import { Message } from "../../../Message.js";
import { EpisodeStorage } from "../../../EpisodeStorage/EpisodeStorage.js";

export class EpisodePart extends Part {
  constructor() {
    super();
    this.engineName = "Episode";
    this.engine = new EpisodeStorage("dummy");
    this.columns = [];
    this.data = [];
    this.factor = {};
  }

  async init(botName, partName, firestoreToken = null) {
    const data = await this._init(botName, partName, firestoreToken);
    if (!data || typeof data !== "object") {
      return false;
    }

    this.botName = botName;
    this.partName = partName;
    this.firestoreToken = firestoreToken;
    this.columns = Array.isArray(data.columns) ? [...data.columns] : [];
    this.data = Array.isArray(data.data) ? [...data.data] : [];
    this.factor = { ...(data.factor ?? {}) };

    return true;
  }

  async deploy() {
    if (!this.botName || !this.partName) {
      return false;
    }
    return await this.engine.deploy(this.botName, this.partName);
  }

  report() {
    return {
      status: "ok",
      botName: this.botName,
      partName: this.partName,
      engine: this.engineName,
      factor: this.factor,
      columns: this.columns,
    };
  }

  receive(message) {
    if (!this.engine || typeof this.engine.retrieve !== "function") {
      return { status: "error", message: "engine not ready" };
    }
    
    return this.engine.retrieve(message);
  }

  input(message) {
    const result = this.receive(message);
    if (!result || result.status === "error") {
      return [];
    }

    const row = Array.isArray(result.row) ? result.row : [];
    if (!row.length) {
      return [];
    }

    const emoIndex = this.columns.indexOf("emo");
    const roleIndex = this.columns.indexOf("role");
    const rowRole = roleIndex >= 0 && row[roleIndex] === "user" ? "user" : "bot";

    return [
      new Message({
        role: rowRole,
        text: row[1] ?? "",
        target: "other",
        timestamp: new Date().toISOString(),
        emo: emoIndex >= 0 ? row[emoIndex] : null,
        facing: "face",
        location: row[4],
        ecoState: "",
        displayName: this.botName,
        backgroundColor: "",
        props: {
          botName: this.botName,
          partNames: [this.partName],
          score: typeof result.score === "number" ? result.score : 0,
          episode: {
            partName: this.partName,
            rowIndex: result.index ?? null,
            matchedRowIndex: result.matchedRowIndex ?? null,
            role: rowRole,
            slotCaptures: result.slotCaptures ?? {},
            inputText: typeof message?.text === "string" ? message.text : "",
          },
        },
      }),
    ];
  }

  // 読み込み時に記録されたエラー文を取り出す（取り出すと空になる）
  takeLoadErrors() {
    return this.engine.loadErrors?.splice(0) ?? [];
  }

  // outputCandidateとして採用されたuser行の想起から、次のbot行のMessageを作る
  resolveCandidate(candidate) {
    const episode = candidate?.props?.episode;
    if (!episode || episode.partName !== this.partName || typeof episode.rowIndex !== "number") {
      return null;
    }

    const resolved = this.engine.resolveCandidate({
      index: episode.rowIndex,
      slotCaptures: episode.slotCaptures,
      inputText: episode.inputText,
      matchedRowIndex: episode.matchedRowIndex,
    });
    if (!resolved) {
      return null;
    }

    const emoIndex = this.columns.indexOf("emo");
    return new Message({
      ...candidate,
      role: "bot",
      text: resolved.row[1] ?? "",
      emo: emoIndex >= 0 ? resolved.row[emoIndex] : candidate.emo,
      props: {
        ...candidate.props,
        episode: { ...episode, rowIndex: resolved.index, role: "bot" },
      },
    });
  }

  inputinnerVoice(message) {
    return this.input(message);
  }

  getOutput(message) {
    return message ?? null;
  }
}

export default EpisodePart;
