import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import Typography from "@material-ui/core/Typography";

export default function QueueList(props) {
  return (
    <div>
      {props.queue.length === 0 ?
        <Typography>キューは空です</Typography>
        :
        <List>
          {props.queue.map(queue => (
            <ListItem>
              <ListItemIcon>
                <AnnouncementIcon />
              </ListItemIcon>
              <ListItemText primary={queue} />
            </ListItem>
          ))}
        </List>
      }
    </div>
  );
}
