reimport React ,{useContext,useEffect,useState,useRef } from "react";
import { StaticQuery,graphql } from "gatsby"

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';

const HABITAT={
  update_interval:1, // 生息地にいる妖精の顔ぶれが更新されるまでの時間(分) 
  numberBehavior:{
    mean:3,   // 妖精出現数の平均値
    stdDev:0.5 // 幼生出現数の標準偏差 
  },
  hpBehavior:{
    mean:50, // 出現する妖精のHP最大値の平均値
    stdDev:20 // 出現する妖精のHP最大値の標準偏差
  }
}

function random_norm(behavior) {
  //平均0、標準偏差1の正規乱数を返す。
  //https://stabucky.com/wp/archives/9263
  var s, i;
  s = 0;
  for(i = 0; i < 12; i++) {
    s += Math.random();
  }
  return behavior.mean + (s - 6)*behavior.stdDev;
}

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Habitatにいる妖精を抽出
const query = graphql`
query Myq {
  allFile(filter: {sourceInstanceName: {eq: "fairy"}, childFairyJson: {state: {site: {eq: "habitat"}}}}) {
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
  avatarList:{
    width:40,
    height:40
  },
  avatarContainer:{
    width: 120
  }


}));


export default function Habitat(props){
  /*
    妖精の生息地

    firestore や /static/fairy上にある妖精のうち、
    ランダムに何体かが現れる。そのうちの一体を選んで会話できる。
    妖精と会話すると、仲間にできる場合がある。

    妖精の出現傾向
    妖精が出現する数はnumber{mean,stdDev}で与えられる正規分布に従い、
    また出現できる妖精のHP最大値はhp{mean,stdDev}で与えられる正規分布に従う。
  */
  const classes = useStyles();

  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const fairiesListRef = useRef(null);
  const hpMaxRef = useRef(randomInt(100));
  const [fairies,setFairies] = useState([]);

  const seed = Math.floor(fb.timestampNow().seconods/(60*HABITAT.update_interval));

  



  function handleClick(path){

  }


  function FairyAvatar(props){
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box>
          <IconoButton
            onClick={()=>handleClick(props.relativePath)}
          >
            <Avatar 
              className={classes.avatarList}
              src={`../../svg/${props.photoURL}`}/>
          </IconoButton>
          
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




  function GetFairiesList(props){
    // fairiesListをuseStateで構成すると、「render内でのsetState」
    // というwarningになる。これは useStaticQuery()で回避できるが、
    // 2020.7現在ではuseStaticQuery() 自体にバグがあり、undefined
    // しか帰ってこない。
    // 
    // そこで useRef を代替とし、データ取得のみのサブコンポーネントを用いる。  

    
    if(props.data){
      fairiesListRef.current = props.data.allFile.edges.map(edge=>{
        const jsonData = edge.node.childFairyJson;
        return {
          relativePath:edge.node.relativePath,
          displayName:jsonData.config.displayName,
          photoURL:jsonData.config.photoURL,
          buddyUser:jsonData.config.buddyUser,
          hp:jsonData.state.hp,
        }
      });
        
    }
    console.log(fairiesListRef.current)
    return null;
  }


  useEffect(()=>{
    // queryでHabitatにいる妖精を抽出し、そのの中から
    // 出現する妖精の数を決める
    if(fairiesListRef.current){
      let allFairies = fairiesListRef.current.filter(fairy=>fairy.hp<hpMaxRef.current);
      //ユーザのバディがhabitatにいればこれに加える。
      if(bot.ref.state.site==='habitat'){
        allFairies.push({
          relativePath:'__localStorage__',
          displayName:bot.displayName,
          photoURL: bot.photoURL,
          buddyUser:fb.user.displayName,
          hp:bot.ref.state.hp         
        })
      }
      // firestore上のbotをfetchして加える

      let selectedFairies = [];
      const numOfFairies = Math.min(random_norm(HABITAT.numberBehavior),allFairies.length);
      for(let i=0; i<numOfFairies; i++){
        let index = randomInt(allFairies.length);
        selectedFairies.push(allFairies[index])
        delete allFairies[index];
      }
      setFairies([...selectedFairies])
  
    }

  },[fairiesListRef.current])

  

  return (
    <>
      {fairiesListRef.current === null &&
        <StaticQuery
          query={query}
          render={data=><GetFairiesList data={data} />}
        />
      }
      <Box 
        display="flex"
        flexDirection="column"
        flexWrap="nowrap"
        justifyContent="flex-start"
        alignContent="flex-start"
      >
        <Box>
          <ApplicationBar title="妖精の生息地" />
        </Box>
        <Box>
          <Typography>誰とお話する？</Typography>
        </Box>
        <Box 
          display="flex"
          flexDirection="row"
          justifyContent="space-evenly"
        >
          {fairies.map((fairy,index)=><FairyAvatar {...fairy} key={index}/>)}

        </Box>
      </Box>
    </>
  )
}