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
import UserSettings from './UserSettings';
import BotSettings from './BotSettings';

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


export default function Dashboard(props){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);

  const user = fb.user;
  const [userDisplayName,setUserDisplayName] = useState(fb.user.displayName);
  const [userPhotoURL,setUserIPhotoURL] = useState(fb.user.photoURL);
  const [botDisplayName,setBotDisplayName] = useState(bot.displayName);
  const [botPhotoURL,setBotPhotoURL] = useState(bot.photoURL);
  const [title,setTitle] = useState("Dashboard");

  

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
          title={title}
        />
      </Box>
      {
        (userDisplayName === "" || userPhotoURL === "") ? 
        <UserSettings 
          displayName={userDisplayName}
          photoURL={userPhotoURL}
          handleChangeDisplayName={v=>setUserDisplayName(v)}
          handleChangePhotoURL={v=>setUserIPhotoURL(v)}
          handleChangeUserSettings={()=>fb.handleChangeUserInfo(userDisplayName,userPhotoURL)} 
        />
        :
        (botDisplayName === "" && botPhotoURL !== "") ?
        // 名前はないが、PhotoURLはある＝初期状態のbot
          <BotSettings/>
        :
          <>
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
                      '/fairybiome/BotSettings/',
                      {state:{name:botName,avatar:botIcon}}
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
          </>
        }   
    </Box>)
}