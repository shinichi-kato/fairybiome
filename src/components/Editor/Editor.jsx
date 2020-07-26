import React ,{useContext,useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import ApplicationTabBar from './ApplicationTabBar';
import Config from './Config';
import WordDict from './WordDict';
import Parts from './Parts';
import Misc from './Misc';

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';

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
		overflowY:'scroll',
		overscrollBehavior:'auto',
    WebkitOverflowScrolling:'touch',
    padding: theme.spacing(2),
  },
}));

export default function Editor(props){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);

  const [page,setPage] = useState('config');
  const [pageWillChange,setPageWillChange] = useState(false);
  const [message,setMessage] = useState("");

  function handleChangePage(page){
    setPageWillChange(page);
  }
  
  function handleSaveConfig(config){
    bot.setConfig(config);
    pageTransition();
  };

  function handleSaveWordDict(wordDict){
    bot.setWordDict(wordDict);
    pageTransition();
  }

  function handleSaveParts(parts,partOrder){
    pageTransition();
  }

  function handleSaveMisc(misc){
    pageTransition();
  }

  function pageTransition(){
    const page = pageWillChange;
    setPageWillChange(false);
    if(page === 'exit'){
      navigate('/fairybiome/Home/');
    }else{
      setPage(page);
    }

  }


  return (
    <Box
      className={classes.rootWhoseChildUsesFlexGrow}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"     
    >
      <Box>
        <ApplicationTabBar 
          title={`${bot.displayName}の設定`} 
          page={page} 
          handleChangePage={handleChangePage}
        />  
      </Box>
      <Box className={classes.main}>
        {page === "config" &&
          <Config
            handleSave={handleSaveConfig}
            pageWillChange={pageWillChange}
            message={message}
            config={bot.ref.config}
            state={bot.ref.state}
          />
        }
        {page === "wordDict" &&
          <WordDict
            pageWillChange={pageWillChange}
            wordDict={bot.ref.wordDict}
            handleSave={handleSaveWordDict}

          />
        }
        {page === "parts" &&
          <Parts
            pageWillChange={pageWillChange}
            parts={bot.ref.parts}
            partOrder={bot.ref.config.partOrder}
            handleSave={handleSaveParts}

          />
        }
         {page === "misc" &&
          <Misc
            pageWillChange={pageWillChange}
            state={bot.ref.state}
            handleSave={handleSaveMisc}

          />
        }       
      </Box>
    </Box>  
  )
}