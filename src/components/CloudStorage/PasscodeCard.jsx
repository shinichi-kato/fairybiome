import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

import TextInput from "../TextInput.jsx";
import { localStorageIO } from "../../utils/localStorageIO";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  content: {
    padding: theme.spacing(1)
  }
}));

export default function PasscodeCard(props) {
  const classes = useStyles();
  const envPasscode = typeof window !== "undefined"
    && process.env.GATSBY_FAIRYBIOME_PASSCODE;

  const [passcode, setPasscode] = useState(
    localStorageIO.getItem("fairyBiome.passcode"));
  const [rememberPass, setRememberPass] = useState(
    localStorageIO.getItem("fairyBiome.rememberPass", false) === "true");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (envPasscode === passcode) {
      props.setOpen(true);
    }
  }, []);

  function handleChangePasscode(e) {
    setPasscode(e.target.value);
  }

  function handleChangeRememberMe(e) {
    setRememberPass(e.target.checked);
  }

  function handleSubmit(e) {
    e.preventDefault();
    checkPass();
  }

  function handleClick(e) {
    checkPass();
  }

  function checkPass() {
    localStorageIO.setItem("fairyBiome.rememberPass", rememberPass);
    localStorageIO.setItem("fairyBiome.passcode", rememberPass ? passcode : "");

    if (envPasscode === passcode) {
      setMessage("");
      props.setOpen(true);
    } else {
      setMessage("パスコードが一致しません");
      props.setOpen(false);
    }
  }

  return (
    <Card
      className={classes.root}
      variant="outlined">
      <CardHeader title="パスコード" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="flex-end"
          >
            <Box className={classes.content}>
              <TextInput
                handleChange={handleChangePasscode}
                icon={<VpnKeyIcon/>}
                required
                type="password"
                value={passcode}
              />
            </Box>
            <Box className={classes.content}>
              <Button
                color="default"
                onClick={handleClick}
                variant="contained"
              >OK</Button>
            </Box>
          </Box>
          <FormControlLabel
            control={<Checkbox checked={rememberPass} name="checkedA" onChange={handleChangeRememberMe} />}
            label="パスコードを記憶する"
          />
          <Typography color="error">{message}</Typography>
        </form>
      </CardContent>
    </Card>
  );
}
