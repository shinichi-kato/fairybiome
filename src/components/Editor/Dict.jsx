import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { VariableSizeList } from "react-window";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

import DeleteIcon from "@material-ui/icons/Delete";
import ChatIcon from "@material-ui/icons/Chat";

const useStyles = makeStyles((theme) => ({
  scrollWindow: {
  },
  input: {
    padding: theme.spacing(1),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  }
}));

export default function Dict(props) {
  const { dict, itemHeight } = props;
  const classes = useStyles();

  function renderRow(childProps) {
    const { index, style } = childProps;
    const node = dict[index];
    const primaryText = `${node.in[0]}(${node.in.length})`;
    const secondaryText = `${node.out[0]}(${node.out.length})`;

    return (
      <ListItem button key={index} style={style}>
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary={primaryText} secondary={secondaryText} />
      </ListItem>
    );
  }

  return (
    <div className={classes.scrollWindow} >
      <VariableSizeList
        height={450}
        itemCount={dict.length}
        itemSize={itemHeight}
        width="100%">
        {renderRow}
      </VariableSizeList>
    </div>

  );
}
