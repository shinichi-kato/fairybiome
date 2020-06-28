import React,{useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import TextInput from '../TextInput.jsx';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles((theme) => ({
  caption:{
    margin: "10px auto",
  },
  message:{
    color: theme.palette.error.main
  },
  inputContainer:{
    width: "90%",
    padding: "20px 10%",
    margin: "auto",
  },
  button:{
    padding: "1em",
  },
  buttonContainer:{
    padding: theme.spacing(2),
  },
}));


export default function Signing(props){
  const classes = useStyles();

  function handleClick(){
    if(props.page === 'login'){
      props.handleLogin();
    } else {
      props.handleSignUp();
    }
  }

  return (
    <Box 
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box className={classes.inputContainer}>
        <TextInput 
          size="large"
          fullWidth
          label="メールアドレス"
          icon={<MailOutlineIcon />}
          value={props.email}
          required
          handleChange={e=>props.handleChangeEmail(e.target.value)}
        />
      </Box>
      <Box className={classes.inputContainer}>
        <TextInput
          size="large"
          fullWidth
          label="パスワード"
          icon={<VpnKeyIcon />}
          value={props.password}
          type="password"
          required
          handleChange={e=>props.handleChangePassword(e.target.value)}
        />
      </Box>
      <Box className={classes.buttonContainer}>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleClick}
        >
          {props.page === 'login' && 'ログイン'}
          {props.page === 'signUp' && '新規ユーザ登録'}
        </Button>
       </Box>
      <Box><Typography className={classes.message}>{props.message}</Typography></Box>
      <Box
        className={classes.buttonContainer}
      >
        <Button
          className={classes.button}
          variant="contained"
          color="default"
          fullWidth
          size="large"
          onClick={props.handleClose}
        >
          Cancel
        </Button>
      </Box>
     
    </Box>
  )
}