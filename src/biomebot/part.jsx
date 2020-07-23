import {randomInt,clone, identity} from 'mathjs';
import PartIO from './partIO';
import {textToInternalRepr,dictToInternalRepr} from './internalRepr.js';
import matrixizeWorker from  './matrixizeWorker';
import {retrieve} from './retrieve';
import {botTagDict,botTagDictKeys} from './tagdict';
import {TinySegmenter} from './tinysegmenter.js';

const segmenter = new TinySegmenter();
// 注記: [<>{}+-]がアルファベットに分類されるよう変更したものを使用


export default class Part extends PartIO{
   
  compile = async () => {

    // inDict,outDictに分割
    let inDict = this.dict.map(node=>(node.in));
    this.outDict = this.dict.map(node=>(node.out));

    // inDictの各テキストを分かち書き
    inDict = inDict.map(item=>item.map(text=>segmenter.segment(text)));

    // inDictのtag化
    inDict = tagifyInDict(inDict);

    // 内部表現に変換
    inDict = inDict.map(l=> dictToInternalRepr(l));

    // 正規化tfidf行列,vocab,indexの生成
    inDict = await matrixizeWorker.matrixize(inDict);

    // 取得した値をindictに代入
    this.inDict = Object.assign({},inDict);
    console.log("inDict.vocab",this.inDict.vocab)
    return  1;
  }

  // 返答関数
  replier = (...args) => {
    switch(this.type){
      case 'recaller':
        return this.recallerReplier(...args);
      case 'learner':
        return this.learnerReplier(...args);
      default :
        return this.defaultReplier(...args);
    }
  }
 
  //  以下の返答関数を切り替えて使用

  recallerReplier =　(username,text,state,wordDict) => {
    /*  辞書型の返答生成
        辞書の中からユーザのセリフに一番近いものを探し、
        それに対応する出力文字列を返す。
    */

    let result = {
      text:"",      // 返答文字列
      queue:[],     // キューに送る文字列
      score:0,      // テキスト検索での一致度
      ordering:"",  // top:このパートを先頭へ, bottom:このパートを末尾へ移動 
    };
    
    // queueがあればそれを返す
    if(state.queue.length !== 0){
      const queue = state.queue.shift();
      return {
        text:queue,
        queue:[],
        score:1,
        ordering: "",
      }
    }

    // availability check
    if(Math.random() > this.behavior.availability){
      console.log("availability insufficient")
      return result;
    }

    // text retrieving
    text = tagifyInMessage(text);
    const ir = textToInternalRepr(text);
    const irResult = retrieve(ir,this.inDict);
    // generosity check
    if(irResult.score < 1-this.behavior.generosity){
      console.log("generosity insufficient")
      return result;
    }  

    // 出力候補の中から一つを選ぶ
    let cands = [];
    cands = this.outDict[irResult.index];
    result.text = cands[randomInt(cands.length)];
    
    // テキストに<BR>が含まれていたらqueueに送る
    if(result.text.indexOf('<BR>') !== -1){
      const replies = reply.text.split('<BR>');
      reply.text = replies.shift();
      reply.queue=[...replies];      
    }

    //retention check

    result.ordering = Math.random() > this.behavior.retention ?
      'bottom' : 'top';
    console.log("after",this.inDict)
    return result;
  }








      

        
  learnerReplier = (text,userName,state)=>{
    /* learner型
    1. availabilityチェックを行う。
    2. ユーザの発言Xに似た行が辞書を探し、スコアを計算する。
    3. generosityチェックを行う。OKならユーザ発言に対する返答を返して終わる。
    4. Xに似た行が見つからなかった場合{!TELL_ME_WHAT_TO_SAY}を出力して終わる。
       この文字列はどうやって答えたらいいか聞くセリフに変換されてユーザに返る。
       queueが消去され、{!PARSE_USER_INPUT}が書き込まれる
    5. queueに{!PARSE_USER_INPUT}があったらパターンを使ってユーザ入力から
       答えと思われる文字列を抽出し、{RESPONSE}に格納する。なお、前回の
       ユーザの入力は{PREV_USER_INPUT}に格納される。
    6. {in:[{PREV_USER_INPUT}],out:[{RESPONSE}]}という記憶を辞書に追加
    7. {!I_GOT_IT}を出力して終わる。

    // ↓将来実装したい
    //  2.ユーザのセリフ□□に対して自分が△△と返事をし、ユーザが笑った場合、
    // 　{in:["□□"],
    //    out:["△△"]}
    // という記憶を追加する。
    */ 

    let result = {
      text:"",      // 返答文字列
      queue:[],     // キューに送る文字列
      score:0,      // テキスト検索での一致度
      ordering:"",  // top:このパートを先頭へ, bottom:このパートを末尾へ移動 
    };

    if(state.queue.length !== 0){
      const queue = state.queue.shift();
      if(queue === '{!PARSE_USER_INPUT}'){

        //手順5-7
        this.dict.push({
          in:[wordDict['{PREV_USER_INPUT}']],
          out:[wordDict['{RESPONSE}']]
        });

        return {
          text:"{!I_GOT_IT}",
          queue:[],
          score:1,
          ordering:"bottom",  
        }
    
      }
      // queueからshiftした内容を返答にする
      return {
        text:queue,
        queue:[],
        score:1,
        ordering:"",
      }
  
    }

    // availability check
    if(Math.random() > this.behavior.availability){
      return result;
    }

    // text retrieving
    text = tagifyInMessage(text);
    const ir = textToInternalRepr(text);
    const irResult = retrieve(ir,this.inDict);

    // generosity check
    if(irResult.score < 1-this.behavior.generosity){
      // 手順4
      result = {
        text:"{!TELL_ME_WHAT_TO_SAY}",
        queue:["{!PARSE_USER_ANSWER}"],
        ordering:"top",
        score:irResult.score,
      }
      return result;  
    }  

    // 出力候補の中から一つを選ぶ
    let cands = [];
    cands = this.outDict[irResult.index];
    result.text = cands[randomInt(cands.length)];
    
    // テキストに<BR>が含まれていたらqueueに送る
    if(result.text.indexOf('<BR>') !== -1){
      const replies = reply.text.split('<BR>');
      reply.text = replies.shift();
      reply.queue=[...replies];      
    }

    //retention check

    result.ordering = Math.random() > this.behavior.retention ?
      'bottom' : 'top';

    return result;
  }









  defaultReplier = (text,username,state) => {
    let result = {
      text:"",      // 返答文字列
      queue:[],     // キューに送る文字列
      score:0,      // テキスト検索での一致度
      prevUserInput:"", // ユーザのセリフを記憶
      ordering:"",  // top:このパートを先頭へ, bottom:このパートを末尾へ移動 
    };
    return result;
  }
}

const tagifyInDict = (inDict) => {
  /* this.inDictに現れるボットを表す文字列を{bot}タグに置換する。
    this.inDictに現れる「あなた」などの人称を{user}タグに置き換える。
    
  */

  return inDict.map(line => 
    line.map(text=>tagifyInMessage(text))
  );
  /* this.outDictのレンダリングは出力直前に実行　*/

}

const tagifyInMessage = (text) => {

  let newText = [];
  for(let j in text){
    let str = text[j];
    for (let key of botTagDictKeys){
      for(let word of botTagDict[key]){
        str = str.replace(new RegExp(word,"g"),key);
      }
    }
    newText[j] = str;
    
  }
  return newText;
}

