import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import ApplicationBar from "../ApplicationBar/ApplicationBar";

import PasscodeCard from "./PasscodeCard";
import Filer from "./Filer";

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
  const [open, setOpen] = useState(false);

  function handleSetOpen(value) {
    setOpen(value);
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
        <Collapse in={open}>
          <Filer />
        </Collapse>
      </Box>
      <Box className={classes.content}>
        <PasscodeCard
          setOpen={handleSetOpen}
        />
      </Box>
    </Box>
  );
}
