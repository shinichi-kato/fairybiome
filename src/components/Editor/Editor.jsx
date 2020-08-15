import React, { useContext, useState } from "react";
import { navigate } from "gatsby";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import ApplicationTabBar from "./ApplicationTabBar";
import Config from "./Config";
import WordDict from "./WordDict";
import Parts from "./Parts";
import Misc from "./Misc";

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

export default function Editor(props) {
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);

  const [page, setPage] = useState("config");
  const [pageWillChange, setPageWillChange] = useState(false);
  const [message, setMessage] = useState("");

  function handleChangePage(page) {
    setPageWillChange(page);
  }

  function handleSaveConfig(config) {
    bot.setConfig(config);
    pageTransition();
  }

  function handleSaveWordDict(wordDict) {
    bot.setWordDict(wordDict);
    pageTransition();
  }

  function handleSaveParts(parts, partOrder) {
    pageTransition();
  }

  function handleSaveMisc(misc) {
    pageTransition();
  }

  function pageTransition() {
    const page = pageWillChange;
    setPageWillChange(false);
    if (page === "exit") {
      navigate("/fairybiome/Home/");
    } else {
      setPage(page);
    }
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
        <ApplicationTabBar
          handleChangePage={handleChangePage}
          page={page}
          title={`${bot.displayName}の設定`}
        />
      </Box>
      <Box className={classes.main}>
        {page === "config" &&
          <Config
            config={bot.ref.config}
            handleSave={handleSaveConfig}
            message={message}
            pageWillChange={pageWillChange}
            state={bot.ref.state}
            updatedAt={bot.ref.updatedAt}
          />
        }
        {page === "wordDict" &&
          <WordDict
            handleSave={handleSaveWordDict}
            pageWillChange={pageWillChange}
            wordDict={bot.ref.wordDict}

          />
        }
        {page === "parts" &&
          <Parts
            handleSave={handleSaveParts}
            pageWillChange={pageWillChange}
            partOrder={bot.ref.config.partOrder}
            parts={bot.ref.parts}

          />
        }
        {page === "misc" &&
          <Misc
            handleSave={handleSaveMisc}
            pageWillChange={pageWillChange}
            state={bot.ref.state}

          />
        }
      </Box>
    </Box>
  );
}
