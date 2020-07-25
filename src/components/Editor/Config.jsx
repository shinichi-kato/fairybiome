import React ,{useState } from "react";
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),

  },
  margin: {
    margin: theme.spacing(1),
  },
}));

export default function Config(props){
  const classes = useStyles();
  const config = props.config;

  return (
    <Box className={classes.content}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <TextField
          className={classes.margin}
          id="input-with-icon-textfield"
          label="TextField"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon />
              </InputAdornment>
            ),
          }}
        />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtext">妖精の名前</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button>保存する</Button>
        </Grid>
      </Grid>
    </Box>
  )
}