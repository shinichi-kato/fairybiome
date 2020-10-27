import React, { useState, useRef, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { BotContext } from "../ChatBot/BotProvider";
import { FirebaseContext } from "../Firebase/FirebaseProvider";
import ApplicationBar from "../ApplicationBar/ApplicationBar";
import { configTemplate, wordDictTemplate, partTemplate } from "../../biomebot/template";

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

  function handleLoad(event) {
    event.preventDefault();
    const target = fileInputRef.current.files[0];
    let reader = new FileReader();

    reader.onload = () => {
      const loadedScript = check(reader.result);
      if (loadedScript) {
        bot.dumpToFirestore(fb, {
          ...loadedScript,
          ownerDisplayName: fb.user.displayName,
          state: {
            partOrder: [...loadedScript.config.defaultPartOrder],
            activeInHub: false,
            hp: loadedScript.config.initialHp,
            queue: [],
            buddy: "none"
          }
        });
      }
    };
    reader.readAsText(target);
  }

  function checkDict(dict, treeLabel) {
    let messages = [];
    for (let i = 0; i < dict.length; i++) {
      if (!dict[i].in) {
        messages.push(`${treeLabel}.dictの${i}行に in:["文字列"...] がありません。(E01)`);
      } else if (!isStringArray(dict[i].in)) {
        messages.push(`${treeLabel}.dictの${i}のin$に文字列以外の要素がありました。(E02)`);
      }
      if (!dict[i].out) {
        messages.push(`${treeLabel}.dictの${i}行に out:["文字列"...] がありません。(E03)`);
      } else if (!isStringArray(dict[i].out)) {
        messages.push(`${treeLabel}.dictの${i}のoutに文字列以外の要素がありました。(E04)`);
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

    if (typeof source === "string" && subScript) {
      return [typeof subScript === "string" ? "" : `${treeLabel}の値${subScript}が文字列ではありません。(E05)`];
    }
    // partのようにdump()メソッドがある場合はdump()を使用
    let sourceKeys = Object.keys(source.dump ? source.dump() : source);
    let scriptKeys = Object.keys(subScript);

    for (let key of sourceKeys) {
      const value = source[key];
      const typeOfValue = typeOf(value);

      if (!(key in ["partOrder", "queue"]) && key in subScript) {
        // partOrderとqueueは初期化されるためチェックしない
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

          // console.log("key=",value,"typeOfValue",typeOfValue)
          default:
            // その他：キーの存在を確認
            // sourceに含まれる/^\{[^!]/で始まるキーは任意なので無視
            // sourceに含まれる/^\{!!/で始まるキーは動的に生成されるキーなので無視
            if (!key.match(/^\{([^!]|!!)/) && !(key in subScript)) {
              messages.push(`${treeLabel}${key}がありません。(E06)`);
            }
        }
      } else if (!key.match(/^\{([^!]|!!)/)) {
        messages.push(`${treeLabel}に${key}がありません。(E07)`);
      }
    }

    // scriptに含まれる/^\{[^!]/にマッチするキーは文字列のリストであればOK
    scriptKeys = scriptKeys.filter(key => {
      if (key.match(/^\{[^!]/)) {
        if (!isStringArray(subScript[key])) {
          messages.push(`${treeLabel}[${key}]が文字列のリストではありません。(E08)`);
        }
        return false;
      }
      return true;
    });

    if (scriptKeys.length !== 0) {
      messages.push(`${treeLabel}に正しくないキー${scriptKeys.join(",")}があります。(E09)`);
    }
    return messages;
  }

  function check(json) {
    let loadedScript;
    setContent([]);
    try {
      loadedScript = JSON.parse(json);
    } catch (e) {
      setContent(e);
      return false;
    }

    // config
    const partsResults = loadedScript.config.defaultPartOrder.map(
      partName => checkKeys(loadedScript.parts[partName], partTemplate, `part[${partName}]`));
    let result = [
      ...checkKeys(loadedScript.config, configTemplate, "config"),
      ...checkKeys(loadedScript.wordDict, wordDictTemplate, "wordDict"),
      ...partsResults.reduce((pre, current) => { pre.push(...current); return pre; }, [])
      // ...checkKeys(loadedScript.state, bot.ref.state, "state"),
    ];
    if (result.length !== 0) {
      setContent(result);
      return false;
    }
    return loadedScript;
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
            クラウドに読み込み
          </Button>
        </form>
      </Box>
      <Box>
        {content.map(node => <Typography>{node}</Typography>)}
      </Box>
    </>
  );
}
