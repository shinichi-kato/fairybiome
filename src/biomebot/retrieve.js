import {zeros,divide,apply,sum,dot,dotMultiply,
  isPositive,map,norm,randomInt,matrix} from 'mathjs';


export function retrieve(text,inDict){
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
      cand.push(inDict.index[i]);
    }
  }

  return {score:score,index:cand[randomInt(cand.length)]};
}
