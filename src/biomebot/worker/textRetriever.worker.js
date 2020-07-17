import {zeros,divide,apply,sum,dot,dotMultiply,
  diag,multiply,isPositive,map,norm,randomInt,matrix} from 'mathjs';

export async function Matrixize(dict){
  // indexの生成とdictのsqeeze

  let index=[];
  let squeezedDict=[];
  let vocab = new Object();

  for(let i=0,l=dict.length; i<l; i++){
    let line = dict[i];

    squeezedDict.push(...line);

    for(let j=0,m=line.length; j<m; j++){
        index.push(i);
        for(let word of line[j]){
          vocab[word] = true;
        }
    }

  }

  // // vocabの生成
  // vocab = new Object();

  // for(let i=0,l=squeezedDict.length; i<l; i++){

  //   for(let word of squeezedDict[i]){
  //     vocab[word] = true;
  //   }
  // }
  vocab = Object.keys(vocab);

  // """ Term Frequency: 各行内での単語の出現頻度
  //
  //     tf(t,d) = (ある単語tの行d内での出現回数)/(行d内の全ての単語の出現回数の和) """

  // wv
  wv = zeros(squeezedDict.length,vocab.length);
  for (let i=0,l=squeezedDict.length; i<l; i++){

    for(let word of squeezedDict[i]){
        let pos = vocab.indexOf(word);
        if(pos !== -1){
          wv.set([i,pos],wv.get([i,pos])+1);
        }
    }
  }


  // tf = wv / wv.sum(axis=0)
  const inv_wv = apply(wv,1,x=>divide(1,sum(x)) );
  const tf = multiply(diag(inv_wv),wv );


  // """ Inverse Document Frequency: 各単語が現れる行の数の割合
  //
  //     df(t) = ある単語tが出現する行の数 / 全行数
  //     idf(t) = log(1 +1/ df(t) )  """

  const num_of_columns = tf.size()[0];
  const df = apply(wv,0,x=>sum(isPositive(x))/num_of_columns) ;

  idf = map(df,x=>Math.log(1+1/x));
  const tfidf = multiply(tf,diag(idf));

  // """
  // 正規化
  // すべてのtfidfベクトルの長さを1にする。これによりretrieveでnormの計算を
  // 毎回しないですむ　"""

  const inv_n = apply(tfidf,1,x=>(divide(1,norm(x))));
  tfidf = multiply(diag(inv_n),tfidf);

  return {
    vocab:vocab,
    tfidf:tfidf,
    index:index
  }
}


export function Retrieve(text,inDict){
  // 内部表現のリストとして与えられたtextを使ってテキスト検索
  // tfidf,df,vocabを利用してtextに一番似ているdictの行番号を返す
  // wv
  const vocabLength = inDict.vocab.length;
  if(vocabLength === 0){
    return {index:0,score:0}
  }

  const wv = zeros(vocabLength);

  for(let word of text){
      let pos = inDict.vocab.indexOf(word);
      if(pos !== -1){
        wv.set([pos],wv.get([pos])+1);
      }
  }
  if(sum(wv) === 0){
    return { score: 0 ,index:null};
  }

  // tfidf 計算

  const tf = map(wv,x=>x/sum(wv) );
  const tfidf = dotMultiply(tf,inDict.idf);
  // 正規化

  const n = norm(tfidf);
  const ntfidf = map(tfidf,x=>x/n)

  // cos類似度計算(正規化されているので内積と同じ)

  const s = apply(inDict.tfidf,1,x=>dot(x,ntfidf)).valueOf();

  // 最も類似度が高かった行のindexとその類似度を返す。
  // 同点一位が複数あった場合はランダムに一つを選ぶ

  const max = Math.max(...s);
  let cand = [];
  for(let i=0,l=s.length;i<l;i++){
    let score=s[i];
    if(score === max){
      cand.push({index:inDict.index[i],score:score});
    }
  }

  return cand[randomInt(cand.length)];
}
