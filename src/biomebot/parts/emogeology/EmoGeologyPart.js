import Dexie from "dexie";
import { Part } from "../part.js";
import { Message } from "../../../Message.js";

const EMOTIONS = ["joy", "sadness", "anger", "fear", "trust", "disgust", "anticipation", "surprise"];
const SLOT_NAMES = ["event", "emo", "importance"];
const MAX_STRATA_PER_RESPONSE = 2;
const DAILY_MEMORY_LIMIT = 2;
const NEGATIVE_EMOTIONS = new Set(["sadness", "anger", "fear", "disgust"]);

const isEmptyAnswer = (text) => !text || /^(うーん|うーむ|特にない|ないかな|わからない|分からない|答えたくない|言いたくない|秘密|パス|skip)$/i.test(text.trim());

export class EmoGeologyPart extends Part {
  constructor() {
    super();
    this.engineName = "EmoGeology";
    this.engine = this;
    this.dictionary = {};
    this.pending = null;
    this.rng = Math.random;
    this._db = new Dexie("EmoGeology");
    this._db.version(1).stores({
      strata: "++id,[botName+partName],botName,partName,recordedAt",
      geologies: "++id,[botName+partName],botName,partName,recordedAt",
    });
    this._db.version(2).stores({
      strata: "++id,[userId+botName+partName],userId,botName,partName,recordedAt",
      geologies: "++id,[userId+botName+partName],userId,botName,partName,recordedAt",
    });
  }

  async init(botName, partName, firestoreToken = null, userId = null) {
    if (typeof userId !== "string" || !userId) return false;
    const data = await this._init(botName, partName, firestoreToken);
    if (!data || typeof data !== "object") return false;
    this.botName = botName;
    this.partName = partName;
    this.userId = userId;
    this.firestoreToken = firestoreToken;
    this.dictionary = data;
    this.factor = { ...(data.factor ?? {}) };
    return true;
  }

  async deploy() {
    return Boolean(this.botName && this.partName && this.dictionary);
  }

  report() {
    return {
      status: "ok",
      botName: this.botName,
      partName: this.partName,
      engine: this.engineName,
      pending: this.pending !== null,
    };
  }

  _questionEntries() {
    const questions = this.dictionary?.emotion?.question;
    if (!questions || typeof questions !== "object") return [];
    return Object.entries(questions).flatMap(([emotion, values]) => {
      if (!Array.isArray(values)) return [];
      return values.map((value) => this._normalizeQuestion(value, { emo: emotion }));
    });
  }

  _normalizeQuestion(value, fallbackAssign = {}) {
    if (typeof value === "string") return { text: value, assign: fallbackAssign };
    if (!value || typeof value !== "object" || typeof value.text !== "string") return null;
    return {
      text: value.text,
      assign: value.assign && typeof value.assign === "object" ? { ...value.assign } : fallbackAssign,
    };
  }

  _importanceQuestions() {
    const values = this.dictionary?.importance?.question;
    if (!Array.isArray(values)) return [];
    return values.map((value) => this._normalizeQuestion(value)).filter(Boolean);
  }

  _chooseQuestion(missing) {
    const needsEvent = missing.includes("event");
    const needsImportance = missing.includes("importance");
    const candidates = needsEvent ? this._questionEntries() : [];
    if (needsImportance && NEGATIVE_EMOTIONS.has(this.pending?.emo)) return null;
    const importanceCandidates = needsImportance ? this._importanceQuestions() : [];
    const source = candidates.length
      ? candidates
      : importanceCandidates.filter((question) =>
        needsEvent || Object.keys(question.assign).length === 0
      );
    const pool = source.filter((question) =>
      question && Object.keys(question.assign).some((key) => missing.includes(key)) ||
      question && Object.keys(question.assign).length === 0
    );
    if (!pool.length) return null;
    return pool[Math.floor(this.rng() * pool.length) % pool.length];
  }

  _createPending(question = {}) {
    const assign = question.assign ?? {};
    this.pending = {
      recordedAt: new Date(),
      event: Object.prototype.hasOwnProperty.call(assign, "event") ? assign.event : undefined,
      emo: Object.prototype.hasOwnProperty.call(assign, "emo") ? assign.emo : undefined,
      importance: Object.prototype.hasOwnProperty.call(assign, "importance") ? assign.importance : undefined,
    };
    return this.pending;
  }

  _extractEmotion(text) {
    const words = this.dictionary?.emotion?.word;
    if (!words || typeof words !== "object") return null;
    for (const emotion of EMOTIONS) {
      if (Array.isArray(words[emotion]) && words[emotion].some((word) => text.includes(word))) {
        return emotion;
      }
    }
    return null;
  }

  _extractImportance(text) {
    const words = this.dictionary?.importance?.word;
    if (!words || typeof words !== "object") return null;
    for (const value of [5, 4, 3, 2, 1]) {
      if (Array.isArray(words[String(value)]) && words[String(value)].some((word) => text.includes(word))) {
        return value;
      }
    }
    return null;
  }

  _applyAnswer(text) {
    const pending = this.pending;
    const empty = isEmptyAnswer(text);
    if (pending.event === undefined) pending.event = empty ? null : text.trim();
    if (pending.emo === undefined) {
      const emotion = this._extractEmotion(text);
      if (empty || emotion) pending.emo = emotion;
    }
    if (pending.importance === undefined) {
      const importance = this._extractImportance(text);
      if (empty || importance !== null) pending.importance = importance;
    }
  }

  _missingSlots() {
    return SLOT_NAMES.filter((slot) => this.pending?.[slot] === undefined);
  }

  async _saveStrata() {
    if (!this.pending) return;
    const events = this._splitEvents(this.pending.event);
    const remaining = Math.max(0, DAILY_MEMORY_LIMIT - await this._dailyCount());
    await this._db.strata.bulkAdd(events.slice(0, remaining).map((event) => ({
      botName: this.botName,
      partName: this.partName,
      userId: this.userId,
      recordedAt: this.pending.recordedAt,
      event,
      emo: this.pending.emo ?? null,
      importance: this.pending.importance ?? null,
    })));
    this.pending = null;
  }

  _splitEvents(event) {
    if (typeof event !== "string" || !event.trim()) return [event ?? null];
    const parts = event
      .split(/(?:。|、|そして|それから|または|、?それに|、?あとに)/)
      .map((part) => part.trim())
      .filter(Boolean);
    return (parts.length ? parts : [event.trim()]).slice(0, MAX_STRATA_PER_RESPONSE);
  }

  _buildQuestionMessage(question) {
    const text = question.text.replace(/\{recently\}/g, "最近");
    return new Message({
      role: "bot",
      text,
      target: "other",
      timestamp: new Date().toISOString(),
      emo: question.assign?.emo ?? "",
      facing: "face",
      location: "private",
      displayName: this.botName,
      props: {
        botName: this.botName,
        partNames: [this.partName],
        score: 1,
        emoGeology: { type: "question" },
      },
    });
  }

  async _dailyCount() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return this._db.strata
      .where("[userId+botName+partName]")
      .equals([this.userId, this.botName, this.partName])
      .filter((record) => record.recordedAt >= start)
      .count();
  }

  async input(message) {
    const text = typeof message?.text === "string" ? message.text : "";
    if (this.pending) {
      this._applyAnswer(text);
      if (isEmptyAnswer(text)) {
        for (const slot of SLOT_NAMES) {
          if (this.pending[slot] === undefined) this.pending[slot] = null;
        }
        await this._saveStrata();
        return [];
      }
    }

    if (!this.pending) {
      const question = this._chooseQuestion(SLOT_NAMES);
      if (!question) return [];
      this._createPending(question);
      return [this._buildQuestionMessage(question)];
    }

    const missing = this._missingSlots();
    if (missing.length) {
      const question = this._chooseQuestion(missing);
      if (question) {
        Object.assign(this.pending, question.assign);
        return [this._buildQuestionMessage(question)];
      }
    }

    if (await this._dailyCount() >= DAILY_MEMORY_LIMIT) {
      this.pending = null;
      return [];
    }

    await this._saveStrata();
    return [];
  }

  inputinnerVoice(message) {
    return this.input(message);
  }

  receive(message) {
    return this.input(message);
  }

  getOutput(message) {
    return message ?? null;
  }
}

export default EmoGeologyPart;
