import React ,{useContext } from "react";
import {Link} from 'gatsby';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import {FirebaseContext} from "../Firebase/FirebaseProvider";
import {BotContext} from "../ChatBot/BotProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
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

export default function ConfigEditor({location}){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);

  return (
    <Box
      
    >
      
    </Box>
  )
  
}