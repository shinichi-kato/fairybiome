import React, { useReducer, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
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
          id: "{!BOT_COMMING_BACK}",
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
    sysDict: { sysDict },
    userDict: { userDict },
    sysNode: null,
    sysValue: null,
    userKey: null,
    userValue: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "selectSysNode": {
      // treeViewでノードを選択
      if (state.node) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          sysDict: {
            ...state.sysDict,
            [state.sysNode.id]: state.sysValue.split("|")
          },
          sysNode: action.node,
          sysValue: state.sysDict[action.node.id].join("|")
        };
      }
      return {
        ...state,
        sysNode: action.node,
        sysValue: state.sysDict[action.node.id].join("|")
      };
    }

    case "unselectSysNode": {
      if (state.sysNode) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          sysDict: {
            ...state.sysDict,
            [state.sysNode.id]: state.sysValue.split("|")
          },
          sysNode: null,
          sysValue: null,
        };
      }
      return {
        ...state,
        node: null,
        sysValue: null,
      };
    }
    case "editSysValue": {
      return {
        ...state,
        sysValue: action.value
      };
    }

    case "selectUserNode": {
      // treeViewでノードを選択
      if (state.userKey) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          userDict: {
            ...state.userDict,
            [state.userKey]: state.userValue.split("|")
          },
          userKey: action.key,
          userValue: state.userDict[action.key].join("|")
        };
      }
      return {
        ...state,
        userKey: action.key,
        userValue: state.userDict[action.key].join("|")
      };
    }

    case "unselectUserNode": {
      if (state.userKey) {
        // 過去に選択したノードがあれば値をライトバック
        return {
          ...state,
          userDict: {
            ...state.userDict,
            [state.userKey]: state.userValue.split("|")
          },
          userKey: null,
          userValue: null,
        };
      }
      return {
        ...state,
        userKey: null,
        userValue: null,
      };
    }

    case "editUserValue": {
      return {
        ...state,
        userValue: action.value
      };
    }

    case "writeback": {
      return {
        ...state,
        sysDict: {
          ...state.sysDict,
          [state.node.id]: state.value.split("|")
        },
        userDict: {
          ...state.userDict,
          [state.userKey]: state.userValue.split("|")
        },
      };
    }

    default:
      throw new Error(`invalid action ${action.type}`);
  }
}

export default function WordDict(props) {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialize(props.wordDict));

  useEffect(() => {
    if (props.pageWillChange) {
      dispatch({ type: "writeback" });
      props.handleSave({ ...state.sysDict, ...state.userDict });
    }
  }, [props.pageWillChange]);

  function handleClickSysLabel(event, node) {
    if (node.defaultValue) {
      event.preventDefault();
      dispatch({ type: "selectSysNode", node: node });
    } else {
      dispatch({ type: "unselectSysNode" });
    }
  }

  function handleClickUserLabel(event, key) {
    if (key === "_root") {
      dispatch({ type: "unselectUserNode" });
    } else {
      event.preventDefault();
      dispatch({ type: "selectUserNode", key: key });
    }
  }

  function handleSysChange(event) {
    dispatch({ type: "editSysValue", value: event.target.value });
  }

  function handleUserChange(event) {
    dispatch({type: "editUserValue", value: event.target.value });
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
          {renderSysTree(SYSTEM_WORD_DICT)}
        </TreeView>
      </Box>
      <Box>
        <Typography>{state.sysNode && state.sysNode.deafultValue && state.sysNode.description}</Typography>
        <form>
          <Input
            className={classes.input}
            fullWidth
            onChange={handleSysChange}
            placeholder={state.sysNode && state.sysNode.defaultValue}
            value={state.sysValue || ""}
          />
          <Typography
            variant="subtitle1"
          >返答の候補が複数ある場合は|で区切ってください</Typography>
        </form>

      </Box>
      <Box>
        <Typography>単語辞書</Typography>
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
        <Typography>{state.userKey}</Typography>
        <form>
          <Input
            className={classes.input}
            fullWidth
            onChange={handleUserChange}
            placeholder={state.userValue}
            value={state.userValue || ""}
          />
          <Typography
            variant="subtitle1"
          >返答の候補が複数ある場合は|で区切ってください</Typography>
        </form>

      </Box>
    </Box>

  );
}
