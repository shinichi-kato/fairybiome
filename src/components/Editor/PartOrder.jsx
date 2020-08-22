import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import ArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import EditIcon from "@material-ui/icons/Edit";
import AlbumIcon from "@material-ui/icons/Album";
import ContactIcon from "@material-ui/icons/ContactSupport";

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

}));

const typeAvatar = {
  "recaller": { "icon": <AlbumIcon />, color: "#22547A" },
  "learner": { "icon": <ContactIcon />, color: "#841460" }
};

export default function PartOrder(props) {
  const classes = useStyles();
  const [partOrder, setPartOrder] = useState(props.partOrder);
  const parts = props.parts;

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
   console.log(props)
    const availability = props.behavior.availability.toFixed(2);
    const generosity = props.behavior.generosity.toFixed(2);
    const retention = props.behavior.retention.toFixed(2);

    return (
      <Card >
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

          <IconButton >
            <ArrowUpIcon />
          </IconButton>
          <IconButton
          >
            <ArrowDownIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      {partOrder.map(part =>
        (<Box key={part}>
          <PartCard {...parts[part]} name={part} />
        </Box>)
      )}
    </Box>

  );
}
