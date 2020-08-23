import React, { useState, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import ArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import EditIcon from "@material-ui/icons/Edit";
import AlbumIcon from "@material-ui/icons/Album";
import ContactIcon from "@material-ui/icons/ContactSupport";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

import Part from "../../biomebot/part.jsx";

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),

  },
  margin: {
    margin: theme.spacing(1),
  },
  input: {
    padding: theme.spacing(2),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },
  partCard: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1)
  }

}));

const typeAvatar = {
  "recaller": { "icon": <AlbumIcon />, color: "#22547A" },
  "learner": { "icon": <ContactIcon />, color: "#841460" }
};

function reducer(state, action) {
  switch (action.type) {
    case "raise": {
      return {
        ...state,
        cursor: action.name,
        move: "raise"
      };
    }

    case "drop": {
      return {
        ...state,
        cursor: action.name,
        move: "drop"
      };
    }

    case "changed": {
      let order = [...state.partOrder];
      const index = state.partOrder.indexOf(state.cursor);

      if (state.move === "raise") {
        if (index > 0) {
          order.splice(index, 1);
          order.splice(index - 1, 0, state.cursor);
        }
      } else if (state.move === "drop") {
        if (index >= 0 && index < state.partOrder.length) {
          order.splice(index, 1);
          order.splice(index + 1, 0, state.cursor);
        }
      }

      return {
        partOrder: order,
        cursor: null,
        move: null
      };
    }

    case "add": {
     let order = [...state.partOrder, action.name];
     return {
       partOrder: order,
       cursor: null,
       move: null
     };
    }

    default:
      throw new Error(`unknown action ${action.type}`);
  }
}

function NewPartButton(props) {
  const classes = useStyles();
  const [value, setValue] = useState(props.name);

  function handleSubmit(event) {
    event.preventDefault();
    props.handleCreatePart(value);
  }

  const isDuplicated = value in props.parts;
  return (
    <Card
      className={classes.partCard}
    >
      <form onSubmit={handleSubmit}>
        <Input
          onChange={e => setValue(e.target.value)}
          value={value}
        />
        <Button
          disabled={value.length !== 0 && !isDuplicated}
          fullWidth
          size="large"
          startIcon={<AddCircleOutlineIcon />}
          type="submit"
          variant="contained"
        >
          新しいパートを追加
        </Button>
        <Typography color="error">
          {isDuplicated && "同じ名前のパートは作れません"}
        </Typography>

      </form>
    </Card>
  );
}

export default function PartOrder(props) {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, { partOrder: props.partOrder, cursor: null });
  const [parts, setParts] = useState(props.parts);

  function PartCard(props) {
    /* props:
      {
        name: str,
        type: str,
        key: str,
        behavior:{
          availability: float,
          generosity: float,
          retention: float
        },
        dictSize: int
      }

    */
    const availability = props.behavior.availability.toFixed(2);
    const generosity = props.behavior.generosity.toFixed(2);
    const retention = props.behavior.retention.toFixed(2);

    return (
      <Card
        className={classes.partCard}
      >
        <CardHeader
          action={
            <IconButton aria-label="settings">
              <EditIcon />
            </IconButton>
          }
          avatar={
            <Avatar aria-label="part" className={classes.avatar}>
              {typeAvatar[props.type].icon}
            </Avatar>
          }
          subheader={`稼働率:${availability} 寛容性:${generosity} 継続率:${retention}`}
          title={props.name}
        />
        <CardActions disableSpacing>

          <IconButton
            onClick={e => dispatch({ type: "raise", name: props.name })}
          >
            <ArrowUpIcon />
          </IconButton>
          <IconButton
            onClick={e => dispatch({ type: "drop", name: props.name })}
          >
            <ArrowDownIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }

  function handleCreatePart(name) {
    setParts(prevParts=>({
      ...prevParts,
      [name]: new Part()
    }));

    dispatch({type: "add", name: name});
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      {state.partOrder.map(part =>
        (<Box key={part}>
          <Slide
            direction="right"
            in={state.cursor !== part}
            onExited={() => dispatch({ type: "changed" })}
            timeout={300}
          >
            <div>
              <PartCard {...parts[part]} name={part} />
            </div>
          </Slide>
        </Box>)
      )}
      <NewPartButton
        handleCreatePart={handleCreatePart}
        parts={state.partOrder}
      />
    </Box>

  );
}
