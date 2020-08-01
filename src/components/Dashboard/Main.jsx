import React from "react";
import {navigate} from 'gatsby';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import ChatAvatar from './ChatAvatar';
import MeetFairy from './MeetFairy';

import HomeIcon from "../../icons/Home";
// import HubFairiesIcon from "../../icons/HubFairies";
import HubIcon from "../../icons/Hub";
import HabitatIcon from "../../icons/Habitat";


const useStyles = makeStyles((theme) => ({
  rootWhoseChildUsesFlexGrow: {
    width: "100%",
    height: "100vh",
    // backgroundImage: "url(../images/landing-bg.png)",
    // backgroundPosition: "center bottom",
  },
  logoBox: {
    margin: "50px 5%",
  },
  avatars: {
    marginTop: "20%",
  },
  caption:{
    margin: "10px auto",
  },
  habitatButton: {
    width: 180,
    height: 180,
    margin: 'auto',
    padding: 'auto 10',
    borderRadius: '100% 0% 0% 100% /  0% 0% 100% 100%',
    backgroundColor: theme.palette.secondary.main,
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

export default function Main(props){
  const classes = useStyles();
  const userDisplayName=props.user.displayName;
  const userPhotoURL = props.user.photoURL;
  console.log(props)
  return(
    <Box 
      className={classes.rootWhoseChildUsesFlexGrow}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar title="" />
      </Box>
      <Box
        alignSelf="flex-end"
      >
        <Button className={classes.habitatButton}
          onClick={()=>navigate('/fairybiome/Habitat/')}
        >
          <HabitatIcon style={{fontSize:90}} />
        </Button>
      </Box>
      <Box
        className={classes.avatars}
        flexGrow={1}
        display="flex"
        flexDirection="row"
        justifyContent="space-evenly"
      >
        <Box>
          <ChatAvatar
            displayName={userDisplayName}
            icon={userPhotoURL}
          />
        </Box>
        {props.bot &&
          <Box>
            <ChatAvatar
              displayName={props.bot.displayName || "名前のない妖精"}
              icon={props.bot.photoURL}
            />
          </Box>
          ||
          <Box>
            <MeetFairy />
          </Box>
        }
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box>
          <Button className={classes.homeButton}
            onClick={()=>navigate('/fairybiome/Home/')}>
            <HomeIcon style={{fontSize:90}} />
          </Button>
        </Box>
        <Box>
          <Button className={classes.hubButton}
            onClick={()=>navigate('/fairybiome/Hub/')}
          >
            <HubIcon style={{fontSize:90}} />
          </Button>
        </Box>
      </Box>       
    </Box>
  )
}