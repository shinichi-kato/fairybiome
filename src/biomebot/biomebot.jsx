import {random, re} from 'mathjs';
import BiomeBotIO from './biomebotIO.jsx';
import {stabdbyFairy} from './standbyFairy';


export default class BiomeBot extends BiomeBotIO {
  constructor(){
    super();

    // fairybiomeのシステム用word(必須)
    this.wordDict={
      // 共通 commons
      '{!NOT_FOUND}':[""],
      '{!HELLO}':[""],
      '{!BOT_JUST_BORN}':[""], // 生まれたばかりでユーザに出会った
      '{!BOT_NAME_ME}':[""],  // ユーザに名前をつけてもらう
      '{!ACCEPT_BUDDY_FORMATION}':[""], // 妖精が仲間になるのを承諾した
      '{!REJECT_BUDDY_FORMATION}':[""], // 妖精が仲間になるのを断った
      '{!IGNORE_BUDDY_FORMATION}':[""], // 妖精がすでに仲間になっている
      '{!BOT_IS_DYING}':[""], // 妖精が消滅する
      
      // 行動 actions
      '{!BOT_WILL_SPLIT}':[""], // 別行動する
      '{!BOT_WILL_JOIN}':[""],  // 合流する
      '{!BOT_MEETS_YOU}':[""],  // 別行動中にユーザに出会った
      '{!BOT_ACCEPT_SUMMON}':[""], // 呼び出しに応じた

      // Learnerパート用 learner
      '{!TELL_ME_WHAT_TO_SAY}':[""],
      '{!PARSE_USER_INPUT}':[""],
      '{!I_GOT_IT}':[""],
      '{}':[""],
    };

    if(!this.isLoaded()){
      this.readLocalStorage();
    }    
  
  }

  

  overwriteStandbyFairy = () =>{
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
    this.state={
      ...this.state,
      ...standbyFairy.state
    };

  }

  deploy = async (userName,fairy,site) => {
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

    this.state.partOrder=[]; //　妖精がいない
      
    if(!fairy){
      // 話し相手を選んでいない
      if(buddyState === 'follow' && site !=='habitat'){
        // buddyが随行中ならhabitat以外では話し相手になる
        this.readLocalStorage();
      }else if(buddyState === site){
        // buddyが現地にいるが離れている
        this.readObj(fairy);
        this.overwriteStandbyFairy();
      }else{
        return;
      }
    }else{
      // 話し相手にguestまたはbuddyを選んだ
      // →選んだ相手と話す
      this.readObj(fairy);
    }

    // 各パートのコンパイル
    this.tagKeys= Object.keys(this.wordDict);
    
    Promise.all(this.state.partOrder.map(partName=>(
      this.parts[partName].compile()
    ))).then(messages=>{
      console.log("parrot",this.parts.parrot)
    });


    this.wordDict['{PREV_USER_INPUT}'] ="・・・";
    this.wordDict['{RESPONSE}'] = "・・・";
  }

  
  replyHome = (userName,userInput) => {
    /*
    ■名前がついていない妖精には名前をつける
    
    ■バディ結成の無効化
    Homeには自分のバディになっている妖精しか存在しない。そのため
    全ての{!ACCEPT_BUDDY_FORMATION}や{!REJECT_BUDDY_FORMATION}は無効で、
    {!IGNORE_BUDDY_FORMATION}が代わりに実行される。

    ■単独行動中のバディの呼び出し
    HomeとHabitatではバディの妖精が単独行動していて現在地にいない場合妖精は返事をしない。
    妖精が不在でもユーザが呼びかけて{!BOT_ACCEPT_SUMMON}が評価された場合、1d100がHPよりも大きければ
    妖精は姿を見せてstate.buddyがfollowに戻る。すでに現在地に妖精がいる場合には
    {!BOT_ACCEPT_SUMMON}は何も効果を持たない
    */
    return new Promise(resolve => {

      if(this.state.partOrder.length === 0){
        // 妖精不在
        return {
          displayName:"",
          photoURL:"",
          text:null,
        }
      }

      let reply ;

      for(let partName of this.state.partOrder){
        console.log(partName)
        //返答の生成を試みる
        reply = this.parts[partName].replier(userName,userInput,this.state,this.wordDict)
        console.log(reply)
        if(reply.text === "") { continue }


        // queueに追加
        this.state.queue = [this.state.queue,...reply.queue];


        if(reply.ordering === "top"){
          // このパートを先頭に
          this.state.partOrder.slice(i,1);
          this.state.partOrder.unshift(partName);
          // partOrderの順番を破壊したのでループを抜ける
          break;
        }

        if(reply.ordering === 'bottom'){
          // このパートを末尾に
          this.state.partOrder.slice(i,1);
          this.state.partOrder.push(partName);
          // partOrderの順番を破壊したのでループを抜ける
          break;
        }

        break;
      }

      if(reply.text === ""){
        reply.text ="{NotFound}"
      }

      reply.text = this.untagifyNames(reply.text,userName);
      reply.text = this.untagify(reply.text);

      this.upkeepToLocalStorage();
      this.wordDict['{RESPONSE}'] = reply.text;
      this.wordDict['{PREV_USER_INPUT}'] = userInput;
      resolve({
        displayName:this.config.botName,
        photoURL:this.config.photoURL,
        text:reply.text,
      })
    })
  }

  
  
  
  replyHabitat = (name,text) => {
    /*
      Habitatでの挙動
      Habitatで会話する相手にはguest、buddy、待受状態のbuddyの３種類がある。

      ■ゲスト妖精
      ユーザにバディがいない状態であれば、妖精に話しかけてバディにできる可能性がある。
      会話の中で{!ACCEPT_BUDDY_FORMATION}が評価された場合、1d100が妖精のHPよりも大きければ
      妖精はバディになる。そうでなければ{!IGNORE_BUDDY_FORMATION}が代わりに実行される。
      妖精が生まれたばかりであればユーザが名前をつける。それまでは「生まれたばかりの妖精」
      という仮の名前がついている。
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
    return new Promise((resolve,reject)=>{
      if(this.state.partOrder.length === 0){
        // 妖精不在
        resolve({
          displayName:"",
          photoURL:"",
          text:null,
        })
      }
      
      if(this.config.hubBehavior.availability > random()){
        // ここで名前の呼びかけとかだけキャッチしたい
        //
       
    }
    resolve({displayName:this.displayName,text:null});
  })}





  replyHub = (name,text)=>{
    /*
      Hubでの挙動
      ハブでは他のユーザ及び連れている妖精と会話を行う。
      妖精はhubBehaviorに従って会話を行う。
    */
    return new Promise(resolve => {
      if(this.state.partOrder.length === 0){
        // 妖精不在
        resolve({
          displayName:"",
          photoURL:"",
          text:null
        });
      }
    })

  }

  





  
  tagifyNames = (text,userName) => {
    /* ユーザ発言に含まれるユーザ名、ボット名を{userName},{botName}に置き換える */
    text = text.replace(new RegExp(`${this.displayName}ちゃん`,"g"),"{botName}");
    text = text.replace(new RegExp(`${this.displayName}さん`,"g"),"{botName}");
    text = text.replace(new RegExp(`${this.displayName}君`,"g"),"{botName}");
    text = text.replace(new RegExp(this.displayName,"g"),"{botName}");
    text = text.replace(new RegExp(userName,"g"),"{userName}");
    return text;
  }

  untagifyNames = (text,userName) => {
    /* ユーザ発言やボットの発言に含まれる{userName},{botName}を戻す */
    text = text.replace(/{botName}/g,this.displayName);
    text = text.replace(/{userName}/g,userName);
    return text;

  }

  untagify(text){
    /* messageに含まれるタグを文字列に戻す再帰的処理 */
    if(text){
      for (let tag of this.tagKeys){
        if(text.indexOf(tag) !== -1){
          text = text.replace(/(\{[!a-zA-Z0-9_]+\})/g,(whole,tag)=>(this._expand(tag)));
        }
      }
    }
    return text;
  }
    
 

  _expand(tag){
    const items = this.wordDict[tag];
    if(!items){ return tag}
   let item = items[Math.floor( Math.random() * items.length)];
    
    item = item.replace(/(\{[!a-zA-Z0-9_]+\})/g,(whole,tag)=>(this._expand(tag))
    )
    return item
  }

 
}  


