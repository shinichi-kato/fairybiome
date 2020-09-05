import React, { useContext, useEffect, useState, useRef } from "react";
import { StaticQuery, graphql } from "gatsby";
import { randomInt } from "mathjs";

import { localStorageIO } from "../../utils/localStorageIO";

import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import ApplicationBar from "../ApplicationBar/ApplicationBar";
import { RightBalloon, LeftBalloon, SystemLog } from "./balloons.jsx";
import Console from "./console.jsx";
import { toTimestampString } from "../to-timestamp-string.jsx";
import { FirebaseContext } from "../Firebase/FirebaseProvider";
import { BotContext } from "../ChatBot/BotProvider";

import {readFromFirestore} from "../../biomebot/biomebotIO.jsx";

// fairyディレクトリの妖精の中でHabitatにいるものを抽出
const query = graphql`
query Myq {
  allFile(filter: {sourceInstanceName: {eq: "fairy"}}) {
    edges {
      node {
        relativePath
        childFairyJson {
          config {
            buddyUser
            displayName
            photoURL
          }
          state {
            hp
            buddy
          }
        }
      }
    }
  }
  site {
    siteMetadata {
      localLogLinesMax
      chatLinesMax
      habitatNumOfFairyMax
      habitatFairyHpMax
    }
  }
}
`;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  bar: {
    borderRadius: 5,
    height: 10,
    backgroundColor: ""
  },
  avatar: {
    width: 40,
    height: 40
  },
  currentAvatar: {
    width: 80,
    height: 80,
  },
  avatarContainer: {
    width: 120,

  },
  avatarSelector: {
    height: 200,
    marginTop: 15,
  },
  avatarCard: {
    padding: theme.spacing(1),
    width: "95%",
  },
  main: {
    height: "calc( 100vh - 64px - 48px - 200px )",
    overflowY: "scroll",
    overscrollBehavior: "auto",
    WebkitOverflowScrolling: "touch",
    padding: 0
  },

}));

export default function Habitat() {
  /*
    妖精の生息地

    firestore や /static/fairy上にある妖精のうち、
    ランダムに何体かが現れる。そのうちの一体を選んで会話できる。
    妖精と会話すると、仲間にできる場合がある。

    妖精の出現傾向
    妖精が出現する数は0〜4の乱数、現れる妖精のHP最大値は0〜100の乱数で決まる
    また出現している妖精の顔ぶれはアプリ起動中変わらない。

  */
  const classes = useStyles();

  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const fairiesListRef = useRef(null);
  const hpMaxRef = useRef();
  const numOfFairyRef = useRef();
  const localLogLinesMaxRef = useRef(10);
  const chatLinesMaxRef = useRef(10);
  const fairiesRef = useRef([]);
  const [currentFairy, setCurrentFairy] = useState(null);
  const [botBusy, setBotBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [pageWillChange, setPageWillChange] = useState(null);

  // const seed = Math.floor(fb.timestampNow().seconods/(60*HABITAT.update_interval));

  // ---------------------------------------------------
  // 初期は話し相手を指定しない状態で起動

  useEffect(() => {
    bot.deployHabitat(null);
  }, [] // eslintで警告が出るが、空の配列を渡す
  );

  function handleCatchFairy(path) {
    setCurrentFairy(path);

    if (path === "__localStorage__") {
      const fairy = bot.getFairyFromLocalStorage();
      bot.deployHabitat(fairy);
      writeLog(`${fairy.config.displayName}があなたのすぐそばに来た`);
    } else if (path.endsWith(".json")) {
      fetch(`../../fairy/${path}`)
        .then(res => res.json())
        .then(fairy => {
          bot.deployHabitat(fairy);
          writeLog("妖精があなたのそばにやって来た");
        })
        .catch(error => {
          writeLog(error.message);
        });
    } else {
      // firestoreからダウンロード
      readFromFirestore(fb, path)
        .then(fairy => {
          bot.deployHabiat(fairy);
          writeLog("妖精があなたのほうを見ている");
        });
    }
  }

  function FairyAvatar(props) {
    return (
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
      >
        <Box>
          <IconButton
            onClick={() => handleCatchFairy(props.relativePath)}
          >
            <Avatar
              className={
                currentFairy === props.relativePath
                  ?
                  classes.currentAvatar : classes.avatar
              }
              src={`../../svg/${props.photoURL}`} />
          </IconButton>

        </Box>
        <Box>
          <Typography>{props.displayName || "まだ名前のない妖精"}</Typography>
        </Box>
        <Box
          className={classes.avatarContainer}
        >
          <LinearProgress
            className={classes.bar}
            size={100}
            value={Number(props.hp)}
            variant="determinate" />
        </Box>
      </Box>
    );
  }

  function FairiesList(props) {
    // fairyディレクトリ、 ユーザのバディ、firestoreそれぞれの妖精を抽出し、
    // ランダムに数名を選んで表示
    // ※FairiesList中でuseStateは使用できない

    if (fairiesListRef.current === null) {
      // fairyディレクトリの妖精はgraphqlで抽出
      let data = props.data.allFile.edges.map(edge => {
        const jsonData = edge.node.childFairyJson;
        return {
          relativePath: edge.node.relativePath,
          displayName: jsonData.config.displayName,
          photoURL: jsonData.config.photoURL,
          buddyUser: jsonData.config.buddyUser,
          hp: jsonData.state.hp,
        };
      });
      const siteMetadata = props.data.site.siteMetadata;
      const hpMax = siteMetadata.habitatFairyHpMax;
      const numOfFairyMax = siteMetadata.habitatNumOfFairyMax;

      hpMaxRef.current = randomInt(hpMax);
      numOfFairyRef.current = randomInt(numOfFairyMax);
      fairiesListRef.current = [...data];

      // firestore上のbotをfetchして加える
      const botsRef = fb.firestore.collection("bots");
      botsRef.where("buddy", "==", "habitat")
        .limit(10)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            const node = doc.data();
            data.push({
              relativePath: doc.id,
              displayName: node.config.displayName,
              photoURL: node.config.photoURL,
              buddyUser: node.config.buddyUser,
              hp: node.state.hp,
            });
          });
        });

      // hp が 1d100値よりも小さい妖精に絞り込む
      let allFairies = data.filter(fairy => fairy.hp < hpMaxRef.current);

      // ユーザのバディがhabitatにいればこれに加える。
      const buddyState = bot.getBuddyState();
      if (buddyState.buddy === "habitat") {
        allFairies.push({
          relativePath: "__localStorage__",
          displayName: buddyState.displayName,
          photoURL: buddyState.photoURL,
          buddyUser: fb.user.displayName,
          hp: buddyState.hp
        });
      }

      // そのうちの0〜4名をランダムに選ぶ
      let selectedFairies = [];
      numOfFairyRef.current = Math.min(numOfFairyRef.current, allFairies.length);

      if (numOfFairyRef.current !== 0) {
        for (let i = 0; i < numOfFairyRef.current; i++) {
          let index = randomInt(allFairies.length);
          selectedFairies.push(allFairies[index]);
          allFairies.splice(index, 1);
        }
        fairiesRef.current = [...selectedFairies];
      }

      // ついでにチャットログ用の定数をセット
      localLogLinesMaxRef.current = siteMetadata.localLogLinesMax;
      chatLinesMaxRef.current = siteMetadata.chatLinesMax;
    }

    return (
      <div>
        {
          numOfFairyRef.current === 0
            ?
            <Typography>今は誰もいないようだ・・・</Typography>
            :
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-evenly"
            >
              {fairiesRef.current.map((fairy, index) => <FairyAvatar {...fairy} key={index} />)}
            </Box>
        }
      </div>
    );
  }

  function handleWriteMessage(text) {
    if (text === null) {
      return;
    }
    const message = {
      displayName: fb.user.displayName,
      photoURL: fb.user.photoURL,
      text: text,
      speakerId: fb.user.uid,
    };

    writeLog(message);

    setBotBusy(true);
    bot.replyHabitat(fb.user.displayName, text)
      .then(reply => {
        if (reply.text !== null) {
          let message = {
            displayName: reply.displayName,
            photoURL: reply.photoURL,
            text: reply.text,
            speakerId: reply.displayName,
          };

          if (reply.text.indexOf("{!BYE}") !== -1) {
            message.text = reply.text.replace("{!BYE}", "");

            writeLog(message);

            bot.deployHabitat(null);
            setCurrentFairy(null);

            writeLog("妖精は離れていった");
          } else {
            writeLog(message);
          }

          setBotBusy(false);
        }
      });
    // .catch(e=>{
    //   writeLog({
    //     displayName:"error",
    //     photoURL:"",
    //     text:e.message,
    //     speakerId:bot.DisplayName,
    //     timestamp:toTimestampString(fb.timestampNow())
    //   })
    //   setBotBusy(false);
    // })
  }

  function writeLog(message) {
    let newMessage;
    if (typeof message === "string") {
      newMessage = {
        displayName: null,
        photoURL: null,
        text: message,
        speakerId: null,
        timestamp: toTimestampString(fb.timestampNow())
      };
    } else {
      newMessage = {
        ...message,
        timestamp: toTimestampString(fb.timestampNow())
      };
    }
    setLog(prevLog => {
      /* 連続selLog()で前のselLog()が後のsetLog()で上書きされるのを防止 */
      const newLog = [...prevLog, newMessage];
      newLog.slice(-localLogLinesMaxRef.current);
      localStorageIO.setJson("habitatLog", newLog);
      return newLog;
    });
  }

  function setNavigateBefore() {
    // ページが変わる前にバディの状態を保存

    if (bot.ref.state.buddy === "follow") {
      bot.dumpToLocalStorage();
    }
    return ("/fairybiome/Dashboard/");
  }

  const logSlice = log.slice(-chatLinesMaxRef.current);
  const speeches = logSlice.map(speech => {
    if (speech.speakerId === null) {
      return <SystemLog key={speech.timestamp} speech={speech} />;
    }
    if (speech.speakerId === fb.user.uid || speech.speakerId === -1) {
      return <RightBalloon key={speech.timestamp} speech={speech} />;
    }
    return <LeftBalloon key={speech.timestamp} speech={speech} />;
  });

  // --------------------------------------------------------
  // currentLogが変更されたら最下行へ自動スクロール
  const chatBottomEl = useRef(null);
  useEffect(() => {
    if (chatBottomEl) {
      chatBottomEl.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [logSlice]);

  return (
    <Box
      alignContent="flex-start"
      className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
    >
      <Box>
        <ApplicationBar
          busy={botBusy}
          setNavigateBefore={setNavigateBefore}
          title="妖精の生息地"
        />
      </Box>

      <Box
        className={classes.avatarSelector}
        display="flex"
        flexDirection="row"
        justifyContent="space-evenly"
      >
        <Card
          className={classes.avatarCard}
        >
          <Typography variant="h5">
            誰とお話する？
          </Typography>
          <StaticQuery
            query={query}
            render={data => <FairiesList data={data} />}
          />
        </Card>
      </Box>
      <Box
        className={classes.main}
        flexGrow={1}
      >
        {speeches}
        <div ref={chatBottomEl} />
      </Box>
      <Box justifyContent="center" order={0}>
        <Console
          handleWriteMessage={handleWriteMessage} />
      </Box>
    </Box>
  );
}
