import React ,{useContext,useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import ApplicationTabBar from './ApplicationTabBar';
import Config from './Config';
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
          title="" 
          page={page} 
          handleChangePage={p=>setPage(p)}
        />  
      </Box>
      <Box className={classes.main}>
        {page === "config" &&
          <Config config={bot.config}/>
        }
      </Box>
    </Box>  
  )
}