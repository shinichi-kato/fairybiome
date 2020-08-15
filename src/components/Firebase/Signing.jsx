import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import TextInput from "../TextInput.jsx";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

const useStyles = makeStyles((theme) => ({
  caption: {
    margin: "10px auto",
  },
  message: {
    color: theme.palette.error.main
  },
  inputContainer: {
    width: "90%",
    padding: "20px 10%",
    margin: "auto",
  },
  button: {
    padding: "1em",
  },
  buttonContainer: {
    padding: theme.spacing(2),
  },
}));

export default function Signing(props) {
  const classes = useStyles();

  function handleClick() {
    if (props.page === "login") {
      props.handleLogin();
    } else {
      props.handleSignUp();
    }
  }
  console.log("<Signing />");
  return (
    <Box
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box className={classes.inputContainer}>
        <TextInput
          fullWidth
          handleChange={e => props.handleChangeEmail(e.target.value)}
          icon={<MailOutlineIcon />}
          label="メールアドレス"
          required
          size="large"
          value={props.email}
        />
      </Box>
      <Box className={classes.inputContainer}>
        <TextInput
          fullWidth
          handleChange={e => props.handleChangePassword(e.target.value)}
          icon={<VpnKeyIcon />}
          label="パスワード"
          required
          size="large"
          type="password"
          value={props.password}
        />
      </Box>
      <Box className={classes.buttonContainer}>
        <Button
          className={classes.button}
          color="primary"
          fullWidth
          onClick={handleClick}
          size="large"
          variant="contained"
        >
          {props.page === "login" && "ログイン"}
          {props.page === "signUp" && "新規ユーザ登録"}
        </Button>
      </Box>
      <Box><Typography className={classes.message}>{props.message}</Typography></Box>
      <Box
        className={classes.buttonContainer}
      >
        <Button
          className={classes.button}
          color="default"
          fullWidth
          onClick={props.handleClose}
          size="large"
          variant="contained"
        >
          Cancel
        </Button>
      </Box>

    </Box>
  );
}
