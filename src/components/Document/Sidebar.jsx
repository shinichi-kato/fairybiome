import React from "react";
import {Link, graphql, StaticQuery} from "gatsby";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    position: "relative",
    overflow: "auto",
    maxHeight: 300,
  },
  listSection: {
    backgroundColor: "inherit",
  },
  ul: {
    backgroundColor: "inherit",
    padding: 0,
  },
}));

const query = graphql`
query {
  file(relativePath: {eq: "sidebar.json"}) {
    childDocsJson {
      chapters {
        items {
          label
          to
        }
        subheader
      }
    }
  }
}`;

function Contents(props) {
  const classes = useStyles();
  return (
    <List className={classes.root} subheader={<li/>}>
      {props.chapters.map(chapter => (
        <li
          className={classes.listSection}
          key={`chapter-${chapter.subheader}`}
        >
          <ul className={classes.ul}>
            <ListSubheader>{chapter.subheader}</ListSubheader>
            {chapter.items.map(item => (
              <ListItem key={`item-${chapter.subheader}-${item.label}`}>
                <ListItemText primary={
                  <Link to={item.to}>{item.label}</Link>}/>
              </ListItem>
            ))}
          </ul>
        </li>
      ))}
    </List>
  );
}
export default function Sidebar() {
  return (
    <StaticQuery
      query={query}
      render={data => (<Contents
          chapters={data.file.childDocsJson.chapters} />)}
    />
  );
}
