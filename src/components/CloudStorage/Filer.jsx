import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { navigate } from "gatsby";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import UploadIcon from "@material-ui/icons/CloudUploadOutlined";
import DownloadIcon from "@material-ui/icons/CloudDownloadOutlined";
import FileIcon from "@material-ui/icons/DescriptionOutlined";
import MemoryIcon from "@material-ui/icons/MemoryOutlined";

import FairyList from "./FairyList";
import { readFromFirestore } from "../../biomebot/biomebotIO";

import { FirebaseContext } from "../Firebase/FirebaseProvider";
import { BotContext } from "../ChatBot/BotProvider";

const useStyles = makeStyles((theme) => ({
  content: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1)
  }
}));

export default function Filer(props) {
  const [fairyList, setFairyList] = useState([]);
  const [cursor, setCursor] = useState(null);
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const botConfig = bot.ref.config;
  const classes = useStyles();

  useEffect(() => {
    // listen
    fb.firestore.collection("bots")
      .onSnapshot(handleRecieveBotList);

    return (() => {
      fb.firestore.collection("bots").onSnapshot(() => { });
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
    // localstorageからfirestoreへ
    bot.dumpToFirestore(fb);
  }

  function handleDownload() {
    // firestoreからlocalStorageへ
    readFromFirestore(fb, fairyList[cursor].id)
      .then(fairy => {
        bot.dumpToLocalStorage(fairy);
        navigate("/fairybiome");
      });
  }

  function handleSetCursor(val) {
    setCursor(val);
  }

  function handleExport() {
    // firestoreからファイルへ
    readFromFirestore(fb, fairyList[cursor].id)
      .then(fairy => {
        if (typeof window !== "undefined") {
          // fairyのうち、id関連とstateは除去
          delete fairy.firestoreDocId;
          delete fairy.firestoreOwnerId;
          delete fairy.state;

          const element = document.createElement("a");
          const file = new Blob([JSON.stringify(fairy, null, 2)],
            { type: "application/json" });
          element.href = URL.createObjectURL(file);
          element.download = `${fairy.config.displayName}.json`;
          document.body.appendChild(element);
          element.click();
        }
      });
  }

  return (
    <>
      <Box
        alignItems="center"
        className={classes.content}
        display="flex"
        flexDirection="row"
      >
        <Box>
          <UploadIcon />
        </Box>
        <Box>
          <Typography variant="h6">アップロード</Typography>
        </Box>
      </Box>
      <Box>
        <Button
          onClick={handleUpload}
          startIcon={<Avatar src={`../../svg/${botConfig.photoURL}`} />}
          varient="contained"
        >
          {`${botConfig.displayName}のデータをアップロードする`}
        </Button>
        <Button
          onClick={props.handleToImporter}
          startIcon={<FileIcon/>}
        >
          JSON形式のファイルをアップロードする
        </Button>
      </Box>
      <Box
        alignItems="center"
        className={classes.content}
        display="flex"
        flexDirection="row"
      >
        <Box>
          <DownloadIcon />
        </Box>
        <Box>
          <Typography variant="h6">ダウンロード</Typography>
        </Box>
      </Box>
      <Box className={classes.content}>
        <FairyList
          cursor={cursor}
          data={fairyList}
          setCursor={handleSetCursor} />
      </Box>

      <Box className={classes.content}>
        <Button
          color="primary"
          disabled={cursor === null}
          onClick={handleDownload}
          startIcon={<MemoryIcon/>}
          variant="contained"
        >
          ダウンロード
        </Button>
        <Button
          color="default"
          disabled={cursor === null}
          onClick={handleExport}
          startIcon={<FileIcon/>}
        >
          JSON形式ファイルとしてダウンロードする
        </Button>
      </Box>
    </>
  );
}
