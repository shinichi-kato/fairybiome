import {TinySegmenter} from './tinysegmenter.js';
 // note: [<>{}+-]がアルファベットに分類されるよう変更の必要あり

function dispatch(table){
  const rt = table['*'].map(c=>new Object()); // c=>{} not work
  for(let k in table){
    for(let i in table[k]){
      let v=table[k][i];
      if (v!==0){
        rt[i][k] = v
      }
    }
  }
  return rt;
}

const DI_PARTICLE_MAP = {
    'が':'主語','は':'主語',
    'の':'所有',
    'に':'目的','へ':'目的','を':'目的',
    'で':'理由'
}

/* https://bottlecaps.de/rr/ui に貼り付けるとdiagram画鋲ができる
Particle ::= ("が" | "を" | "に" | "は" | "へ" | "で" | "の" ) 
Directive ::= "<...>"
Text ::= ( "*"^Particle Particle? | Particle | Directive | ("%" ("[0-9][0-9]" | [0-9A-F] [0-9A-F] | "[A-F][A-F]" ) ))+
*/
const STATE_TABLE = {
    //     0  1  2  3  4  5  6  7  8
    '*' : [2, 2, 2, 2, 0, 0, 2, 2, 2],
    'p' : [1, 0, 3, 0, 0, 0, 0, 0, 0],
    '%' : [4, 4, 4, 4, 0, 0, 4, 4, 4],
    'dA': [0, 0, 0, 0, 5, 6, 0, 0, 0],
    'AA': [0, 0, 0, 0, 7, 0, 0, 0, 0],
    '<>': [0, 0, 8, 8, 0, 0, 0, 0, 8],

}
const STATE_TABLE_DISPATCH = dispatch(STATE_TABLE);

const LEX = {
  '*' : s => false,
  'p' : s => Boolean(DI_PARTICLE_MAP[s]),
  '%' : s => s === '%',
  'dA': s => Boolean('0123456789ABCDEF'.indexOf(s)),
  'AA': s => s.length === 2 && Boolean('ABCDEF'.indexOf(s[0])),
  '<>': s => s[0] === '<' && s.slice(-1) === '>',
};


function next_state(state,node){
  let defaultval = 0;
  const states = STATE_TABLE_DISPATCH[state]
  for(let key in states){
    const val = states[key];
    if(key === '*'){
      defaultval = val;
      continue;
    }
    if(LEX[key](node)) return val;
  }
  return defaultval;
}



export default class InternalRepr{
  /*
  ユーザ発言やスクリプトの入力文字列を内部表現に変換する。

  入力文字列の内部表現
  --------------------
  入力文字列は自然な日本語、入出力スクリプトははチャットボットの動作に影響を与える
  コマンド <[a-Z_]+> や、チャットボットの記憶 {[a-Z_]+} が含まれる日本語である。
  これらの文字列をテキスト検索するために内部表現を用いる。

  内部表現は分かち書きされた単語や形態素のリストであり、
  分かち書きにはTinySegmenterを用いる。

  ・内部表現は分かち書きされた単語や形態素（ノードと呼ぶ）のリストであり、コマンドや記憶もノードを
  構成する。
  分かち書きにはTinySegmenterを用い、TinySegmenterでの文字種の分類を変更して[<>{}]が
  アルファベット列と同じグループになるようにすることでコマンドと記憶をノードとして分かち書きしている。

  {memory}のことを教えてよ　→ ["{memory}","の","こと","教えて","よ"]

  ・また「お母さん」や「母」、「(^_^)」のように表記のバリエーションがありつつセリフの意味に
  重大な影響を及ぼすノードは　お母さん → {_Mother_} , >_< →　{_Kaomoji_cry_}のように
  タグ化する。
  ・さらに「猫が捕まえた」と「猫を捕まえた」の意味の違いを保持するため、単語＋助詞という並びが
  見つかったら「"猫","が"」ではなく「"猫","<猫:主語>"」という2ノードにする。
  ・ここで[:<>{}]がもとのセリフ(記憶やコマンドを意味しない文字列)に含まれていると記憶や
  コマンドをノードに分離できなくなるため、予めURLエンコードし、最後にデコードを行う。

  例：お母さんが怒られた
  ["{_Mother_}","<{_Mother_}:が>","怒ら","れ","た"]

  ※「親に怒られた」というin辞書で「お父さんに怒られた」や「お母さんに怒られた」というユーザ入力にも
  自動的にヒットしてほしい。そのため「親＝親×1 + お父さん×0.7 + お母さん×0.7」というようにTFIDF
  上で処理を行う。

  ■ ユーザ入力への処理 (from_message())
  顔文字タグ化 → [:<>{}]エンコード → 分かち書き → 日本語タグ化 → 助詞の前の単語の畳込み処理 + URLデコード

  ■ スクリプトの入力文字列への処理
  顔文字タグ化 → 分かち書き → 日本語タグ化 → 助詞の前の単語の畳込み処理 + URLデコード
  ※スクリプトでは[:<>{}]は予めURLエスケープされているものとみなす。

  */
  constructor(){
    this.segmenter = new TinySegmenter();
  }

  from_message(message){
    // messageにはユーザ名とテキストが格納されている。
    // ユーザ名は{userName}に
    let nodes = this.segmenter.segment(message.text);
    nodes = this.parse(nodes);
    return nodes;
  }

  from_inDict(texts){
    // 「文字列リスト」のリストを受け取り、
    // 「文字列を内部表現化したリスト」を返す

    return texts.map(text=>{
      const nodes = this.segmenter.segment(text);
      return this.parse(nodes);
    });
  }

  parse(text){
    let line = [];
    let buff = [];
    let state = 0;

    for(let node of text){
      state = next_state(state,node);

      switch(state) {
        case 0 : {
          // clear
          line.push(...buff);
          buff.length = 0;
          continue;
        }
        case 1 :
        case 2 : {
          // through
          buff.length=0;
          line.push(node);
          continue;
        }
        case 3: {
          // 非コマンドノードに続く助詞
          const particle = DI_PARTICLE_MAP[node];
          line.push("<"+line.slice(-1)+":"+particle+">");
          buff.length=0;
          continue
        }
        default: {}
      }

      buff.push(node);

      switch (state) {
        case 6:
        case 7:{
            line.push(buff.join(""));
            break;
        }
        default:{}
      }
    }
    return line;
  }
}
