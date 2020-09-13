import React, { useEffect, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import SayingIcon from "@material-ui/icons/RecordVoiceOver";
import HearingIcon from "../../icons/Hearing";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),

  },
  button: {
    margin: theme.spacing(1),
  },
  input: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },
  partCard: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1)
  }

}));

function reducer(state, action) {
  switch (action.type) {
    case "reload": {
      return {
        inputs: action.dict[action.dictCursor].in.join("\n"),
        outputs: action.dict[action.dictCursor].out.join("\n"),
        currentDictCursor: action.dictCursor
      };
    }
    case "changeInputs": {
      return {
        ...state,
        inputs: action.value
      };
    }
    case "changeOutputs": {
      return {
        ...state,
        outputs: action.value
      };
    }
    default:
      throw new Error(`invalid action ${action.type}`);
  }
}

export default function DictInputs(props) {
  const classes = useStyles();
  const { dict, dictCursor, setDict, setDictCursor } = props;
  const [state, dispatch] = useReducer(reducer, {
    inputs: dict[dictCursor].in.join("\n"),
    outputs: dict[dictCursor].out.join("\n"),
    currentDictCursor: dictCursor
  });

  function writeback() {
    setDict(prevDict => {
      prevDict[state.currentDictCursor] = {
        in: state.inputs.split("\n"),
        out: state.outputs.split("\n")
      };
      return prevDict;
    });
  }

  function handleDelete() {
    setDict(prevDict =>
      prevDict.splice(state.currentDictCursor, 1)
    );
    dispatch({type: "reload", dict: dict, dictCursor: dictCursor});
  }

  function enter() {
    if (dictCursor === dict.length - 1) {
      // 最下行であれば次の行を追加
      setDict(prevDict => [...prevDict, { in: [], out: [] }]);
    }
    setDictCursor(prev => prev + 1);
  }

  useEffect(() => {
    if (state.currentDictCursor !== dictCursor) {
      writeback();
      dispatch({ type: "reload", dict: dict, dictCursor: dictCursor });
    }
  }, [state.currentDictCursor, dictCursor]);

  useEffect(() => {
    // 親のpartが変わったらdictが変わる。dictが変わったらreloadする
    dispatch({ type: "reload", dict: dict, dictCursor: dictCursor });
  }, [dict]);

  function handleChangeInputs(e) {
    dispatch({ type: "changeInputs", value: e.target.value });
  }

  function handleChangeOutputs(e) {
    dispatch({ type: "changeOutputs", value: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    writeback();
    enter();
  }

  function handleKeyDown(e) {
    // ctrl+Enterで書き込み＋次の行へ移動
    if (e.ctrlKey && e.keyCode === 13) {
      e.stopPropagation();
      writeback();
      enter();
    }
  }

  return (
    <form className={classes.root} onSubmit={handleSubmit} >
      <Grid alignItems="center" container >
        <Grid item xs={1}>
          <HearingIcon />
        </Grid>
        <Grid item xs={11}>
          <Input
            className={classes.input}
            fullWidth
            multiline
            onBlur={writeback}
            onChange={handleChangeInputs}
            rows={3}
            value={state.inputs}
          />
        </Grid>
        <Grid item xs={1}> </Grid>
        <Grid item xs={11}>
          <Typography variant="caption">
            ユーザのセリフの候補を記入します。複数行ある場合、どの行のセリフにも下の返答候補から応答します。
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <SayingIcon />
        </Grid>
        <Grid item xs={11}>
          <Input
            className={classes.input}
            fullWidth
            multiline
            onBlur={writeback}
            onChange={handleChangeOutputs}
            onKeyDown={handleKeyDown}
            rows={3}
            value={state.outputs}
          />

        </Grid>
        <Grid item xs={1}> </Grid>
        <Grid item xs={11}>
          <Typography variant="caption">
            返答の候補を記入します。複数行ある場合、ランダムに選ばれた一つが返答に使われます。
            単語辞書のタグは展開されます。
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            className={classes.button}
            color="default"
            onClick={handleDelete}
            size="large"
            startIcon={<DeleteIcon />}
            variant="contained"
          >
            行を削除
          </Button>
          <Button
            className={classes.button}
            color="primary"
            size="large"
            type="submit"
            variant="contained"
          >
            書き込む (Ctrl+Enter)
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
