import React,{useRef,useEffect} from 'react';
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
  margin: {
    margin: theme.spacing(1),
  },
  input: {
    padding: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },


}));

export default function WordDict(props){
  const classes = useStyles();
  const wordDict=props.wordDict;
  const botJustBornEl=useRef(null);
  
  useEffect(()=>{
    if(props.pageWillChange){
      handleSave();
    }
  },[props.pageWillChange]); 

  function handleSave(){
    props.handleSave({
      ...wordDict,
      '{!BOT_JUST_BORN}':botJustBornEl.value
    })
  }


  return (
    <Box className={classes.content}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Button>.json形式ファイルの貼り付け</Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">
            生まれてすぐの妖精がユーザに出会ったときの挨拶
          </Typography>
          <Input 
          ref={botJustBornEl}
          defaultValue={wordDict['{!BOT_JUST_BORN}']}
          />
        </Grid>
      </Grid>
    </Box>
  )
}