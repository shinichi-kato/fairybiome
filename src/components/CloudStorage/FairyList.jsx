import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { VariableSizeList } from "react-window";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles((theme) => ({
  scrollWindow: {
    backgroundColor: "#EEEEEE"
  },
  input: {
    padding: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },
  itemFocused: {
    backgroundColor: theme.palette.primary.light
  },
  item: {
  }

}));

export default function FairyList(props) {
  const fairyList = props.data;
  const classes = useStyles();

  function itemSize(index) {
    return 64;
  }

  function renderRow(childProps) {
    const { index, style } = childProps;
    const node = fairyList[index];

    function handleClick() {
      props.setCursor(node.id);
    }

    return (
      <div style={style}>
        <ListItem
          button
          className={index === props.cursor ? classes.itemFocused : classes.item}
          dense
          key={index}
          onClick={handleClick}
        >
          <ListItemIcon>
            <Avatar src={`../../static/svg/bot/${node.photoURL}`} />
          </ListItemIcon>
          <ListItemText primary={node.displayName} />
        </ListItem>
      </div>
    );
  }

  return (
    <div className={classes.scrollWindow} >
      <VariableSizeList
        height={300}
        itemCount={dict.length}
        itemSize={itemSize}
        width="100%">
        {renderRow}
      </VariableSizeList>
    </div>
  );
}
