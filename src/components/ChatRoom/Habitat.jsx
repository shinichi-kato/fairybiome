import React ,{useContext,useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },

}));


export default function Home(props){
  const classes = useStyles();

  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);

  return (
    <Box 
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar title="" />
      </Box>
    </Box>
  )
}