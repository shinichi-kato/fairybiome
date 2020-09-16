import React, { useRef, useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";

import ApplicationBar from "../ApplicationBar/ApplicationBar";
import { RightBalloon, LeftBalloon } from "./balloons.jsx";
import Console from "./console.jsx";
import { FirebaseContext } from "../Firebase/FirebaseProvider";
import { BotContext } from "../ChatBot/BotProvider";
import { toTimestampString } from "../to-timestamp-string.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    background: "linear-gradient(180deg, #8696a8 0%,#79a0bf 50%,#729bbe 58%,#7fbc6e 71%,#86a686 100%);"
  },
  main: {
    height: "calc( 100vh - 64px - 48px )",
    overflowY: "scroll",
    overscrollBehavior: "auto",
    WebkitOverflowScrolling: "touch",
    padding: 0
  }
}));

export default function Hub({location}) {
  const classes = useStyles();

  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const user = fb.user;
  const hubLogRef = fb.firestore.collection("hubLog");
  const userDisplayName = user.displayName;

  const [hubLog, setHubLog] = useState([]);
  const [botBusy, setBotBusy] = useState(false);

  const site = useRef({
    title: "",
    localLogLinesMax: 20,
    chatLinesMax: 20
  });

  if (location.state?.data) {
    site.current = {
    title: location.state.data.title,
    localLogLinesMax: location.state.data.localLogLinesMax,
    chatLinesMax: location.state.data.chatLinesMax
    };
  }

  function setNavigateBefore() {
    /* 戻るボタンを押したときの動作を記述し、戻り先アドレスを返す */
    bot.dumpToLocalStorage();
    bot.dumpToFirestore(fb);
    return ("/fairybiome/Dashboard");
  }

  useEffect(() => {
    // botのデプロイ
    setBotBusy(true);
    bot.deployHub()
      .then(() => {
        setBotBusy(false);
      });

    // listen
    hubLogRef.orderBy("timestamp", "desc")
      .limit(site.current.localLogLinesMax)
      .onSnapshot(handleRecieveSnapshot);

    return (() => {
      hubLogRef.onSnapshot(() => { });
    });
  }, []);

  function handleRecieveSnapshot(query) {
    const messages = query.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });
    setHubLog(messages.reverse());
    console.log("hub",bot.ref)
    // 最後の発言者がぼっと自身でなければ発言を試みる
    const lastItem = messages[messages.length - 1];
    if (lastItem && lastItem.speakerId !== bot.ref.firestoreDocId) {
      bot.replyHub(lastItem)
        .then(reply => {
          if (reply.text !== null) {
            fb.firestore.collection("hubLog").add({
              displayName: `${reply.displayName} @ ${user.displayName}`,
              photoURL: reply.photoURL,
              text: reply.text,
              speakerId: bot.ref.firestoreDocId,
              timestamp: fb.timestampNow()
            });
            bot.upkeep();
          }
        });
    }
  }

  function handleWriteMessage(text) {
    hubLogRef.add({
      displayName: userDisplayName,
      photoURL: user.photoURL,
      text: text,
      speakerId: user.uid,
      timestamp: fb.timestampNow()
    });
  }

  const logSlice = hubLog.slice(-site.current.chatLinesMax);
  const speeches = logSlice.map(speech => {
    return (speech.speakerId === user.uid || speech.speakerId === -1) ?
      <RightBalloon key={speech.id || speech.timestamp} speech={speech} />
      :
      <LeftBalloon key={speech.id || speech.timestamp} speech={speech} />;
  }
  );

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
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
    >
      <Box>
        <ApplicationBar
          busy={botBusy}
          setNavigateBefore={setNavigateBefore}
          title={site.current.title} />
      </Box>
      <Box className={classes.main} flexGrow={1} order={0}>
        {speeches}
        <div ref={chatBottomEl} />
      </Box>
      <Box justifyContent="center" order={0}>
        <Console
          handleWriteMessage={handleWriteMessage}
          position={"0"} />
      </Box>
    </Box>
  );
}
