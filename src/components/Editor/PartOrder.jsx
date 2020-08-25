import React, { useState } from "react";
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
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import ArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import EditIcon from "@material-ui/icons/Edit";
import AlbumIcon from "@material-ui/icons/Album";
import ContactIcon from "@material-ui/icons/ContactSupport";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteIcon from "@material-ui/icons/DeleteForever";

import Part from "../../biomebot/part.jsx";

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),

  },
  margin: {
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

const typeAvatar = {
  "recaller": { "icon": <AlbumIcon />, color: "#22547A" },
  "learner": { "icon": <ContactIcon />, color: "#841460" }
};

function NewPartButton(props) {
  const classes = useStyles();
  const [value, setValue] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    props.handleCreate(value);
    setValue("");
  }

  const isDuplicated = props.partOrder.indexOf(value) !== -1;
  return (
    <Card
      className={classes.partCard}
    >
      <form onSubmit={handleSubmit}>
        新しいパートの名前
        <Input
          className={classes.input}
          onChange={e => setValue(e.target.value)}
          value={value}
        />
        <Button
          disabled={value === "" || isDuplicated}
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

  // partOrder, setPartOrderはpropsからもらう
  // parts, setPartsはpropsからもらう
  const [cursor, setCursor] = useState();
  const [move, setMove] = useState();

  function handleRaise(name) {
    setCursor(name);
    setMove("raise");
  }

  function handleDrop(name) {
    setCursor(name);
    setMove("drop");
  }

  function handleCreate(name) {
    setCursor(name);
    setMove(null);
    const newPart = new Part();
    props.handleSavePart(name, newPart);
    props.setPartOrder(prevOrder => [...prevOrder, name]);
    setCursor(null);
  }

  function handleDelete(name) {
    setCursor(name);
    setMove("delete");
  }

  function handleChanged() {
    props.setPartOrder(prevOrder => {
      let order = [...prevOrder];
      const index = order.indexOf(cursor);

      switch (move) {
        case "raise": {
          if (index > 0) {
            order.splice(index, 1);
            order.splice(index - 1, 0, cursor);
          }
          break;
        }
        case "drop": {
          if (index >= 0 && index < order.length) {
            order.splice(index, 1);
            order.splice(index + 1, 0, cursor);
          }
          break;
        }
        case "delete": {
          order = prevOrder.filter(part => part !== cursor);
          break;
        }
        default :
          throw new Error(`invalid move ${move}`);
      }
      return order;
    });
    setCursor(null);
    setMove(null);
  }

  function PartCard(childProps) {
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
    const availability = childProps.behavior.availability.toFixed(2);
    const generosity = childProps.behavior.generosity.toFixed(2);
    const retention = childProps.behavior.retention.toFixed(2);
    const [anchorEl, setAnchorEl] = useState();

    function handleClickEdit() {
      childProps.handleChangePage(`part-${childProps.name}`);
    }

    function handleOpenDeleteMenu(e) {
      setAnchorEl(e.currentTarget);
    }

    function handleClickDelete(name) {
      setAnchorEl(null);
      childProps.handleDelete(name);
    }

    function handleCloseDeleteMenu() {
      setAnchorEl(null);
    }

    return (
      <Card
        className={classes.partCard}
      >
        <CardHeader
          action={
            <IconButton
              aria-label="edit"
              onClick={handleClickEdit}
            >
              <EditIcon />
            </IconButton>
          }
          avatar={
            <Avatar aria-label="part" className={classes.avatar}>
              {typeAvatar[childProps.type].icon}
            </Avatar>
          }
          subheader={`稼働率:${availability} 寛容性:${generosity} 継続率:${retention}`}
          title={childProps.name}
        />
        <CardActions disableSpacing>

          <IconButton
            onClick={e => handleRaise(childProps.name)}
          >
            <ArrowUpIcon />
          </IconButton>
          <IconButton
            onClick={e => handleDrop(childProps.name)}
          >
            <ArrowDownIcon />
          </IconButton>
          <IconButton
            aria-controls="delete-menu"
            aria-haspopup="true"
            onClick={handleOpenDeleteMenu}
          >
            <DeleteIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="delete-menu"
            onClose={handleCloseDeleteMenu}
            open={Boolean(anchorEl)}
          >
            <MenuItem
              onClick={e => handleClickDelete(childProps.name)}>
              このパートを削除
              </MenuItem>
          </Menu>
        </CardActions>
      </Card>
    );
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      {props.partOrder.map(part =>
        (<Box key={part}>
          <Slide
            direction="right"
            in={cursor !== part}
            onExited={handleChanged}
            timeout={300}
          >
            <div>
              <PartCard
                {...props.parts[part]}
                handleChangePage={props.handleChangePage}
                handleDelete={handleDelete}
                name={part}
              />
            </div>
          </Slide>
        </Box>)
      )}
      <NewPartButton
        handleCreate={name=>handleCreate(name)}
        partOrder={props.partOrder}
      />
    </Box>

  );
}
