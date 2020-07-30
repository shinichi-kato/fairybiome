import React ,{useContext,useEffect,useState,useCallback } from "react";
import {navigate} from 'gatsby';

import {localStorageIO} from '../../utils/localStorageIO';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Fab from '@material-ui/core/Fab';
import FairyBiomeIcon from '../../icons/FairyBiome';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import {RightBalloon,LeftBalloon} from './balloons.jsx';
import Console from './console.jsx';
import {toTimestampString} from '../to-timestamp-string.jsx';
import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';

const CHAT_WINDOW = 10;
const LOG_WINDOW = 100;


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  main: {
    height: 'calc( 100vh - 64px - 48px )',
      overflowY:'scroll',
    overscrollBehavior:'auto',
    WebkitOverflowScrolling:'touch',
    padding: 0
  },
  floatingButton:{
    position: "absolute",
    left: theme.spacing(4),
    top:80
  }
}));


export default function Home(props){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const [log,setLog] = useState(localStorageIO.getJson('homeLog',[]));
  const [botBusy,setBotBusy] = useState(false);
  
  const user = fb.user;
  const userDisplayName=user.displayName;
  const botDisplayName=`${bot.displayName}@${userDisplayName}`;
  
  useEffect(()=>{
    setBotBusy(true);
    bot.deployLocal()
    .then(()=>{
      setBotBusy(false);
    });

  },[]);

  function writeLog(message){
    setLog(prevLog=>{
      /* 連続selLog()で前のselLog()が後のsetLog()で上書きされるのを防止 */
      const newLog = [...prevLog,message];
      newLog.slice(-CHAT_WINDOW);
      localStorageIO.setJson('homeLog',newLog);
      return newLog;
    });

  }

  function handleWriteMessage(text){
    if(text === null){
      return;
    }
    const message={
      displayName:user.displayName,
      photoURL:user.photoURL,
      text:text,
      speakerId:user.uid,
      timestamp:toTimestampString(fb.timestampNow()),
    };

    writeLog(message);
    
    setBotBusy(true);
    bot.reply(user.displayName,text)
      .then(reply=>{
        if(reply.text !== null){
          writeLog({
            displayName:botDisplayName,
            photoURL:reply.photoURL,
            text:reply.text,
            speakerId:bot.displayName,
            timestamp:toTimestampString(fb.timestampNow())
          });
          setBotBusy(false);
        }
      })
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

    // --------------------------------------------------------
  // currentLogが変更されたら最下行へ自動スクロール
  const myRef = useCallback(node => {
    if(node!== null){
      node.scrollIntoView({behavior:"smooth",block:"end"});
    }
  })

  const logSlice=log.slice(-CHAT_WINDOW);
  const speeches = logSlice.map(speech =>{
    return (speech.speakerId === user.uid || speech.speakerId === -1 )?
      <RightBalloon speech={speech} key={speech.timestamp}/>
    :
      <LeftBalloon speech={speech} key={speech.timestamp}/>
    }
  );

  return (
    <>
      <Box 
        className={classes.root}
        display="flex"
        flexDirection="column"
        flexWrap="nowrap"
        justifyContent="flex-start"
        alignContent="flex-start"
      >
        <Box>
          <ApplicationBar title="ホーム" busy={botBusy}/>
        </Box>
        <Box flexGrow={1} order={0} className={classes.main}>
          {speeches}
          <div ref={myRef}></div>
        </Box>
        <Box order={0} justifyContent="center">
          <Console
            position={"0"}
            handleWriteMessage={handleWriteMessage}/>
        </Box>
      </Box>
      <Fab 
        className={classes.floatingButton}
        color="secondary" 
        aria-label="edit"
        onClick={()=>navigate('/fairybiome/Editor')}
      >
        <FairyBiomeIcon />
      </Fab>
    </>
  )
}