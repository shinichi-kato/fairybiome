import {randomInt,clone} from 'mathjs';
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
  replier = (x,y,z) => {
    switch(this.type){
      case 'recaller':
        return this.recallerReplier(x,y,z);
      case 'learner':
        return this.learnerReplier(x,y,z);
      default :
        return this.defaultReplier(x,y,z);
    }
  }
 
  //  以下の返答関数を切り替えて使用

  recallerReplier =　(username,text,state) => {
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
    console.log("outdict",this.outDict)
    console.log("indict",this.inDict)
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
    1. ユーザの発言Xに似た行が辞書に見つかれば、それに対する返答を返す。
    2. Xに似た行が見つからなかった場合「
    // 辞書に似た入力があればそれを返す。
    // 1. ユーザから××と言われ、辞書にヒットする言葉がない場合セリフ××を記憶し、
    // どうやって答えたらいいかを聞く。次に帰ってきた答えが
    // 「〇〇って答えたらいいよ」のような内容だった場合、〇〇の部分を抽出し
    // 　{in:["××"],
    //    out:["〇〇"]}
    //  という記憶を追加する。
    // 
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

    /* {!RESERVE_PARSE_ANSWER}が評価された結果、
      上述の○○の部分がstate.responseに格納される。
      state.prevUserInputには常にユーザの一つ前の入力が格納されている。
      state.responseとstate.prevUserInputはそれぞれ
      {RESPONSE}、{PREV_USER_INPUT}で
      辞書から参照できる。
    */
    if(state.response){
      this.dict.push({
        in:[state.prevUserInput],
        out:[state.response]
      });
    }

    // availability check
    if(Math.random() > this.behavior.availability){
      return result;
    }

    // text retrieving
    text = tagifyInMessage(text);
    const ir = textToInternalRepr(text);
    const irResult = retrieve(ir,{
      vocab:this.vocab,
      idf:this.idf,
      tfidf:this.tfidf,
      index:this.index});

    // generosity check
    if(irResult.score < 1-this.behavior.generosity){
        /* 返答候補がなければ
        1. ユーザの入力を記憶
        2. どうやって答えたらいいか聞く
        3. 次のユーザのセリフを回答候補として使うことを予約
      */
      result = {
        text:"{!TELL_ME_WHAT_TO_SAY}",
        queue:["{!RESERVE_PARSE_ANSWER}"],
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

