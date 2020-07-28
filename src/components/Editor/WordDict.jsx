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
  const [commons,setCommons] = useState({
    botJustBorn:dictToStr('!{BOT_JUST_BORN'),
    botNameMe:dictToStr('{!BOT_NAME_ME}'),
    acceptBuddyFormation:dictToStr('{!ACCEPT_BUDDTY_FORMATION}'),
    rejectBuddyFormation:dictToStr('{!REJECT_BUDDTY_FORMATION}'),
    ignoreBuddyFormation:dictToStr('{!IGNORE_BUDDTY_FORMATION}'),
    botIsDying:dictToStr('{!BOT_IS_DYING}'),
    hello:dictToStr('{!HELLO}'),
    notFound:dictToStr('{!NOT_FOUND}'),
  });
 
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

  
  function handleChangeCommons(event) {
    this.setState({ [event.target.name]: event.target.value });
  }



  function TextInput(props){
    return(
      <>
        <Typography variant="subtitle2">
        {props.caption}
        </Typography>
        <Input 
          name={props.name}
          required
          multiline
          fullWidth
          rows={2}
          rowsMax={5}
          className={classes.input}
          value={props.value}
          onChange={props.handleChange}
        />      
      </>
    )

  }

  return (
    <Box className={classes.content}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Button>.json形式ファイルの貼り付け</Button>
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={botJustBorn}
            caption="生まれたばかりの妖精がユーザに出会ったときの挨拶"
            value={commons.botJustBorn}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={botNameMe}
            caption="生まれたばかりの妖精が自分に名前をつけてほしいと頼む"
            value={commons.botNameMe}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={acceptBuddyFormation}
            caption="ユーザのバディになることを受け入れる"
            value={commons.acceptBuddyFormation}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={rejectBuddyFormation}
            caption="ユーザのバディになることを拒否する"
            value={commons.rejectBuddyFormation}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={ignoreBuddyFormation}
            caption="ユーザのバディになってほしいという依頼を受け流す"
            value={commons.ignoreBuddyFormation}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={botIsDying}
            caption="妖精のHPが0になり、消滅する瞬間の言葉"
            value={commons.botIsDying}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={hello}
            caption="妖精からの挨拶"
            value={commons.hello}
            handleChange={handleChangeCommons}
          />
        </Grid>

        <Grid item xs={12}>
          <TextInput 
            name={notFound}
            caption="返答候補が見つからなかった場合に相づちやうなづきをとりあえず返す"
            value={commons.notFound}
            handleChange={handleChangeCommons}
          />
        </Grid>

      </Grid>
    </Box>
  )
}