import React ,{useContext,useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import {localStorageIO} from '../../utils/localStorageIO';

import Box from '@material-ui/core/Box';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import {RightBalloon,LeftBalloon} from './balloons.jsx';
import Console from './console.jsx';
import {toTimestampString} from './to-timestamp-string.jsx';
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
  }
}));


export default function Home(props){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const [log,setLog] = useState(localStorageIO.getJson('homeLog'));
  const [botBusy,setBotBusy] = useState(false);

  const userDisplayName=fb.user.displayName;
  const botDisplayName=`${bot.displayName}@${userDisplayName}`;

  useEffect(()=>{
    setBotBusy(true);
    bot.deployLocal()
    .then(()=>{
      setBotState(false);
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
      timestamp:toTimestampString(firebase.firestore.Timestamp.now()),
    };

    writeLog(message);
    
    setBotBusy(true);
    bot.reply(message)
      .then(reply=>{
        if(reply.text !== null){
          writeLog({
            displayName:reply.displayName,
            photoURL:reply.photoURL,
            text:reply.text,
            speakerId:botId,
            timestamp:toTimestampString(firebase.firestore.Timestamp.now())
          });
          setBotBusy(false);
        }
      })
      .catch(e=>{
        writeLog({
          displayNam:"error",
          photoURL:"",
          text:e.message,
          speakerId:botDisplayName,
          timestamp:toTimestampString(firebase.firestore.Timestamp.now())
        })
        setBotBusy(false);
      })
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
      <RightBalloon speech={speech}/>
    :
      <LeftBalloon speech={speech} />
    }
  );

  return (
    <Box 
      className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar title="" busy={botBusy}/>
      </Box>
      <Box flexGrow={1} order={0} className={classes.main}>
        {speeches}
        <div ref={myRef}></div>
      </Box>
      <Box order={0} justifyContent="center">
        <Console
          position={0}
          handleWriteMessage={handleWriteMessage}/>
      </Box>
    </Box>
  )
}