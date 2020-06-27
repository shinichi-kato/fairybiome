import React,{useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import TextInput from '../TextInput.jsx';

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

  const [email,setEmail] = useState(props.email);
  const [password,setPassword] = useState(props.password);
  const [page,setPage] = useState("entry"); // entry-login-signup

  function handleChangeEmail(value){
    setEmail(value);
  }

  function handleChangePassword(value){
    setPassword(value);
  }

  function handleChangePage(value){
    setPage(value);
  }
  function handleClick(){
    if(page === 'login'){
      props.handleLogin(email,password);
    } else {
      props.handleSignUp(email,password);
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
          value={email}
          handleChange={e=>handleChangeEmail(e.target.value)}
        />
      </Box>
      <Box className={classes.inputContainer}>
        <TextInput
          size="large"
          fullWidth
          label="パスワード"
          value={password}
          type="password"
          handleChange={e=>handleChangePassword(e.target.value)}
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