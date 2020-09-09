import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import MenuBookIcon from "@material-ui/icons/MenuBook";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  tab: {
    minWidth: "25%"
  }
}));

export default function ApplicationTabBar(props) {
  const classes = useStyles();

  function handleChangePage(event, newValue) {
    props.handleChangePage(newValue);
  }

  function handleExit() {
    props.handleChangePage("exit");
  }
  return (
    <AppBar position="static">
      <Toolbar color="inherit">
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleExit}
        >
          <NavigateBeforeIcon />

        </IconButton>
        <Typography
          className={classes.title}
          variant="h6"
        >
          {props.title}
        </Typography>
        <IconButton
          color="inherit"
          edge="end"
        >
          <MenuBookIcon />
        </IconButton>

      </Toolbar>
      <Tabs
        aria-label="editor tabs"
        onChange={handleChangePage}
        scrollButtons="auto"
        value={props.page}
        variant="scrollable" >
        <Tab
          aria-controls="editor-tabpanel-0"
          className={classes.tab}
          id="editor-tab-config"
          label="基本"
          value="config" />
        <Tab
          aria-controls="editor-tabpanel-1"
          className={classes.tab}
          id="editor-tab-worddict"
          label="単語辞書"
          value="wordDict" />
        {props.partOrder.map(partName =>
          (<Tab
            aria-controls={`editor-tabpanel-part-${partName}`}
            className={classes.tab}
            id={`editor-tab-part-${partName}`}
            key={`editor-tab-part-${partName}`}
            label={`『${partName}』`}
            value={`part-${partName}`} />))}
        <Tab
          aria-controls="editor-tabpanel-3"
          className={classes.tab}
          id="editor-tab-misc"
          label="その他"
          value="misc" />
      </Tabs>
    </AppBar>
  );
}
