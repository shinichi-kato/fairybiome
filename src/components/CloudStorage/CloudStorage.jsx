import React, { useState, useEffect, useContext, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import UploadIcon from "@material-ui/icons/CloudUploadOutlined";
import DownloadIcon from "@material-ui/icons/CloudDownloadOutlined";
import ApplicationBar from "../ApplicationBar/ApplicationBar";
import TextInput from "../TextInput.jsx";
import { localStorageIO } from "../../utils/localStorageIO";

import FairyList from "./FairyList";
import { FirebaseContext } from "../Firebase/FirebaseProvider";
import { BotContext } from "../ChatBot/BotProvider";

const useStyles = makeStyles((theme) => ({
  rootWhoseChildUsesFlexGrow: {
    width: "100%",
    height: "100vh",
    // backgroundImage: "url(../images/landing-bg.png)",
    // backgroundPosition: "center bottom",
  },
  content: {
    padding: theme.spacing(2),

  },
  main: {
    width: "100%",
    height: "clac( 100vh - 64px )",
    overflowY: "scroll",
    overscrollBehavior: "auto",
    WebkitOverflowScrolling: "touch",
    padding: theme.spacing(2),
  },
}));

export default function CloudStorage() {
  /*
    firestoreにfairyのデータを保存・ダウンロードするUI。
    .envファイルにパスコードFAIRYBIOME_PASSCODEが記述されていた場合使用可能ユーザを制限
  */
  const classes = useStyles();
  const envPasscode = typeof window !== "undefined" && process.env.FAIRYBIOME_PASSCODE;
  const [passcode, setPasscode] = useState(localStorageIO.getItem("fairyBiome.passcode", ""));
  const [message, setMessage] = useState(null);
  const [fairyList, setFairyList] = useState([]);
  const [cursor, setCursor] = useState();
  const fb = useContext(FirebaseContext);

  useEffect(() => {
    checkPasscode();
  }, []);
  
  function checkPasscode() {
    if (passcode !== envPasscode) {
      setMessage(`パスコードが一致しません${envPasscode}`);
    } else {
      setMessage(null);
      localStorage.setItem("fairyBiome.passcode", passcode);
      getBotList();
    }
  }

  function handleChangePasscode(e) {
    setPasscode(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    checkPasscode();
  }

  function handleClick(e) {
    checkPasscode();
  }

  function handleSetCursor(data) {
    setCursor(data);
  }

  function getBotList() {
    const botsRef = fb.firestore.collection("bots");
    botsRef.get()
      .then(snapshot => {
        setFairyList(snapshot.docs.map(doc => (
          {
            displayName: doc.config.displayName,
            id: doc.config.id,
            photoURL: doc.config.photoURL,
            firstUser: doc.config.firstUser,
          }
        )));
      });
  }

  return (
    <Box
      alignContent="flex-start"
      className={classes.rootWhoseChildUsesFlexGrow}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
    >
      <Box>
        <ApplicationBar title="クラウド保存" />
      </Box>
      <Box className={classes.content}>
        <form onSubmit={handleSubmit}>
          <FormLabel component="legend">パスコード</FormLabel>
          <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
          >
            <Box>
              <TextInput
                handleChange={handleChangePasscode}
                required
                type="password"
                value={passcode}
              />
            </Box>
            <Box>
              <Button onClick={handleClick}>OK</Button>
            </Box>
          </Box>
          <Typography color="error">{message}</Typography>
        </form>
      </Box>
      {passcode === envPasscode &&
        <>
          <Box className={classes.content}>
            <Typography><UploadIcon />アップロード</Typography>
          </Box>
          <Box className={classes.content}>
            <Typography><DownloadIcon />ダウンロード</Typography>
          </Box>
          <Box>
            <FairyList
              cursor={cursor}
              data={fairyList}
              handleSetCursor={handleSetCursor} />
          </Box>
        </>
      }
    </Box>
  );
}
