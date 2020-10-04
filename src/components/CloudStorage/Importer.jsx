import React, { useState, useRef, useContext } from "react";
import { makeStyles, fade } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import Typography from "@material-ui/core/Typography";
import FileIcon from "@material-ui/icons/DescriptionOutlined";

import { BotContext } from "../ChatBot/BotProvider";
import ApplicationBar from "../ApplicationBar/ApplicationBar";
const useStyles = makeStyles((theme) => ({

  content: {
    padding: theme.spacing(2),

  },

}));

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
  const classes = useStyles();
  const fileInputRef = useRef();
  const bot = useContext(BotContext);
  const [content, setContent] = useState(null);

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

  function checkArray(script, source, treeLabel) {
    const messages = [];
    for (let i = 0; i < source.length; i++) {
      const result = checkKeys(script[i], source[i], `${treeLabel}[${i}]`);
      messages.push(...result);
    }
    return messages;
  }

  function checkKeys(script, source, treeLabel = "") {
    let messages = [];

    if (typeof source === "string") {
      return typeof script === "string" ? "" : `${treeLabel}の値${script}が文字列ではありません。`;
    }

    let scriptKeys = Object.keys(script);

    for (let key of Object.keys(source)) {
      const value = source[key];
      const typeOfValue = typeOf(value);

      if (key in script) {
        scriptKeys = scriptKeys.filter(word => word !== key);

        switch (typeOfValue) {
          case "array":
            // sourcce[key]が配列
            // "dict"という名前の場合は専用のパースを実行
            if (key === "dict") {
              messages.push(...checkDict(script.dict, treeLabel));
            } else {
              // checkKeysをiterate
              messages.push(...checkArray(script[key], value, treeLabel));
            }
            break;

          case "object":
            // source[key]が辞書
            // 再帰的にcheckKeysを実行
            messages.push(...checkKeys(script[key], value, key + "."));
            break;

          default:
            // その他：キーの存在を確認
            // sourceに含まれる/^\{[^!]/で始まるキーは任意なので無視
            if (!key.match(/^\{[^!]/) && !(key in script)) {
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
        if (!isStringArray(script[key])) {
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
    let script;
    try {
      script = JSON.parse(json);
    } catch (e) {
      setContent(e);
      return;
    }

    // config
    let result = [
      ...checkKeys(script.config, bot.ref.config, "config"),
      ...checkKeys(script.wordDict, bot.ref.wordDict, "wordDict"),
      ...checkKeys(script.part, bot.ref.part, "part"),
    ];
    if (result.length !== 0) {
      setContent(result);
      return;
    }
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
            読み込み
          </Button>
        </form>
      </Box>
      <Box>
        {content}
      </Box>
    </>
  );
}
