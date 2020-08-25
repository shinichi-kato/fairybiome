import React, { useReducer, useEffect, useState, useMemo, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import WidgetsIcon from "@material-ui/icons/Widgets";
import FaceIcon from "@material-ui/icons/SentimentSatisfied";
import TreeItem from "@material-ui/lab/TreeItem";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 220,
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing(2),
  },
  tree: {
    overflowY: "scroll",
    height: 200,
    backgroundColor: theme.palette.background.paper
  },
  input: {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1)
  }
}));

const SYSTEM_WORD_DICT = {
  id: "_root",
  description: "妖精のことば辞書",
  children: [
    {
      id: "_namingProtocol",
      description: "妖精との出会い",
      children: [
        {
          id: "{!NICE_TO_MEET_YOU}",
          description: "妖精が初めてユーザにあいさつ",
          defaultValue: "こんにちは！"
        },
        {
          id: "{!IGNORE_BUDDY_FORMATION}",
          description: "妖精がバディ結成をお断りする",
          defaultValue: "うーん。ごめんなさい"
        },
        {
          id: "{!NAME_ME}",
          description: "妖精がユーザに名前をつけてほしいと頼む",
          defaultValue: "よろしくね！それじゃ、私に名前をつけてください。"
        },
        {
          id: "{!QUERY_NAME_OK}",
          description: "ユーザのつけた名前{botName}でいいか確認",
          defaultValue: "{botName}でいい？"
        },
        {
          id: "{!RETRY_NAME_ENTRY}",
          description: "名前の入力をやり直してもらう",
          defaultValue: "もう一度お願いします・・・"
        },
        {
          id: "{!THANKS_FOR_BECOMING_BUDDY}",
          description: "妖精がバディになり、名前をくれたお礼をする",
          defaultValue: "{botName}だね・・・ありがとう！"
        }
      ]
    },
    {
      id: "_awayAndHome",
      description: "妖精が出かける/帰ってくる",
      children: [
        {
          id: "{!BOT_ACCEPT_SUMMON}",
          description: "妖精が呼びかけに応えて姿を表す",
          defaultValue: "はーーい。呼びました？"
        },
        {
          id: "{!BOT_COMING_BACK}",
          description: "妖精が自分から帰ってきた",
          defaultValue: "ただいまー"
        }
      ]
    },
    {
      id: "_learning",
      description: "言葉を覚える",
      children: [
        {
          id: "{!TELL_ME_WHAT_TO_SAY}",
          description: "知らない言葉をかけられた時、どう答えていいか聞く",
          defaultValue: "そういうとき、なんて返事したらいの？"
        },
        {
          id: "{!CONFIRM_LEARN}",
          description: "{!USER_UNKNOWN_INPUT},{!BOT_CAND_OUTPUT}を確認",
          defaultValue: "「{!USER_UNKNOWN_INPUT}」と言われたら「{!BOT_CAND_OUTPUT}」だね！",
        },
        {
          id: "{!LEARN_FIZZLED}",
          description: "覚える言葉を間違え、取りやめた",
          defaultValue: "むつかしいね・・・"
        },
        {
          id: "{!I_GOT_IT}",
          description: "言葉を覚えてお礼を言う",
          defaultValue: "ありがとう！"
        }
      ]
    },
    {
      id: "_goodbye",
      description: "妖精との別れ",
      children: [
        {
          id: "{!DISBAND}",
          description: "妖精がバディでなくなる",
          defaultValue: "またね！"
        },
        {
          id: "{!VANISHING}",
          description: "妖精の体力がなくなって消滅する",
          defaultValue: "・・・"
        }
      ]
    },
    {
      id: "_dairy",
      description: "普段の言葉",
      children: [
        {
          id: "{!NOT_FOUND}",
          description: "返事が見つからなかった場合の対応。",
          defaultValue: "ん？|そうなんだ。|もう少し教えてください"
        }
      ]
    }
  ]
};

function initialize(wordDict) {
  const userDict = Object.assign({},
    ...Object.entries(wordDict).filter(
      ([key, ]) => !key.startsWith("{!")).map(
        ([key, val]) => ({ [key]: val }))
  );
  const sysDict = Object.assign({},
    ...Object.entries(wordDict).filter(
      ([key, ]) => key.startsWith("{!")).map(
        ([key, val]) => ({ [key]: val }))
  );
  return {
    sysDict: { ...sysDict },
    userDict: { ...userDict },
    sysNode: null,
    // sysValue: null,
    userKey: null,
    // userValue: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "selectSysNode": {
      // treeViewでノードを選択
      if (action.sysValue) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          sysDict: {
            ...state.sysDict,
            [state.sysNode.id]: action.sysValue.split("|")
          },
          sysNode: action.sysNode,
          // sysValue: state.sysDict[action.node.id].join("|")
        };
      }
      return {
        ...state,
        sysNode: action.sysNode,
        // sysValue: state.sysDict[action.node.id].join("|")
      };
    }

    case "unselectSysNode": {
      if (action.sysValue) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          sysDict: {
            ...state.sysDict,
            [state.sysNode.id]: action.sysValue.split("|")
          },
          sysNode: null,
          // sysValue: null,
        };
      }
      return {
        ...state,
        sysNode: null,
        // sysValue: null,
      };
    }
    // case "editSysValue": {
    //   return {
    //     ...state,
    //     sysValue: action.value
    //   };
    // }

    case "selectUserNode": {
      // treeViewでノードを選択
      if (action.userKey && action.userValue) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          userDict: {
            ...state.userDict,
            [state.userKey]: action.userValue.split("|")
          },
          userKey: action.userKey,
          // userValue: state.userDict[action.key].join("|")
        };
      }
      return {
        ...state,
        userKey: action.userKey,
        // userValue: state.userDict[action.key].join("|")
      };
    }

    case "unselectUserNode": {
      if (action.userKey) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          userDict: {
            ...state.userDict,
            [state.userKey]: action.userValue.split("|")
          },
          userKey: null,
          // userValue: null,
        };
      }
      return {
        ...state,
        userKey: null,
        // userValue: null,
      };
    }

    // case "editUserValue": {
    //   return {
    //     ...state,
    //     userValue: action.value
    //   };
    // }

    case "deleteUserKey": {
      // action.keyで与えられたデータを削除
      let newDict = { ...state.userDict };
      delete newDict[action.key];
      return {
        ...state,
        userDict: newDict,
        userKey: null,
        // userValue: null
      };
    }

    case "writeback": {
      return {
        ...state,
        sysDict: {
          ...action.sysDict,
          [action.sysNode.id]: action.sysValue.split("|")
        },
        userDict: {
          ...action.userDict,
          [action.userKey]: action.userValue.split("|")
        },
      };
    }

    default:
      throw new Error(`invalid action ${action.type}`);
  }
}

export default function WordDict(props) {
  const classes = useStyles();
  const memorizedInitialState = useMemo(() => initialize(props.wordDict), [props.wordDict]);
  const [state, dispatch] = useReducer(reducer, memorizedInitialState);
  const [sysNode, setSysNode] = useState(null);
  const [sysValue, setSysValue] = useState(null);
  const [userKey, setUserKey] = useState(null);
  const [userValue, setUserValue] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (props.pageWillChange) {
      dispatch({
        type: "writeback",
        sysNode: sysNode,
        sysValue: sysValue,
        userKey: userKey,
        userValue: userValue
      });
      props.handleSave({ ...state.sysDict, ...state.userDict });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pageWillChange]);

  function handleClickSysLabel(event, node) {
    if (node.defaultValue) {
      event.preventDefault();
      dispatch({
        type: "selectSysNode",
        sysNode: node,
        sysValue: sysValue
      });
      setSysNode(node);
      setSysValue(state.sysDict[node.id].join("|"));
    } else {
      dispatch({
        type: "unselectSysNode",
        sysNode: node,
        sysValue: sysValue
      });
      setSysNode(null);
      setSysValue(null);
    }
  }

  function handleClickUserLabel(event, key) {
    if (key === "_root") {
      dispatch({
        type: "unselectUserNode",
        userKey: key,
        userValue: userValue
      });
      setUserKey(null);
      setUserValue(null);
    } else {
      event.preventDefault();
      dispatch({
        type: "selectUserNode",
        userKey: key,
        userValue: userValue
      });
      setUserKey(key);
      const val = state.userDict[key];
      if (val) {
        setUserValue(state.userDict[key].join("|"));
      }
    }
  }

  function handleChangeSysValue(event) {
    setSysValue(event.target.value);
  }

  function handleChangeUserKey(event) {
    // "}"が入力されたらuserDict検索を行い、値があれば反映
    const key = event.target.value;
    setUserKey(key);
    if (key.startsWith("{!")) {
      // "{!"で始まったらエラー
      setMessage("{!で始まる名前はつかえません");
    } else {
      setMessage(null);
    }
    if (!message && key.endsWith("}")) {
      const val = state.userDict[key];
      if (val) {
        setUserValue(val.join("|"));
      }
    }
  }

  function handleChangeUserValue(event) {
    setUserValue(event.target.value);
  }

  function handleDeleteUserDictKey(key) {
    dispatch({ type: "deleteUserKey", key: key });
    setUserKey(null);
    setUserValue(null);
  }

  const renderSysTree = (nodes) => (
    <TreeItem
      key={nodes.id}
      label={nodes.description}
      nodeId={nodes.id}
      onIconClick={e => handleClickSysLabel(e, nodes)}
      onLabelClick={e => handleClickSysLabel(e, nodes)}
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderSysTree(node))
        : null
      }
    </TreeItem>
  );

  const initialSysTree = useRef(renderSysTree(SYSTEM_WORD_DICT));

  const renderUserTree = (dict) => (
    <TreeItem
      key="_root"
      label="会話用ことば辞書"
      nodeId="_root"
    >
      {Object.entries(dict).map(([key, val]) =>
        (<TreeItem
          key={key}
          label={key}
          nodeId={key}
          onIconClick={e => handleClickUserLabel(e, key, val)}
          onLabelClick={e => handleClickUserLabel(e, key, val)}
        />))
      }
    </TreeItem>
  );

  return (
    <Box
      className={classes.content}
      display="flex"
      flexDirection="column">
      <Box
        className={classes.root}
      >
        <TreeView
          className={classes.tree}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultEndIcon={<WidgetsIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={["_root", "_namingProtocol"]}
        >
          {initialSysTree.current}
        </TreeView>
      </Box>
      <Box>
        <Typography>{sysNode && sysNode.deafultValue && sysNode.description}</Typography>
        <form>
          <Input
            className={classes.input}
            fullWidth
            onChange={handleChangeSysValue}
            placeholder={sysNode && sysNode.defaultValue}
            value={sysValue || ""}
          />
          <Typography
            variant="subtitle1"
          >
            場面に応じた妖精のセリフを設定します。返答の中にタグが含まれていたら、
            そのタグはタグの値文字列に置き換えられます。
            返答の候補が複数ある場合は|で区切ってください。
          </Typography>
        </form>

      </Box>
      <Box>
        <Typography>タグ</Typography>
      </Box>
      <Box>
        <TreeView
          className={classes.tree}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultEndIcon={<FaceIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={["_root"]}
        >
          {renderUserTree(state.userDict)}
        </TreeView>
      </Box>
      <Box>
        <form>
          <Typography>ユーザ辞書のキー</Typography>
          <Input
            className={classes.input}
            fullWidth
            onChange={handleChangeUserKey}
            placeholder={userKey}
            startAdornment={
              <InputAdornment position="start">
                <FaceIcon />
              </InputAdornment>
            }
            value={userKey || ""}
          />
          <Typography color="error">{message}</Typography>
          <Typography>ユーザ辞書の値</Typography>
          <Input
            className={classes.input}
            fullWidth
            onChange={handleChangeUserValue}
            value={userValue || ""}
          />
          <Typography
            variant="subtitle1"
          >
            妖精のセリフの中に上の文字列があった場合、下の文字列に置き換わります。
            上の文字列は{"{ }"}でくくり、中の文字は小文字(a〜z)と下線(_)だけが使えます
            返答の候補が複数ある場合は|で区切ってください
          </Typography>
          <Button onClick={() => handleDeleteUserDictKey(state.userKey)}>
            この項目を削除
          </Button>
        </form>

      </Box>
      <Box>
        <Button>項目を新規に作成</Button>
      </Box>
    </Box>

  );
}
