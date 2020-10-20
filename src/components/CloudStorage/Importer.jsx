import React, { useState, useRef, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { BotContext } from "../ChatBot/BotProvider";
import { FirebaseContext } from "../Firebase/FirebaseProvider";
import ApplicationBar from "../ApplicationBar/ApplicationBar";

function typeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

function isStringArray(arr) {
  if (typeOf(arr) === "array") {
    for (let node of arr) {
      if (typeof node !== "string") {
        return false;
      }
    }
    return true;
  }
  return false;
}

export default function Importer() {
  /*
    JSON形式のテキストファイルからインポート
    インポート時には簡易的な文法チェックを行う。
  */
  const fileInputRef = useRef();
  const bot = useContext(BotContext);
  const fb = useContext(FirebaseContext);
  const [content, setContent] = useState([]);
  const [script, setScript] = useState(null);

  function handleLoad(event) {
    event.preventDefault();
    const target = fileInputRef.current.files[0];
    let reader = new FileReader();
    reader.onload = () => {
      check(reader.result);
    };
    reader.readAsText(target);
  }

  function checkDict(dict, treeLabel) {
    let messages = [];
    for (let i = 0; i < dict.length; i++) {
      if (!dict[i].in) {
        messages.push(`${treeLabel}.dictの${i}行に in:["文字列"...] がありません。`);
      } else if (!isStringArray(dict[i].in)) {
        messages.push(`${treeLabel}.dictの${i}のin$に文字列以外の要素がありました。`);
      }
      if (!dict[i].out) {
        messages.push(`${treeLabel}.dictの${i}行に out:["文字列"...] がありません。`);
      } else if (!isStringArray(dict[i].out)) {
        messages.push(`${treeLabel}.dictの${i}のoutに文字列以外の要素がありました。`);
      }
    }
    return messages;
  }

  function checkArray(subScript, source, treeLabel) {
    const messages = [];
    for (let i = 0; i < source.length; i++) {
      const result = checkKeys(subScript[i], source[i], `${treeLabel}[${i}]`);
      messages.push(...result);
    }
    return messages;
  }

  function checkKeys(subScript, source, treeLabel = "") {
    let messages = [];

    if (typeof source === "string") {
      return [typeof subScript === "string" ? "" : `${treeLabel}の値${subScript}が文字列ではありません。`];
    }

    // partのようにdump()メソッドがある場合はdump()を使用
    let sourceKeys = Object.keys(source.dump ? source.dump() : source);
    let scriptKeys = Object.keys(subScript);

    for (let key of sourceKeys) {
      const value = source[key];
      const typeOfValue = typeOf(value);

      if (key in subScript) {
        scriptKeys = scriptKeys.filter(word => word !== key);

        switch (typeOfValue) {
          case "array":
            // sourcce[key]が配列
            // "dict"という名前の場合は専用のパースを実行
            if (key === "dict") {
              messages.push(...checkDict(subScript.dict, treeLabel));
            } else {
              // checkKeysをiterate
              messages.push(...checkArray(subScript[key], value, treeLabel));
            }
            break;

          case "object":
            // source[key]が辞書
            // 再帰的にcheckKeysを実行
            messages.push(...checkKeys(subScript[key], value, key + "."));
            break;

          default:
            // console.log("key=",value,"typeOfValue",typeOfValue)
            // その他：キーの存在を確認
            // sourceに含まれる/^\{[^!]/で始まるキーは任意なので無視
            // sourceに含まれる/^\{!!/で始まるキーは動的に生成されるキーなので無視
            if (!key.match(/^\{([^!]|!!)/) && !(key in subScript)) {
              messages.push(`${treeLabel}${key}がありません。`);
            }
        }
      } else {
        messages.push(`${treeLabel}に${key}がありません。`);
      }
    }

    // scriptに含まれる/^\{[^!]/にマッチするキーは文字列のリストであればOK
    scriptKeys = scriptKeys.filter(key => {
      if (key.match(/^\{[^!]/)) {
        if (!isStringArray(subScript[key])) {
          messages.push(`${treeLabel}[${key}]が文字列のリストではありません。`);
        }
        return false;
      }
      return true;
    });

    if (scriptKeys.length !== 0) {
      messages.push(`${treeLabel}に正しくないキー${scriptKeys.join(",")}があります。`);
    }
    return messages;
  }

  function check(json) {
    let loadedScript;
    try {
      loadedScript = JSON.parse(json);
    } catch (e) {
      setContent(e);
      return;
    }

    // config
    let result = [
      ...checkKeys(loadedScript.config, bot.ref.config, "config"),
      ...checkKeys(loadedScript.wordDict, bot.ref.wordDict, "wordDict"),
      ...checkKeys(loadedScript.parts, bot.ref.parts, "parts"),
      ...checkKeys(loadedScript.state, bot.ref.state, "state"),
    ];
    if (result.length !== 0) {
      setContent(result);
      // return;
    }
    setScript(loadedScript);
  }

  function handleImport() {
    bot.dumpToFirestore(fb, {
      ...script,
      state: {
        partOrder: [...script.config.partOrder],
        activeInHub: false,
        hp: script.config.initialHp,
        queue: [],
        buddy: "none"
      }
    });
  }

  return (
    <>
      <Box>
        <form onSubmit={handleLoad}>
          <input
            accept=".json,application/json"
            ref={fileInputRef}
            type="file"
          />
          <Button
            type="submit"
          >
            確認
          </Button>
        </form>
      </Box>
      <Box>
        {content.map(node=><Typography>{node}</Typography>)}
      </Box>
      <Box>
        <Button
          color="primary"
          disabled={script !== null}
          onClick={handleImport}
          variant="contained"
        >
          クラウドに読み込み
        </Button>
      </Box>
    </>
  );
}
