import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";

const useStyles = makeStyles((theme) => ({
  input: {
    padding: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
  },
}));

export default function Behavior(props) {
  const classes = useStyles();

  function handleChangeAvailability(event) {
    const value = event.target.value;
    props.setBehavior(prevState => ({
      ...prevState,
      availability: value
    }));
  }

  function handleChangeGenerosity(event) {
    const value = event.target.value;
    props.setBehavior(prevState => ({
      ...prevState,
      generosity: value
    }));
  }

  function handleChangeRetention(event) {
    const value = event.target.value;
    props.setBehavior(prevState => ({
      ...prevState,
      retention: value
    }));
  }

  return (
    <>
      <Grid item xs={12}>
        {props.title}
      </Grid>
      <Grid item xs={5}>
        <Input
          className={classes.input}
          onChange={handleChangeAvailability}
          required
          value={props.behavior.availability}
        />
      </Grid>
      <Grid item xs={7}>
        <Typography variant="subtitle1">
          起動率(0.00〜1.00)
      </Typography>
        <Typography variant="subtitle2">
          0だと妖精はしゃべろうとしない。1だと常にしゃべろうとする。
      </Typography>
      </Grid>

      <Grid item xs={5}>
        <Input
          className={classes.input}
          onChange={handleChangeGenerosity}
          required
          value={props.behavior.generosity}
        />
      </Grid>
      <Grid item xs={7}>
        <Typography variant="subtitle1">
          寛容性(0.00〜1.00)
      </Typography>
        <Typography variant="subtitle2">
          0だと正確な場合だけ返答する。1だと適当なことにも返事をする。
      </Typography>
      </Grid>

      <Grid item xs={5}>
        <Input
          className={classes.input}
          onChange={handleChangeRetention}
          required
          value={props.behavior.retention}
        />
      </Grid>
      <Grid item xs={7}>
        <Typography variant="subtitle1">
          継続率(0.00〜1.00)
        </Typography>
          <Typography variant="subtitle2">
            0だと話題を続けない。1だと同じ話題をずっと続けようとする。
        </Typography>
      </Grid>
    </>
  );
}
