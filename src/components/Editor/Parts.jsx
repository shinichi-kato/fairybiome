import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),
  },
  input: {
    padding: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },
  splitHalf: {
    width: "45%"
  }

}));

const partTypeDescription = {
  "recaller": "事前問答集のような辞書を使ってユーザのセリフに返答します",
  "learner": "辞書型の動作をしますが、わからない単語があればユーザに質問し、それを記憶していきます。"
};

export default function Parts(props) {
  const classes = useStyles();
  const partName = props.pageName.split("-",1)[1];
  const data = props.parts[partName];
  const [partType, setPartType] = useState(data.type);
  const [behavior, setBehavior] = useState(data.behavior);
  const [dict, setDict] = useState(data.dict);

  useEffect(() => {
    if (props.pageWillChange) {
      handleSave();
    }
  }, [props.pageWillChange]);

  function handleSave() {
    return;
  }

  function handleChangeType(event) {
    setPartType(event.target.value);
  }

  function handleChangeAvailability(event) {
    setBehavior(prevState => ({
      ...prevState,
      availability: event.target.value
    }));
  }

  function handleChangeGenerosity(event) {
    setBehavior(prevState => ({
      ...prevState,
      generosity: event.target.value
    }));
  }

  function handleChangeRetention(event) {
    setBehavior(prevState => ({
      ...prevState,
      retention: event.target.value
    }));
  }

  return (
    <Box
      className={classes.content}
      display="flex"
      flexDirectioin="column"
    >
      <Grid
        alignItems="center"
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <Typography>
            {partName}
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <FormControl component="fieldset">
            <FormLabel component="legend">パートの種類</FormLabel>
            <RadioGroup
              aria-label="パートの種類"
              name="partType"
              onChange={handleChangeType}
              value={partType}
            >
              <FormControlLabel
                control={<Radio />}
                label="辞書型"
                value="recaller"
              />
              <FormControlLabel
                control={<Radio />}
                label="学習型"
                value="lerner" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle2">
            {partTypeDescription[partType]}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          妖精のふるまい
        </Grid>
        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={handleChangeAvailability}
            required
            value={behavior.availability}
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
            value={behavior.generosity}
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
            value={behavior.retention}
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
      </Grid>

    </Box>
  );
}
