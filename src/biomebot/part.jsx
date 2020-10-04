import { randomInt } from "mathjs";
import PartIO from "./partIO";
import { textToInternalRepr, dictToInternalRepr } from "./internalRepr.js";
import matrixizeWorker from "./matrixizeWorker";
import { retrieve } from "./retrieve";
import { botTagDict, botTagDictKeys } from "./tagdict";
import { TinySegmenter } from "./tinysegmenter.js";
import { reviver } from "mathjs";

const segmenter = new TinySegmenter();
// 注記: [<>{}+-]がアルファベットに分類されるよう変更したものを使用

export default class Part extends PartIO {
  compile = async () => {
    // inDict,outDictに分割
    let inDict = this.dict.map(node => (node.in));
    this.outDict = this.dict.map(node => (node.out));
    // inDictの各テキストを分かち書き
    inDict = inDict.map(item => item.map(text => segmenter.segment(text)));
    // inDictのtag化
    inDict = tagifyInDict(inDict);
    // 内部表現に変換
    inDict = inDict.map(l => dictToInternalRepr(l));
    // 正規化tfidf行列,vocab,indexの生成
    inDict = await matrixizeWorker.matrixize(inDict);
    this.inDict = {
      vocab: inDict.vocab,
      wv: inDict.wv,
      idf: JSON.parse(inDict.idf, reviver),
      tfidf: JSON.parse(inDict.tfidf, reviver),
      index: JSON.parse(inDict.index),
    };
    return 1;
  }

  // 返答関数
  replier = (...args) => {
    switch (this.type) {
      case "recaller":
        return this.recallerReplier(...args);
      case "learner":
        return this.learnerReplier(...args);
      default:
        return this.defaultReplier(...args);
    }
  }

  //  以下の返答関数を切り替えて使用

  recallerReplier =
    (username, text, state, wordDict, generosityFactor = 1) => {
      /*  辞書型の返答生成
          辞書の中からユーザのセリフに一番近いものを探し、
          それに対応する出力文字列を返す。
      */

      let result = {
        text: "", // 返答文字列
        queue: [], // キューに送る文字列
        score: 0, // テキスト検索での一致度
        ordering: "", // top:このパートを先頭へ, bottom:このパートを末尾へ移動
      };

      // queueがあればそれを返す
      if (state.queue.length !== 0) {
        const queue = state.queue.shift();
        return {
          text: queue,
          queue: [],
          score: 1,
          ordering: "",
        };
      }

      // availability check
      const a = Math.random();
      if (a > this.behavior.availability) {
        // console.log(`recaller:avail. insufficient 1d1=${a} avail.=${this.behavior.availability}`);
        return result;
      }

      // text retrieving
      const nodes = tagifyInMessage(segmenter.segment(text));
      const ir = textToInternalRepr(nodes);
      const irResult = retrieve(ir, this.inDict);

      if (irResult.index === null) {
        return result;
      }

      // generosity check
      if (irResult.score < 1 - this.behavior.generosity * generosityFactor) {
        // console.log(`recaller:generos. insufficient score=${irResult.score},generosity=${this.behavior.generosity}`);
        return result;
      }

      // 出力候補の中から一つを選ぶ

      let cands = [];
      cands = this.outDict[irResult.index];
      result.text = cands[randomInt(cands.length)];
      // console.log("result.text:", result.text);

      // テキストに<BR>が含まれていたらqueueに送る
      if (result.text.indexOf("<BR>") !== -1) {
        const replies = result.text.split("<BR>");
        result.text = replies.shift();
        result.queue = [...replies];
      }

      // retention check

      result.ordering = Math.random() < this.behavior.retention ?
        "bottom" : "top";
      return result;
    }

  learnerReplier =
    (usernName, text, state, wordDict, generosityFactor = null) => {
      /* learner型
      ■ home/habitatでの挙動(generosityFactorがundefinedの場合)
      1. availabilityチェックを行う。
      2. ユーザの発言Xに似た行があるか辞書を探し、スコアを計算する。
      3. generosityチェックを行う。OKならユーザ発言に対する返答を返して終わる。
      4. Xに似た行が見つからなかった場合{!TELL_ME_WHAT_TO_SAY}を出力し、
         今のユーザ発言をwordDict['{USER_UNKNOWN_INPUT}'}に格納して
         queueは[{!PARSE_USER_INPUT}]にして終わる。
      5. queueに{!PARSE_USER_INPUT}があったらパターンを使ってユーザ入力から
         答えと思われる文字列を抽出し、wordDict['{BOT_CAND_OUTPUT}']に格納する。
         botは確認メッセージ{!CONFIRM_LEARN}を出力、queueを{!CONFIRM_LEARN}にする
      6. queueが{!CONFIRM_LEARN}だった場合、ユーザの入力がyesかどうか調べ、
         yes出会った場合このパートのinDictに
         in:[ユーザ入力],out:[ボット出力]
         を追加。コンパイルする。
      7. {!I_GOT_IT}を出力して終わる。

      // ↓将来実装したい
      //  2.ユーザのセリフ□□に対して自分が△△と返事をし、ユーザが笑った場合、
      //  {in:["□□"],
      //    out:["△△"]}
      // という記憶を追加する。

      ■ hubでの挙動( generosityFactor が undefined でない)
      hubでは多人数での会話になり、ユーザに直接聞かずに他人同士のやり取りから学習する。
      ※. 直前の発言(!{LAST_SPEECH}、2つ前{!SECOND_LAST_SPEECH}、3つ前の発言
        {!THIRD_LAST_SPEECH}はpartの種類によらず常に記憶しておく(biomebot側で)
      1. availabilityチェックを行う。
      2. 直前のユーザ発言Xに似た行があるか辞書を探し、スコアを計算する。
      3. generosityチェックを行う。OKならユーザ発言に対する返答を返して終わる。
      4. Xに似た行が見つからなかった場合、Xがポジティブな反応(そうか！、あはは！、だよね、など)
         であれば２つ前のセリフをin、１つ前のセリフをoutとして記憶を追加。
      5. 発言Xを真似する{!MIMICKING}を出力して終わる。{!MIMICKING}では{LAST_SPEECH}〜
         {THIRD_LAST_SPEECH}を利用できる
      */

      let result = {
        text: "", // 返答文字列
        queue: [], // キューに送る文字列
        score: 0, // テキスト検索での一致度
        ordering: "", // top:このパートを先頭へ, bottom:このパートを末尾へ移動
      };
      // console.log("learner replier:", state);
      if (state.queue.length !== 0) {
        const queue = state.queue.shift();
        if (queue === "{!PARSE_USER_INPUT}") {
          // 手順5
          // 返答が入力されたとみなし、前後の不要語を除去して返答を抽出
          const regexps = [
            /^(そういうときは|そういう時は)?[「 、]*/,
            /[」 、]*(と|って)(いう|言ったら|言う|)(と思います|と思いますよ|)[。！!]?$/,
          ];

          const responseCand = regexps.reduce((accum, val) => {
            return accum.replace(val, "");
          }, text);

          const appendDict = { "{!BOT_CAND_OUTPUT}": [responseCand] };
          // console.log("text", text);
          return {
            text: "{!CONFIRM_LEARN}",
            queue: ["{!CONFIRM_LEARN}"],
            score: 1,
            ordering: "top",
            appendDict: appendDict
          };
        }

        if (queue === "{!CONFIRM_LEARN}") {
          if (text.search(
            /(いやいや|ちがう|NO|No|no|そうじゃない|違う|違います|違った|違えた|ごめん)(がな|な|よ)?[。!！ー-]*$/
          ) !== -1) {
            // 否定の明示・・・学習のキャンセル
            return {
              text: "{!LEARN_FIZZLED}",
              queue: [],
              ordering: "bottom",
              score: 1,
            };
          }
          // 学習成功
          this.dict.push({
            in: wordDict["{!USER_UNKNOWN_INPUT}"],
            out: wordDict["{!BOT_CAND_OUTPUT}"]
          });
          this.compile().then(() => { });

          return {
            text: "{!I_GOT_IT}",
            queue: [],
            score: 1,
            ordering: "bottom",
          };
        }

        // queueからshiftした内容を返答にする
        return {
          text: queue,
          queue: [],
          score: 1,
          ordering: "",
        };
      }
      // availability check
      if (Math.random() > this.behavior.availability) {
        // console.log("learner:avail. insufficient");
        return result;
      }

      // text retrieving
      const nodes = tagifyInMessage(segmenter.segment(text));
      const ir = textToInternalRepr(nodes);
      const irResult = retrieve(ir, this.inDict);

      // generosity check
      if (irResult.index === null ||
        irResult.score <= 1 - this.behavior.generosity * (generosityFactor || 1)) {
        // 手順4 返答できない場合尋ねる
        // console.log(`learner:generos. ${this.behavior.generosity} score:${irResult.score}`);
        if (generosityFactor) {
          // hubの場合、最後のユーザ発言が肯定的だった場合やり取りを記憶
          if (text.search(
            /(あはは|そうなんだ|面白い|ははは|うん|なるほど|そうか｜へー|😁)[。!！ー-]*$/
          ) !== -1) {
            this.dict.push({
              in: wordDict["{!!THIRD_LAST_SPEECH}"],
              out: wordDict["{!!SECOND_LAST_SPEECH}"]
            });
            result = {
              text: "{!MIMICKING}",
              queue: ["{!MIMICKING}"],
              ordering: "top",
              score: irResult.score,
              appendDict: {},
            };
          }
        } else {
          // hub以外では知らない言葉をユーザに聞く
          result = {
            text: "{!TELL_ME_WHAT_TO_SAY}",
            queue: ["{!PARSE_USER_INPUT}"],
            ordering: "top",
            score: irResult.score,
            appendDict: { "{!USER_UNKNOWN_INPUT}": [text] }
          };
        }
        return result;
      }

      // 出力候補の中から一つを選ぶ
      let cands = [];
      cands = this.outDict[irResult.index];
      result.text = cands[randomInt(cands.length)];
      // console.log("result.text:", result.text);

      // テキストに<BR>が含まれていたらqueueに送る
      if (result.text.indexOf("<BR>") !== -1) {
        const replies = result.text.split("<BR>");
        result.text = replies.shift();
        result.queue = [...replies];
      }

      // retention check

      result.ordering = Math.random() > this.behavior.retention ?
        "bottom" : "top";

      return result;
    }

  defaultReplier = (text, username, state, wordDict, generosityFactor = 1) => {
    let result = {
      text: `default replier,echo ${text}`, // 返答文字列
      queue: [], // キューに送る文字列
      score: 0, // テキスト検索での一致度
      ordering: "", // top:このパートを先頭へ, bottom:このパートを末尾へ移動
    };
    return result;
  }
}

const tagifyInDict = (inDict) => {
  /* this.inDictに現れるボットを表す文字列を{bot}タグに置換する。
    this.inDictに現れる「あなた」などの人称を{user}タグに置き換える。

  */

  return inDict.map(line =>
    line.map(text => tagifyInMessage(text))
  );
  /* this.outDictのレンダリングは出力直前に実行 */
};

const tagifyInMessage = (text) => {
  let newText = [];

  for (let j in text) {
    if (Object.prototype.hasOwnProperty.call(text, j)) {
      let str = text[j];
      for (let key of botTagDictKeys) {
        for (let word of botTagDict[key]) {
          str = str.replace(new RegExp(word, "g"), key);
        }
      }
      newText[j] = str;
    }
  }
  return newText;
};

