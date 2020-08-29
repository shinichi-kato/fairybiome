import React, { useState, useEffect, useMemo } from "react";
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
import Dict from "./Dict";
import DictInputs from "./DictInputs";

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
  "recaller": {
    label: "辞書型",
    description: "事前問答集のような辞書を使ってユーザのセリフに返答します"
  },
  "learner": {
    label: "学習型",
    description: "辞書型の動作をしますが、わからない単語があればユーザに質問し、それを記憶していきます。"
  }
};

export default function Parts(props) {
  const classes = useStyles();
  const partNames = props.pageName.split("-", 2);
  const partName = partNames[1];
  const data = props.parts[partName];
  const [partType, setPartType] = useState(data.type);
  const [behavior, setBehavior] = useState(data.behavior);
  const [dict, setDict] = useState(data.dict);
  const [dictCursor, setDictCursor] = useState(0);

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

  const MemorizedDict = useMemo(() => (
    <Dict
      dict={dict}
      dictCursor={dictCursor}
      setDict={setDict}
      setDictCursor={setDictCursor}
    />
  ), [dict, dictCursor]);

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
              {Object.keys(partTypeDescription).map(item => (
                <FormControlLabel
                  control={<Radio />}
                  key={item}
                  label={partTypeDescription[item].label}
                  value={item}
                />))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle2">
            {partTypeDescription[partType].description}
          </Typography>
        </Grid>
        <Behavior
          behavior={behavior}
          setBehavior={setBehavior}
          title="妖精のふるまい"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography>辞書</Typography>
      </Grid>
      <Grid item xs={12}>
        {MemorizedDict}
      </Grid>
      <Grid item xs={12}>
        <DictInputs
          dict={dict}
          dictCursor={dictCursor}
          setDict={setDict}
          setDictCursor={setDictCursor}
        />
      </Grid>
    </Box>
  );
}
