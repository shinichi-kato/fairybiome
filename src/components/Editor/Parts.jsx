import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

import Behavior from "./Behavior";

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
  const partNames = props.pageName.split("-", 2);
  const partName = partNames[1];
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
    props.handleSavePart(
      partName, {
        type: partType,
        behavior: {
          availability: parseFloat(behavior.availability),
          generosity: parseFloat(behavior.generosity),
          retention: parseFloat(behavior.retention),
        },
        dict: dict,
        indict: {},
        outDict: null
      });
  }

  function handleChangeType(event) {
    const value = event.target.value;
    setPartType(value);
  }

  return (
    <Box
      className={classes.content}
      display="flex"
      flexDirection="column"
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
                value="learner" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle2">
            {partTypeDescription[partType]}
          </Typography>
        </Grid>
        <Behavior
          behavior={behavior}
          setBehavior={setBehavior}
          title="妖精のふるまい"
        />
      </Grid>
    </Box>
  );
}
