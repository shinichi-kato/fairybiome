import { randomInt } from "mathjs";
import BiomeBotIO from "./biomebotIO.jsx";
import { standbyFairy } from "./standbyFairy";

export default class BiomeBot extends BiomeBotIO {
  constructor() {
    super();

    // fairybiomeのシステム用word(必須)
    this.wordDict = {
      // 共通 commons
      "{!NOT_FOUND}": [""],
      "{!HELLO}": [""],
      "{!BOT_JUST_BORN}": [""], // 生まれたばかりでユーザに出会った
      "{!BOT_NAME_ME}": [""], // ユーザに名前をつけてもらう
      "{!ACCEPT_BUDDY_FORMATION}": [""], // 妖精が仲間になるのを承諾した
      "{!REJECT_BUDDY_FORMATION}": [""], // 妖精が仲間になるのを断った
      "{!IGNORE_BUDDY_FORMATION}": [""], // 妖精がすでに仲間になっている
      "{!BOT_IS_DYING}": [""], // 妖精が消滅する

      // 行動 actions
      "{!BOT_WILL_SPLIT}": [""], // 別行動する
      "{!BOT_WILL_JOIN}": [""], // 合流する
      "{!BOT_MEETS_YOU}": [""], // 別行動中にユーザに出会った
      "{!BOT_ACCEPT_SUMMON}": [""], // 呼び出しに応じた

      // Learnerパート用 learner
      "{!TELL_ME_WHAT_TO_SAY}": [""],
      "{!PARSE_USER_INPUT}": [""],
      "{!I_GOT_IT}": [""],
      "{}": [""],
    };

    if (!this.isLoaded()) {
      this.readLocalStorage();
    }
  }

  overwriteStandbyFairy = () => {
    this.config = {
      ...this.config,
      ...standbyFairy.config
    };
    this.wordDict = {
      ...this.wordDict,
      ...standbyFairy.wordDict,
    };
    this.parts = {
      ...standbyFairy.parts
    };
    this.state = {
      ...this.state,
      ...standbyFairy.state
    };
  }

  deploy = async (_userName, fairy, site) => {
    /*
      fairy:nullの場合妖精不在、Objectを渡した場合妖精のobj形式データとみなす。
      site:現在地

      fairyから会話相手になる妖精のデータをロードする。buddyをロードした場合は
      さらにfollow,home,habitatの3つの状態がありうる。これらの組み合わせにより、
      実際に起動する妖精のモードを下記の表に従って決定し、データをbotに読み込み、コンパイルする。

      選択した話し相手     buddyの状態    現在地      動作モード
      -------------------------------------------------------
      null              null          hub         none
      null              null          home        none
      null              null          habitat     none
      null              follow        hub         buddy
      null              follow        home        buddy
      null              follow        habitat     none
      null              home          hub         none
      null              home          home        buddy-standby
      null              home          habitat     none
      null              habitat       hub         none
      null              habitat       home        none
      null              habitat       habitat     buddy-standby

      guest             null          hub         -
      guest             null          home        -
      guest             null          habitat     guest
      guest             follow        hub         -
      guest             follow        home        -
      guest             follow        habitat     guest
      guest             home          hub         -
      guest             home          home        -
      guest             home          habitat     guest
      guest             habitat       hub         -
      guest             habitat       home        -
      guest             habitat       habitat     guest

      buddy             null          hub         -
      buddy             null          home        -
      buddy             null          habitat     -
      buddy             follow        hub         buddy
      buddy             follow        home        buddy
      buddy             follow        habitat     buddy
      buddy             home          hub         -
      buddy             home          home        -
      buddy             home          habitat     -
      buddy             habitat       hub         -
      buddy             habitat       home        -
      buddy             habitat       habitat     -

    */

    const buddyState = this.getBuddyState();

    this.state.buddy = null; // 妖精がいない
    if (!fairy) {
      // 話し相手を選んでいない
      if (buddyState.buddy === "follow" && site !== "habitat") {
        // buddyが随行中ならhabitat以外では話し相手になる
        this.readLocalStorage();
      } else if (buddyState.buddy === site) {
        // buddyが現地にいるが離れている
        this.readObj(fairy);
        this.overwriteStandbyFairy();
      } else {
        this.init();
        return;
      }
    } else {
      // 話し相手にguestまたはbuddyを選んだ
      // →選んだ相手と話す
      this.readObj(fairy);
    }

    this.wordDictKeys = Object.keys(this.wordDict);
    this.state.partOrder = [...this.config.defaultPartOrder];
    // 各パートのコンパイル

    Promise.all(this.state.partOrder.map(partName => (
      this.parts[partName].compile()
    ))).then(_messages => {
    });

    this.wordDict["{!PREV_USER_INPUT}"] = "・・・";
    this.wordDict["{!RESPONSE}"] = "・・・";
  }

  replyHome = (userName, userInput) => {
    /*

    ■バディ結成の無効化
    Homeには自分のバディになっている妖精しか存在しない。そのため
    全ての{!ACCEPT_BUDDY_FORMATION}や{!REJECT_BUDDY_FORMATION}は無効で、
    {!IGNORE_BUDDY_FORMATION}が代わりに実行される。

    ■妖精の外出
    妖精がセリフ内で{!BOT_WILL_SPLIT}を発言した場合、ボットはhomeかhabitatに
    でかけてユーザとは別行動になる。出かける直前の状態は保存され、ボットはstandby-mode
    になる

    ■単独行動中のバディの呼び出し
    HomeとHabitatではバディの妖精が単独行動していて現在地にいない場合妖精は返事をしない。
    妖精が不在でもユーザが呼びかけて{!BOT_ACCEPT_SUMMON}が評価された場合、1d100がHPよりも大きければ
    妖精は姿を見せてstate.buddyがfollowに戻る。すでに現在地に妖精がいる場合には
    {!BOT_ACCEPT_SUMMON}は何も効果を持たない
    */
    return new Promise(resolve => {
      if (this.state.partOrder.length === 0) {
        // 妖精不在
        return {
          displayName: "",
          photoURL: "",
          text: null,
        };
      }

      let reply;

      for (let i = 0, l = this.state.partOrder.length; i < l; i++) {
        const partName = this.state.partOrder[i];
        // 返答の生成を試みる
        reply = this.parts[partName].replier(userName, userInput, this.state, this.wordDict);
        console.log(partName, reply);
        if (reply.text !== "") {
          // queueに追加
          this.state.queue = [...this.state.queue, ...reply.queue];

          // 発言中に'{!BOT_WILL_SPLIT}'を検出したらbuddyはhomeかhabitatに
          // 出かける

          if (reply.text.indexOf("{!BOT_WILL_SPLIT}") !== -1) {
            this.state.buddy = Math.random() > 0.5 ? "home" : "habitat";
            this.dumpToLocalStorage();
            if (this.state.buddy === "home") {
              this.overwriteStandbyFairy();
            } else {
              this.init();
            }
            this.compile().then(() => { });

            return resolve({
              displayName: this.config.botName,
              photoURL: this.config.photoURL,
              text: this.untagify(reply.text, userName)
            });
          }

          // 発言中に'{!BOT_ACCEPT_SUMMON}'を検出したらbotはfollowに戻る
          if (reply.text.indexOf("{!BOT_ACCEPT_SUMMON}") !== -1) {
            this.state.buddy = "follow";
          }

          if (reply.ordering === "top") {
            // このパートを先頭に
            this.state.partOrder.slice(i, 1);
            this.state.partOrder.unshift(partName);
            // partOrderの順番を破壊したのでループを抜ける
            break;
          }

          if (reply.ordering === "bottom") {
            // このパートを末尾に
            this.state.partOrder.slice(i, 1);
            this.state.partOrder.push(partName);
            // partOrderの順番を破壊したのでループを抜ける
            break;
          }
        }
      }
      if (reply.text === "") {
        reply.text = "{!NOT_FOUND}";
      }
      console.log("reply", reply);

      reply.text = this.untagify(reply.text, userName);

      this.upkeepToLocalStorage();
      this.wordDict["{!RESPONSE}"] = reply.text;
      this.wordDict["{!PREV_USER_INPUT}"] = userInput;
      return resolve({
        displayName: this.config.botName,
        photoURL: this.config.photoURL,
        text: this.untagify(reply.text, userName)
      });
    });
  }

  replyHabitat = (userName, userInput) => {
    /*
      Habitatでの挙動
      Habitatで会話する相手にはguest、buddy、待受状態のbuddyの３種類がある。

      ■ゲスト妖精
      ユーザにバディがいない状態であれば、妖精に話しかけてバディにできる可能性がある。
      会話の中で{!ACCEPT_BUDDY_FORMATION}が評価された場合、1d100が妖精のHPよりも大きければ
      妖精はバディになる。そうでなければ{!IGNORE_BUDDY_FORMATION}が代わりに実行される。
      妖精が生まれたばかりであればユーザが名前をつける。名前をつけることで妖精がバディになる。

      それまでは「生まれたばかりの妖精」という仮の名前がついている。
      会話が不調であれば{!REJECT_BUDDY_FORMATION}が評価される場合もある。その場合は妖精は
      {!BYE}を実行してどこかに言ってしまう。Habitatでは妖精の設定は変更できず、
      localStorageに保存はされないが、言葉を教えることはできる。

      ■buddy
      Homeと同じ

      ■待受状態のbuddy
      話し相手がいない状態でユーザが発言しても返答は帰ってこない。しかし
      単独行動中の妖精が生息地にいる場合は、ユーザの呼びかけに応えてbuddyの妖精が姿を見せる場合がある。
      実行される。それ以外の会話はHOMEと変わらない。{!ACCEPT_BUDDY_FORMATION}や
      {!REJECT_BUDDY_FORMATION}は無視され、代わりに{!IGNORE_BUDDY_FORMATION}が展開される。

      */
    return new Promise((resolve) => {
      if (this.state.partOrder.length === 0) {
        // 妖精不在
        resolve({
          displayName: "",
          photoURL: "",
          text: null,
        });
      }
      let reply = {};
      let queue = this.state.queue[0];
      if (queue === "{!CONFIRM_NAME}") {
        // バディ結成手順２命名
        // ユーザ名がOKかどうかの返事が入力されたとみなし、true/falseを抽出
        if (userInput.search(
          /(それで)?(いいよ|はい|OK|ok|Ok|おっけー|オッケー|いいです)[。!！]?$/
        ) !== -1) {
          // OK ・・・妖精がユーザのバディになる
          this.config = {
            ...this.config,
            trueName: this.config.displayName,
            firstUser: userName,
            buddyUser: userName,
          };
          this.state = {
            ...this.state,
            buddy: "follow"
          };
          this.state.queue.shift();
          this.dumpToLocalStorage();

          return resolve({
            displayName: this.config.displayName,
            photoURL: this.config.photoURL,
            text: this.untagify("{!THANKS_FOR_BECOMING_BUDDY}", userName)
          });
        } else if (userInput.search(
          /(ちがう|NO|No|no|そうじゃない|違う|違います|違った)(がな|な|よ)?[。!！ー-]*$/
        ) !== -1) {
          // Noの明示・・・名前受付に戻る
          this.state.queue = ["{!CONFIRM_NAME}"];
          return resolve({
            displayName: this.config.displayName,
            photoURL: this.config.photoURL,
            text: this.untagify("{!RETRY_NAME_ENTRY}", userName)
          });
        }
        // 名前が再入力されたとみなして抽出を試みる
        queue = "{!QUERY_BOT_NAME}";
      }

      if (queue === "{!QUERY_BOT_NAME}") {
        // ユーザ名が入力されたとみなし、前後の不要語を除去して名前を抽出
        const regexps = [
          /[、。？！]$/g,
          /[」 、]*(は|で|っていうのは|とか)(どう|どうですか|どうかな|かな)?$/,
          /^(それ|そん|うーん。|うーん|そうだな。)?(じゃあ|じゃ|では)(ね|ねえ|ねぇ)?[「 、]*/
        ];

        const nameCand = regexps.reduce((accum, val) => {
          return accum.replace(val, "");
        }, userInput);

        this.config.displayName = nameCand;
        this.config.trueName = nameCand;
        this.config.firstuser = userName;
        this.state.queue.shift();
        this.state.queue = ["{!CONFIRM_NAME}"];
        return resolve({
          displayName: "",
          photoURL: this.config.photoURL,
          text: this.untagify("{!QUERY_NAME_OK}", userName)
        });
      }

      // if(queue){
      //   return resolve({
      //     displayName:this.config.displayName,
      //     photoURL:this.config.photoURL,
      //     text:this.untagify(queue,userName)
      //   })
      // }
      for (let i = 0, l = this.state.partOrder.length; i < l; i++) {
        const partName = this.state.partOrder[i];

        // 返答の生成を試みる
        reply = this.parts[partName].replier(userName, userInput, this.state, this.wordDict);
        if (reply.text && reply.text !== "") {
          // queueに追加
          this.state.queue = [...this.state.queue, ...reply.queue];

          // 辞書に追加
          if (reply.appendDict) {
            this.wordDict = { ...this.wordDict, ...reply.appendDict };
          }

          // バディ結成手順１
          // {!ACCEPT_BUDDY_FORMATION}を発話
          if (reply.text.indexOf("{!ACCEPT_BUDDY_FORMATION}") !== -1) {
            const buddyState = this.getBuddyState();
            if (!buddyState.buddy && this.state.hp < randomInt(100)) {
              // バディがおらず、
              // 1d100してhpより大きかったのでバディ結成を受け入れ、命名を依頼する
              reply.text = "{!NAME_ME}";
              reply.ordering = "top";
              this.state.queue = ["{!QUERY_BOT_NAME}"];
            } else {
              // バディ結成を断る
              reply.text = "{!IGNORE_BUDDY_FORMATION}";
              reply.ordering = "top";
            }
          }

          // さよなら
          if (reply.text.indexOf("{!BYE}") !== -1) {
            return resolve({
              displayName: this.config.displayName,
              photoURL: this.config.photoURL,
              text: this.untagify(reply.text, userName)
            }
            );
          }

          if (reply.ordering === "top") {
            // このパートを先頭に
            this.state.partOrder.slice(i, 1);
            this.state.partOrder.unshift(partName);
            // partOrderの順番を破壊したのでループを抜ける
            break;
          }
          if (reply.ordering === "bottom") {
            // このパートを末尾に
            this.state.partOrder.slice(i, 1);
            this.state.partOrder.push(partName);
            // currentPartsの順番を破壊するのでforループを抜ける
            break;
          }
        }
      }

      if (reply.text === "") {
        reply.text = "{!NOT_FOUND}";
      }

      return resolve({
        displayName: this.config.displayName,
        photoURL: this.config.photoURL,
        text: this.untagify(reply.text, userName)
      });
    });
  }

  replyHub = (userName, userInput) => {
    /*
      Hubでの挙動
      ハブでは他のユーザ及び連れている妖精と会話を行う。
      妖精はhubBehaviorに従って会話を行う。

      ■黙って記憶
      誰かの発言-応答の組み合わせを聞いていて、自分の知らない
      やり取りだった場合それを特に確認せず記憶する。
      (未実装)
    */
    return new Promise(resolve => {
      if (this.state.partOrder.length === 0) {
        // 妖精不在
        return resolve({
          displayName: "",
          photoURL: "",
          text: null
        });
      }
      // queueがあれば返す
      if (this.state.queue.length !== 0) {
        const queue = this.state.queue.shift();
        return resolve({
          displayName: this.config.displayName,
          photoURL: this.config.photoURL,
          text: this.untagify(queue, userName)
        });
      }

      let reply = {
        displayName: this.config.displayName,
        photoURL: this.config.photoURL,
        text: "",
      };

      const behavior = this.config.hubBehavior;

      // hubBehavior availabilityチェック
      if (!this.state.activeInHub && Math.random() > behavior.availability) {
        return resolve(reply);
      }

      for (let i = 0, l = this.state.partOrder.length; i < l; i++) {
        const partName = this.state.partOrder[i];

        // 返答の生成を試みる
        reply = this.parts[partName].replier(userName, userInput, this.state, this.wordDict);
        if (reply.text && reply.text !== "") {
          // queueに追加
          this.state.queue = [...this.state.queue, ...reply.queue];

          // さよなら
          if (reply.text.indexOf("{!BYE}") !== -1) {
            return resolve({
              displayName: this.config.displayName,
              photoURL: this.config.photoURL,
              text: this.untagify(reply.text, userName)
            }
            );
          }

          if (reply.ordering === "top") {
            // このパートを先頭に
            this.state.partOrder.slice(i, 1);
            this.state.partOrder.unshift(partName);
            // hubActiveに
            this.state.activeInHub = true;
            // partOrderの順番を破壊したのでループを抜ける
            break;
          }
          if (reply.ordering === "bottom") {
            // このパートを末尾に
            this.state.partOrder.slice(i, 1);
            this.state.partOrder.push(partName);
            this.state.activeInHub = false;
            // currentPartsの順番を破壊するのでforループを抜ける
            break;
          }
        }
        // hubBehavior retentionチェック
        this.state.activeInHub = Math.random() < behavior.retention;
      }
      return resolve({
        displayName: this.config.botName,
        photoURL: this.config.photoURL,
        text: this.untagify(reply.text, userName)
      });
    });
  }

  tagifyNames = (text, userName) => {
    /* ユーザ発言に含まれるユーザ名、ボット名を{!USER_NAME},{!BOT_NAME}に置き換える */
    text = text.replace(new RegExp(`${this.config.displayName}ちゃん`, "g"), "{!BOT_NAME}");
    text = text.replace(new RegExp(`${this.config.displayName}さん`, "g"), "{!BOT_NAME}");
    text = text.replace(new RegExp(`${this.config.displayName}君`, "g"), "{!BOT_NAME}");
    text = text.replace(new RegExp(this.config.displayName, "g"), "{!BOT_NAME}");
    text = text.replace(new RegExp(userName, "g"), "{!USER_NAME}");
    return text;
  }

  untagify = (text, userName) => {
    /* ユーザ発言やボットの発言に含まれる{!USER_NAME},{!BOT_NAME}を戻す */
    this.wordDict["{!BOT_NAME}"] = [this.config.displayName];
    this.wordDict["{!USER_NAME}"] = [userName];
    this.wordDictKeys = Object.keys(this.wordDict);

    /* messageに含まれるタグを文字列に戻す再帰的処理 */
    if (text) {
      for (let _tag of this.wordDictKeys) {
        if (text.indexOf(_tag) !== -1) {
          text = text.replace(/(\{[!a-zA-Z0-9_]+\})/g, (_whole, tag) => (this._expand(tag)));
        }
      }
    }

    return text;
  }

  _expand = (_tag) => {
    const items = this.wordDict[_tag];
    if (!items) { return _tag; }
    let item = items[Math.floor(Math.random() * items.length)];

    item = item.replace(/(\{[!a-zA-Z0-9_]+\})/g, (_whole, tag) => (this._expand(tag))
    );
    return item;
  }
}

