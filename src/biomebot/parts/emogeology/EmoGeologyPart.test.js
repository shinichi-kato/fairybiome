import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import "fake-indexeddb/auto";
import EmoGeologyPart from "./EmoGeologyPart.js";

const dictionary = {
  emotion: {
    word: { joy: ["楽しかった"], anger: ["腹が立った"] },
    question: {
      joy: [{ text: "最近の楽しかったことって何？", assign: { emo: "joy" } }],
    },
  },
  importance: {
    word: { "5": ["すごく"] },
    question: [
      { text: "どれくらい心が動いた？", assign: {} },
      { text: "今気になってる一番大事な出来事はなに？", assign: { importance: 5 } },
    ],
  },
};

describe("EmoGeologyPart", () => {
  let part;

  beforeEach(async () => {
    part = new EmoGeologyPart();
    vi.spyOn(part, "_init").mockResolvedValue(dictionary);
    await part.init("demo", "basic.emogeology", null, "user-1");
    await part._db.strata.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses values assigned by a question and asks only for missing slots", async () => {
    const [question] = await part.input({ text: "今日はどう？" });
    expect(question.text).toBe("最近の楽しかったことって何？");
    expect(part.pending.emo).toBe("joy");
    expect(part.pending.event).toBeUndefined();

    const [importanceQuestion] = await part.input({ text: "友達と会った" });
    expect(importanceQuestion.text).toContain("心が動いた");
    expect(part.pending.importance).toBeUndefined();
    expect(part.pending.event).toBe("友達と会った");

    await part.input({ text: "すごく" });
    const [record] = await part._db.strata.toArray();
    expect(record).toMatchObject({
      userId: "user-1",
      event: "友達と会った",
      emo: "joy",
      importance: 5,
    });
  });

  it("stores null when the user declines to answer", async () => {
    await part.input({ text: "開始" });
    await part.input({ text: "うーん" });
    const [record] = await part._db.strata.toArray();
    expect(record).toMatchObject({ event: null, emo: "joy", importance: null });
    expect(record.userId).toBe("user-1");
  });

  it("splits a response into at most two strata", async () => {
    await part.input({ text: "開始" });
    await part.input({ text: "友達と会った。そして映画を見た。そして散歩した" });
    await part.input({ text: "すごく" });
    const records = await part._db.strata.toArray();
    expect(records).toHaveLength(2);
  });

  it("counts and stores strata only within the current user scope", async () => {
    await part.input({ text: "開始" });
    await part.input({ text: "友達と会った" });
    await part.input({ text: "すごく" });

    const otherUser = new EmoGeologyPart();
    vi.spyOn(otherUser, "_init").mockResolvedValue(dictionary);
    await otherUser.init("demo", "basic.emogeology", null, "user-2");
    otherUser.pending = {
      recordedAt: new Date(),
      event: "別の出来事",
      emo: "joy",
      importance: 5,
    };
    await otherUser._saveStrata();

    expect(await part._dailyCount()).toBe(1);
    expect(await otherUser._dailyCount()).toBe(1);
    expect(await part._db.strata.where("userId").equals("user-1").count()).toBe(1);
    expect(await part._db.strata.where("userId").equals("user-2").count()).toBe(1);
  });
});
