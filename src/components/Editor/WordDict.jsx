import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 200,
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing(2),

  },
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
          placeholder: "こんにちは！"
        },
        {
          id: "{!IGNORE_BUDDY_FORMATION}",
          description: "妖精がバディ結成をお断りする",
          placeholder: "うーん。ごめんなさい"
        },
        {
          id: "{!NAME_ME}",
          description: "妖精がユーザに名前をつけてほしいと頼む",
          placeholder: "よろしくね！それじゃ、私に名前をつけてください。"
        },
        {
          id: "{!QUERY_NAME_OK}",
          description: "ユーザのつけた名前{botName}でいいか確認",
          placeholder: "{botName}でいい？"
        },
        {
          id: "{!RETRY_NAME_ENTRY}",
          description: "名前の入力をやり直してもらう",
          placeholder: "もう一度お願いします・・・"
        },
        {
          id: "{!THANKS_FOR_BECOMING_BUDDY}",
          description: "妖精がバディになり、名前をくれたお礼をする",
          placeholder: "{botName}だね・・・ありがとう！"
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
          placeholder: "はーーい。呼びました？"
        },
        {
          id: "{!BOT_COMMING_BACK}",
          description: "妖精が自分から帰ってきた",
          placeholder: "ただいまー"
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
          placeholder: "そういうとき、なんて返事したらいの？"
        },
        {
          id: "{!CONFIRM_LEARN}",
          description: "{!USER_UNKNOWN_INPUT},{!BOT_CAND_OUTPUT}を確認",
          placeholder: "「{!USER_UNKNOWN_INPUT}」と言われたら「{!BOT_CAND_OUTPUT}」だね！",
        },
        {
          id: "{!LEARN_FIZZLED}",
          description: "覚える言葉を間違え、取りやめた",
          placeholder: "むつかしいね・・・"
        },
        {
          id: "{!I_GOT_IT}",
          description: "言葉を覚えてお礼を言う",
          placeholder: "ありがとう！"
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
          placeholder: "またね！"
        },
        {
          id: "{!VANISHING}",
          description: "妖精の体力がなくなって消滅する",
          placeholder: "・・・"
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
          placeholder: "ん？|そうなんだ。|もう少し教えてください"
        }
      ]
    }
  ]
};

export default function WordDict() {
  const classes = useStyles();

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} label={nodes.description} nodeId={nodes.id}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null
      }
    </TreeItem>
  );

  return (
    <Box
      className={classes.content}
      display="flex"
      flexDirection="column">
      <Box>
        <Typography>辞書</Typography>
      </Box>
      <Box>
        <TreeView
          className={classes.root}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={["root"]}
        >
          {renderTree(SYSTEM_WORD_DICT)}
        </TreeView>
      </Box>

    </Box>

  );
}
