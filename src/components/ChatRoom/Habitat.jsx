import React ,{useContext,useCallback,useEffect,useState,useRef } from "react";
import { StaticQuery,graphql } from "gatsby"

import {localStorageIO} from '../../utils/localStorageIO';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import ApplicationBar from '../ApplicationBar/ApplicationBar';
import {RightBalloon,LeftBalloon} from './balloons.jsx';
import Console from './console.jsx';
import {toTimestampString} from '../to-timestamp-string.jsx';
import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';


function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// fairyディレクトリの妖精の中でHabitatにいるものを抽出
const query = graphql`
query Myq {
  allFile(filter: {sourceInstanceName: {eq: "fairy"}}) {
    edges {
      node {
        relativePath
        childFairyJson {
          config {
            buddyUser
            displayName
            photoURL
          }
          state {
            hp
            buddy
          }
        }
      }
    }
  }
  site {
    siteMetadata {
      local_log_lines_max
      chat_lines_max
      habitat_num_of_fairy_max
      habitat_fairy_hp_max
    }
  }
}
`;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  bar: {
    borderRadius: 5,
    height: 10,
    backgroundColor: ""
  },
  avatar:{
    width:40,
    height:40
  },
  currentAvatar:{
    width: 80,
    height: 80,
  },
  avatarContainer:{
    width: 120,
    
  },
  avatarSelector:{
    height: 200,
    marginTop: 15,
  },
  avatarCard:{
    padding: theme.spacing(1),
    width:"95%",
  },
  main: {
    height: 'calc( 100vh - 64px - 48px - 200px )',
      overflowY:'scroll',
    overscrollBehavior:'auto',
    WebkitOverflowScrolling:'touch',
    padding: 0
  },


}));






export default function Habitat(props){
  /*
    妖精の生息地

    firestore や /static/fairy上にある妖精のうち、
    ランダムに何体かが現れる。そのうちの一体を選んで会話できる。
    妖精と会話すると、仲間にできる場合がある。

    妖精の出現傾向
    妖精が出現する数は0〜4の乱数、現れる妖精のHP最大値は0〜100の乱数で決まる
    また出現している妖精の顔ぶれはアプリ起動中変わらない。
  
  */
  const classes = useStyles();

  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const fairiesListRef = useRef(null);
  const hpMaxRef = useRef();
  const numOfFairyRef = useRef();
  const localLogLinesMaxRef = useRef(10);
  const chatLinesMaxRef = useRef(10);
  const fairiesRef = useRef([]);
  const [currentFairy,setCurrentFairy] = useState(null);
  const [botBusy,setBotBusy] = useState(false);
  const [log,setLog] = useState([]);

  // const seed = Math.floor(fb.timestampNow().seconods/(60*HABITAT.update_interval));

  // ---------------------------------------------------
  // 初期は話し相手なしの状態で起動

  useEffect(()=>{
    bot.deployHabitat(null);
  },[]);

  function handleCatchFairy(path){
    
    setCurrentFairy(path);
    
    if(path === '__localStorage__'){
      const fairy = bot.getFairyFromLocalStorage();
      bot.deployHabitat(fairy);

    }else if(path.endsWith('.json')){
       fetch(`../../fairy/${path}`)
        .then(res=>res.json())
        .then(fairy=>{
          bot.deployHabitat(fairy);
        })
        .catch(error=>{
          setMessage(error.message);
        })
    }else{
      // firestoreからダウンロード
      // 未実装
      const fairy = {}
      bot.deployHabitat(fairy);
    }

  }


  function FairyAvatar(props){
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box>
          <IconButton
            onClick={()=>handleCatchFairy(props.relativePath)}
          >
            <Avatar 
              className={
                currentFairy===props.relativePath 
                ?
                classes.currentAvatar : classes.avatar
                }
              src={`../../svg/${props.photoURL}`}/>
          </IconButton>
          
        </Box>
        <Box>
          <Typography>{props.displayName||"まだ名前のない妖精"}</Typography>
        </Box>
        <Box
          className={classes.avatarContainer}
        >
          <LinearProgress
            className={classes.bar}
            variant="determinate"
            size={100}
            value={Number(props.hp)} />
        </Box>
      </Box>
    )
  }


  function FairiesList(props){
    // fairyディレクトリ、 ユーザのバディ、firestoreそれぞれの妖精を抽出し、
    // ランダムに数名を選んで表示
    // ※FairiesList中でuseStateは使用できない

    if(fairiesListRef.current === null){

      // fairyディレクトリの妖精はgraphqlで抽出
      const data = props.data.allFile.edges.map(edge=>{
          const jsonData = edge.node.childFairyJson;
          return {
            relativePath:edge.node.relativePath,
            displayName:jsonData.config.displayName,
            photoURL:jsonData.config.photoURL,
            buddyUser:jsonData.config.buddyUser,
            hp:jsonData.state.hp,
          }
        });
      const siteMetadata = props.data.site.siteMetadata;
      const hpMax = siteMetadata.habitat_fairy_hp_max;
      const numOfFairyMax = siteMetadata.habitat_num_of_fairy_max;
      
      hpMaxRef.current = randomInt(hpMax);
      numOfFairyRef.current = randomInt(numOfFairyMax);
          
      
      fairiesListRef.current=[...data];

      // firestore上のbotをfetchして加える
      // 未実装

      // hp が 1d100値よりも小さい妖精に絞り込む
      let allFairies = data.filter(fairy=>fairy.hp<hpMaxRef.current);
      
      //ユーザのバディがhabitatにいればこれに加える。
      if(bot.ref.state.buddy==='habitat'){
        allFairies.push({
          relativePath:'__localStorage__',
          displayName:bot.displayName,
          photoURL: bot.photoURL,
          buddyUser:fb.user.displayName,
          hp:bot.ref.state.hp         
        })
      }
      
      // そのうちの0〜4名をランダムに選ぶ
      let selectedFairies = [];
      for(let i=0,num=Math.min(numOfFairyRef.current,allFairies.length); i<num; i++){
        let index = randomInt(allFairies.length);
        selectedFairies.push(allFairies[index])
        allFairies.splice(index,1);
      }
      fairiesRef.current = [...selectedFairies];
      console.log("all",allFairies,"hp",hpMaxRef.current,numOfFairyRef.current,selectedFairies);
    
      // ついでにチャットログ用の定数をセット
      localLogLinesMaxRef.current = siteMetadata.local_log_lines_max;
      chatLinesMaxRef.current = siteMetadata.chat_lines_max;

    }
    
    return (
      <>
       {
          numOfFairyRef.current === 0 
          ?
          <Typography>今は誰もいないようだ・・・</Typography>
          :
          fairiesRef.current.map((fairy,index)=><FairyAvatar {...fairy} key={index}/>)
        }
      </>
    )
  }

  function handleWriteMessage(text){
    if(text === null){
      return;
    }
    const message={
      displayName:fb.user.displayName,
      photoURL:fb.user.photoURL,
      text:text,
      speakerId:fb.user.uid,
      timestamp:toTimestampString(fb.timestampNow()),
    };

    writeLog(message);
    
    setBotBusy(true);
    bot.replyHabitat(fb.user.displayName,text)
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
      .catch(e=>{
        writeLog({
          displayName:"error",
          photoURL:"",
          text:e.message,
          speakerId:bot.DisplayName,
          timestamp:toTimestampString(fb.timestampNow())
        })
        setBotBusy(false);
      })
  }

  function writeLog(message){
    setLog(prevLog=>{
      /* 連続selLog()で前のselLog()が後のsetLog()で上書きされるのを防止 */
      const newLog = [...prevLog,message];
      newLog.slice(-localLogLinesMaxRef.current);
      localStorageIO.setJson('habitatLog',newLog);
      return newLog;
    });

  }

  // --------------------------------------------------------
  // currentLogが変更されたら最下行へ自動スクロール
  const myRef = useCallback(node => {
    if(node!== null){
      node.scrollIntoView({behavior:"smooth",block:"end"});
    }
  })

  const logSlice=log.slice(-chatLinesMaxRef.current);
  const speeches = logSlice.map(speech =>{
    return (speech.speakerId === fb.user.uid || speech.speakerId === -1 )?
      <RightBalloon speech={speech} key={speech.timestamp}/>
    :
      <LeftBalloon speech={speech} key={speech.timestamp}/>
    }
  );

  return (
    <Box 
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
      className={classes.root}
    >
      <Box>
        <ApplicationBar title="妖精の生息地" busy={botBusy}/>
      </Box>

      <Box 
        display="flex"
        flexDirection="row"
        justifyContent="space-evenly"
        className={classes.avatarSelector}
      >
        <Card
          className={classes.avatarCard}
        >
          <Typography variant="h5">
            誰とお話する？
          </Typography>
          <StaticQuery
              query={query}
              render={data=><FairiesList data={data} />}
            />
        </Card>
      </Box>
      <Box
        flexGrow={1}
        className={classes.main}
      >
        {speeches}
        <div ref={myRef}></div>
      </Box>
      <Box order={0} justifyContent="center">
          <Console
            handleWriteMessage={handleWriteMessage}/>
      </Box>
    </Box>
  )
}