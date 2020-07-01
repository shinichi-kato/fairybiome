import React ,{useState,useContext} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationBar from '../ApplicationBar/ApplicationBar';

export default function BotDownload(props){
  return(
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar
          title="ユーザ設定"
        />
      </Box>   
      
    </Box>
  )
}