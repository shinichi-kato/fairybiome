import React, { useState, useEffect, useContext, useMemo } from "react";
import {navigate} from "gatsby";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import UploadIcon from "@material-ui/icons/CloudUploadOutlined";
import DownloadIcon from "@material-ui/icons/CloudDownloadOutlined";

import FairyList from "./FairyList";
import { readFromFirestore } from "../../biomebot/biomebotIO";

import { FirebaseContext } from "../Firebase/FirebaseProvider";
import { BotContext } from "../ChatBot/BotProvider";

export default function Filer() {
  const [fairyList, setFairyList] = useState([]);
  const [cursor, setCursor] = useState(null);
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const botConfig = bot.ref.config;

  useEffect(() => {
    // listen
    fb.firestore.collection("bots")
      .onSnapshot(handleRecieveBotList);

    return (() => {
      fb.firestore.collection("bots").onSnapshot(()=> {});
    });
  }, []);

  function handleRecieveBotList(snapshot) {
    const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          displayName: data.config.displayName,
          id: doc.id,
          photoURL: data.config.photoURL,
          ownerDisplayName: data.ownerDisplayName
        };
      });
    setFairyList(docs);
  }

  function handleUpload() {
    bot.dumpToFirestore(fb);
  }

  function handleDownload() {
    readFromFirestore(fb, fairyList[cursor].id)
    .then(fairy=> {
      bot.dumpToLocalStorage(fairy);
      navigate("/fairybiome");
    });
  }

  function handleSetCursor(val) {
    setCursor(val);
  }

  return (
    <>
      <Box>
        <Typography><UploadIcon/>アップロード</Typography>
      </Box>
      <Box>
        <Button
          onClick={handleUpload}
          startIcon={<Avatar src={`../../svg/${botConfig.photoURL}`} />}
          varient="contained"
        >
          {`${botConfig.displayName}のデータをアップロードする`}
        </Button>
      </Box>
      <Box>
        <Typography><DownloadIcon/>ダウンロード</Typography>
      </Box>
      <Box>
        <FairyList
          cursor={cursor}
          data={fairyList}
          setCursor={handleSetCursor}/>
      </Box>
      <Box>
        <Button
          disabled={cursor === null}
          onClick={handleDownload}
        >
          { cursor ? `${fairyList[cursor].displayName}のダウンロード` : "ダウンロード"}
        </Button>
      </Box>
    </>
  );
}
