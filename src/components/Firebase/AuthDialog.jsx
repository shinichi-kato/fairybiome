import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import LogoSvg from "../../../images/svg/logo.svg";
import Entry from "./Entry";
import Signing from "./Signing";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
  },
  logoBox: {
    margin: "10% 5% 10px 5%",
    height: "100%",
  },
  logo: {
    width: "calc(100% - 10%)"
  },
}));

export default function AuthDialog(props) {
  const user = props.user;
  const classes = useStyles();
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [page, setPage] = useState("entry"); // entry-login-signUp

  function handleChangeEmail(value) {
    setEmail(value);
  }

  function handleChangePassword(value) {
    setPassword(value);
  }

  function handleChangePage(value) {
    setPage(value);
  }

  function handleClose() {
    setPage("entry");
  }

  function handleLogin() {
    props.handleLogin(email, password);
  }

  function handleSignUp() {
    props.handleSignUp(email, password);
  }

  console.log("<AuthDialog/>");
  return (

    <Box
className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box className={classes.logoBox}>
        <LogoSvg className={classes.logo} height="100%" />
        {page}
      </Box>
      <Box>
        {page === "entry" ?
          <Entry
            handleChangePage={handleChangePage}
          />
          :
          <Signing
            email={email}
            handleChangeEmail={handleChangeEmail}
            handleChangePassword={handleChangePassword}
            handleClose={handleClose}
            handleLogin={handleLogin}
            handleSignUp={handleSignUp}
            message={props.message}
            page={page}
            password={password}
          />
        }
      </Box>
    </Box>
  );
}
