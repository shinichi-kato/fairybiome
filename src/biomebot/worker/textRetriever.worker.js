import {zeros,divide,apply,sum,dot,dotMultiply,
  diag,multiply,isPositive,map,norm,randomInt,matrix} from 'mathjs';


export default class TextRetriever{
  constructor(dict){
    if(!dict || (isArray(dict) && dict.length !== 0 && dict[0].length === 0)){
      this.vocab=[];  // 出現する全ワードのリスト
      this.idf=null; // 各ワードのidf値
      this.tfidf=null;  // tfidf行列
      this.table=null;  // tfidfの各行がdictのどの行に対応するかを格納したテーブル
      return;
    }else{
      this.compile(dict);
    }


  }

  readJson(json){
    const j=JSON.parse(json);
    this.vocab = [...j.vocab];
    this.idf = matrix(j.idf);
    this.tfidf = matrix(j.tfidf);
    this.table = j.table;
  }

  toJson(){
    return JSON.stringify({
      vocab:this.vocab,
      idf:this.idf.valueOf(),
      tfidf:this.tfidf.valueOf(),
      table:this.table,
    });
  }

  dump(){
    return {
      vocab:this.vocab,
      idf:this.idf.valueOf(),
      tfidf:this.tfidf.valueOf(),
      table:this.table,
    };
  }

  compile(dict){
    /* dictには入力文字列を内部表現化したリスト
    [ [入力1を内部表現化したリスト,入力2を内部表現化したリスト...], ...]
    が渡される。これを
    [入力1を内部表現化したリスト,入力2を内部表現化したリスト,...]
    に展開し、各行がもとのdictのどの行に対応するかをthis.tableに格納する。

    */
    // tableの生成とdictのsqeeze

    this.table=[];
    let squeezedDict=[];
    this.vocab = new Object();

    for(let i=0,l=dict.length; i<l; i++){
      let line = dict[i];

      squeezedDict.push(...line);

      for(let j=0,m=line.length; j<m; j++){
          this.table.push(i);
          for(let word of line[j]){
            this.vocab[word] = true;
          }
      }

    }

    // // vocabの生成
    // this.vocab = new Object();

    // for(let i=0,l=squeezedDict.length; i<l; i++){

    //   for(let word of squeezedDict[i]){
    //     this.vocab[word] = true;
    //   }
    // }
    this.vocab = Object.keys(this.vocab);

    // """ Term Frequency: 各行内での単語の出現頻度
    //
    //     tf(t,d) = (ある単語tの行d内での出現回数)/(行d内の全ての単語の出現回数の和) """

    // wv
    this.wv = zeros(squeezedDict.length,this.vocab.length);
    for (let i=0,l=squeezedDict.length; i<l; i++){

      for(let word of squeezedDict[i]){
          let pos = this.vocab.indexOf(word);
          if(pos !== -1){
            this.wv.set([i,pos],this.wv.get([i,pos])+1);
          }
      }
    }


    // tf = wv / wv.sum(axis=0)
    const inv_wv = apply(this.wv,1,x=>divide(1,sum(x)) );
    const tf = multiply(diag(inv_wv),this.wv );


    // """ Inverse Document Frequency: 各単語が現れる行の数の割合
    //
    //     df(t) = ある単語tが出現する行の数 / 全行数
    //     idf(t) = log(1 +1/ df(t) )  """

    const num_of_columns = tf.size()[0];
    const df = apply(this.wv,0,x=>sum(isPositive(x))/num_of_columns) ;

    this.idf = map(df,x=>Math.log(1+1/x));
    const tfidf = multiply(tf,diag(this.idf));

    // """
    // 正規化
    // すべてのtfidfベクトルの長さを1にする。これによりretrieveでnormの計算を
    // 毎回しないですむ　"""

    const inv_n = apply(tfidf,1,x=>(divide(1,norm(x))));
    this.tfidf = multiply(diag(inv_n),tfidf);
  }




  retrieve(text){
    // 内部表現のリストとして与えられたtextを使ってテキスト検索
    // tfidf,df,vocabを利用してtextに一番似ているdictの行番号を返す
    // wv
    const vocabLength = this.vocab.length;
    if(vocabLength === 0){
      return {index:0,score:0}
    }

    const wv = zeros(vocabLength);

    for(let word of text){
        let pos = this.vocab.indexOf(word);
        if(pos !== -1){
          wv.set([pos],wv.get([pos])+1);
        }
    }
    if(sum(wv) === 0){
      return { score: 0 ,index:null};
    }

    // tfidf 計算

    const tf = map(wv,x=>x/sum(wv) );
    const tfidf = dotMultiply(tf,this.idf);
    // 正規化

    const n = norm(tfidf);
    const ntfidf = map(tfidf,x=>x/n)

    // cos類似度計算(正規化されているので内積と同じ)

    const s = apply(this.tfidf,1,x=>dot(x,ntfidf)).valueOf();

    // 最も類似度が高かった行のindexとその類似度を返す。
    // 同点一位が複数あった場合はランダムに一つを選ぶ

    const max = Math.max(...s);
    let cand = [];
    for(let i=0,l=s.length;i<l;i++){
      let score=s[i];
      if(score === max){
        cand.push({index:this.table[i],score:score});
      }
    }

    return cand[randomInt(cand.length)];
  }
}

function isArray(obj){
	return Object.prototype.toString.call(obj) === '[object Array]';
}
