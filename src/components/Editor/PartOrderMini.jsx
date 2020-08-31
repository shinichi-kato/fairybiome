import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Slide from "@material-ui/core/Slide";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";

import FirstPageIcon from "@material-ui/icons/FirstPage";

import {typeAvatar} from "./PartOrder";

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
  },
  topPageIcon: {
    transform: "rotate(90deg)",
  }

}));

export default function PartOrderMini(props) {
  /* 現在のパート順序のみを表示。
     パートの編集・削除・新規作成はなく、特定のパートをトップに変更する
     ボタンがある。 */

  const classes = useStyles();
  const [cursor, setCursor] = useState();
  const [move, setMove] = useState();

  function handleTop(name) {
    setCursor(name);
    setMove("top");
  }

  function handleChanged() {
    props.setPartOrder(prevOrder => {
      let order = [...prevOrder];
      const index = order.indexOf(cursor);

      switch (move) {
        case "top": {
          if (index > 0) {
            order.splice(index, 1);
            order.unshift(cursor);
          }
          break;
        }
        default:
          throw new Error(`invalid move ${move}`);
      }
      return order;
    });
    setCursor(null);
    setMove(null);
  }

  function PartCardMini(childProps) {
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

    return (
      <Card
        className={classes.partCard}
      >
        <CardHeader
          action={
            <IconButton
              aria-label="top"
              onClick={e => handleTop(childProps.name)}
            >
              <FirstPageIcon className={classes.topPageIcon} />
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
              <PartCardMini
                {...props.parts[part]}
                name={part}
              />
            </div>
          </Slide>
        </Box>)
      )}
    </Box>
  );
}
