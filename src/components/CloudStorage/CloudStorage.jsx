import React, { useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import ApplicationBar from "../ApplicationBar/ApplicationBar";

import PasscodeCard from "./PasscodeCard";
import Filer from "./Filer";
import Importer from "./Importer";

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

function reducer(state, action) {
  switch (action.type) {
    case "setOpen" : {
      return {
        ...state,
        open: action.open,
      };
    }

    case "importer" : {
      return {
        ...state,
        open: true,
        page: "importer"
      };
    }

    case "filer" : {
      return {
        ...state,
        open: true,
        page: "filer"
      };
    }

    case "changeImportPath" : {
      return {
        ...state,
        importPath: action.path
      };
    }

    default:
      throw new Error(`invalid action ${action.type}`);
  }
}

export default function CloudStorage() {
  /*
    firestoreにfairyのデータを保存・ダウンロードするUI。
    .envファイルにパスコードFAIRYBIOME_PASSCODEが記述されていた場合使用可能ユーザを制限
  */
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, {
    open: false,
    page: "main",
    importPath: null
  });

  function handleSetOpen(value) {
    dispatch({type: "setOpen", open: value});
  }

  function handleToFiler() {
    dispatch({type: "filer"});
  }

  function handleToImporter() {
    dispatch({type: "importer"});
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
      <Box
        className={classes.main}
        display="flex"
        flexDirection="column"
        flexWrap="nowrap"
      >
        <Box className={classes.content}>
          <Collapse in={state.open}>
            {state.page === "main" ?
              <Filer
                handleToImporter={handleToImporter}
              />
              :
              <Importer
                handleToFiler={handleToFiler}
                importPath={state.importPath}
              />
            }
          </Collapse>
        </Box>
        <Box className={classes.content}>
          <PasscodeCard
            setOpen={handleSetOpen}
          />
        </Box>
      </Box>
    </Box>
  );
}
