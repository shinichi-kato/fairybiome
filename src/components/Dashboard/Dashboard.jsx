import React ,{useState,useContext} from "react";
import {navigate} from 'gatsby';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import LogoSvg from "../../../images/svg/logo.svg";
import HomeIcon from "../../icons/Home";
import HubIcon from "../../icons/HubFairies";
import ApplicationBar from '../ApplicationBar/ApplicationBar';
import ChatAvatar from './ChatAvatar.jsx';

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  logoBox: {
    margin: "50px 5%",
  },
  logo: {
    width: "calc(100% - 10%)"
  },
  caption:{
    margin: "10px auto",
  },
  homeButton: {
    width: 180,
    height: 180,
    margin: 'auto',
    padding: 'auto 10',
    borderRadius: '0% 100% 100% 0% / 100% 100% 0% 0% ',
    backgroundColor: theme.palette.primary.main
  },
  hubButton: {
    width: 180,
    height: 180,
    margin: 'auto',
    padding: 'auto 10',
    borderRadius: '100% 0% 0% 100% / 100% 100% 0% 0% ',
    backgroundColor: theme.palette.primary.main,
  },
  
}));


export default function Dashboard({location}){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);

  const user = fb.user;
  let location_user=[null,null];
  if(location.state !== null && typeof location.state.user ==="string"){
    /*location.stateに複数の値を格納しようとしたらエラーになった。
    そのためuser=`${avatar} ${name}`というパッキングをして渡した。
    それをuserNameとuserIconに復元する
    */
    location_user=location.state.user.split(' ',2)
    fb.changeUserInfo(location_user[1],location_user[0]);
   }

  const userName = location_user[1] || user.displayName;
  const userIcon = location_user[0] || user.photoURL || "user-blank.svg";
  const botName = bot.displayName === "" ? "名前がありません" : bot.displayName;
  const botIcon = bot.photoURL !== "" ? bot.photoURL :'../../svg/fairy-blank.svg';


  return (
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar
          title="Dashboard"
        />
      </Box>
      <Box className={classes.logoBox}>
        <LogoSvg className={classes.logo} height="100%"/>
      </Box>

      <Box flexGrow={1}
        display="flex"
        flexDirection="row"
        justifyContent="space-evenly"

      >
        <Box>
          <ChatAvatar 
            displayName={userName}
            icon={userIcon}
            handleToChangeAvatar={()=>
              navigate('/fairybiome/UserSettings/',
              {state:{name:userName,avatar:userIcon}}
            )}
          />
        </Box>
        <Box>
          <ChatAvatar 
            displayName={botName}
            icon={botIcon}
            handleClick={()=>
              navigate(
                '/fairybiome/BotDownload/',
              )}
          />
        </Box>

      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box>
          <Button className={classes.homeButton}>
            <HomeIcon style={{fontSize:90}} />
          </Button>
        </Box>
        <Box>
          <Button className={classes.hubButton}>
            <HubIcon style={{fontSize:90}} />
          </Button>
        </Box>
      </Box>   
    </Box>)
}