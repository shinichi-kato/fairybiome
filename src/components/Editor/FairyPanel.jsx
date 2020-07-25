import React ,{useState } from "react";
import { makeStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  icon:{
    width: 50,
    height: 50,
  },
  content: {
    width: 200

  },
  bar: {
    borderRadius: 5,
    height: 10,
  },
  
}));

export default function FairyPanel(props){
  const classes = useStyles();
  return(
    <Paper
      className={classes.root}
    >
      <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
      >
        <Box>
          <Avatar
              className={classes.icon}
              src={`../../svg/${props.photoURL}`}
          />
        </Box>
        <Box>
          <Typography>{props.displayName || "名前"}</Typography>
        </Box>
        <Box
          className={classes.content}
        >
        HP:<LinearProgress 
          className={classes.bar}
          variant="determinate"
          size={100} 
          value={props.hp}/>
        </Box>
      </Box>
    </Paper>
  )
}