import React,{useState,useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';


const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),
  },
  input: {
    padding: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },


}));


export default function Parts(props){

  useEffect(()=>{
    if(props.pageWillChange){
      handleSave();
    }
  },[props.pageWillChange]); 

  function handleSave(){
    return;
  }

  return (
    <Box className={classes.content}>
      <Box>
        パート
      </Box>
    </Box>
  )
}