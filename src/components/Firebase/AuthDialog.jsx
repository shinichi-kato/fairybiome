import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import LogoSvg from "../../../images/svg/logo.svg";
import Entry from "./Entry";
import Signing from "./Signing";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
  },
  logoContainer: {
    margin: "100px 5% 10px 5%",
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

  return (
    <Grid
      className={classes.root}
      container
      justify="center"
      spacing={1}
    >
      <Grid
        className={classes.logoContainer}
        item
        xs={12}
      >
        <LogoSvg className={classes.logo} height="100%" />
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
    </Grid>
  );
}
