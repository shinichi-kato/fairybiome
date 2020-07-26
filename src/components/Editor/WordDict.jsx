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
  const [botJustBorn,setBotJustBorn] = useState(dictToStr('{!BOT_JUST_BORN}'));
  

  useEffect(()=>{
    if(props.pageWillChange){
      handleSave();
    }
  },[props.pageWillChange]); 

  function handleSave(){
    props.handleSave({
      ...wordDict,
      '{!BOT_JUST_BORN}':botJustBorn.split('\n'),
    })
  }

  function dictToStr(key){
    const arr = wordDict[key];
    return arr ? arr.join('\n') : "";
  }

  
  function handleChangeBotJustBorn(e){
    setBotJustBorn(e.target.value);
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
            required
            multiline
            fullWidth
            rows={2}
            rowsMax={5}
            className={classes.input}
            value={botJustBorn}
            onChange={handleChangeBotJustBorn}
          />
        </Grid>
      </Grid>
    </Box>
  )
}