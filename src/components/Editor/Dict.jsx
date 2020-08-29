import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { VariableSizeList } from "react-window";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

import ChatIcon from "@material-ui/icons/Chat";

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

export default function Dict(props) {
  const { dict } = props;
  const classes = useStyles();

  function itemSize(index) {
    return 64;
  }

  function renderRow(childProps) {
    const { index, style } = childProps;
    const node = dict[index];
    const primaryText = node.in.length === 0 ? "(0)" : `${node.in[0]}(${node.in.length})`;
    const secondaryText = node.out.length === 0 ? "(0)" : `${node.out[0]}(${node.out.length})`;

    function handleClick() {
      props.setDictCursor(index);
    }

    return (
      <div style={style}>
        <ListItem
          button
          className={index === props.dictCursor ? classes.itemFocused : classes.item}
          dense
          key={index}
          onClick={handleClick}
        >
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary={primaryText} secondary={secondaryText} />
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
