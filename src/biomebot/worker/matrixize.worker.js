import {zeros,divide,apply,sum,dot,dotMultiply,
  diag,multiply,isPositive,map,norm,randomInt,matrix} from 'mathjs';

export async function matrixize(dict){
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
  let wv = zeros(squeezedDict.length,vocab.length);
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

  let idf = map(df,x=>Math.log(1+1/x));
  let tfidf = multiply(tf,diag(idf));

  // """
  // 正規化
  // すべてのtfidfベクトルの長さを1にする。これによりretrieveでnormの計算を
  // 毎回しないですむ　"""

  const inv_n = apply(tfidf,1,x=>(divide(1,norm(x))));
  tfidf = multiply(diag(inv_n),tfidf);

  return {
    vocab:vocab,
    wv:wv,
    idf:idf,
    tfidf:tfidf,
    index:index
  }
}


