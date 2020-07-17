import React ,{ useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Send from '@material-ui/icons/Send';

const useStyles = makeStyles({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '95%',
    borderRadius: '0.5em',
    margin:'auto'
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
});

export default function Console(props) {
  const classes = useStyles();
  const [text,setText] = useState("");

  const handleChangeText = e => {
    setText(e.target.value)
  }

  const handleKeyPress = e => {
      if(e.key === 'Enter'){
          e.preventDefault();
          handleWriteMessage();
      }
  }

  function handleWriteMessage(){
    const t = String(text);
    setText("");
    props.handleWriteMessage(t);
  }

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder={props.position}
        value={text}
        onChange={handleChangeText}
        onKeyPress={handleKeyPress}
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <Divider className={classes.divider} />
      <IconButton
        onClick={e=>handleWriteMessage()}
        color="primary" className={classes.iconButton} aria-label="send">
        <Send />
      </IconButton>
    </Paper>
  );
}
