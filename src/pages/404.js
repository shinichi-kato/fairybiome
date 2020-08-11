import React from "react";
import Typography from "@material-ui/core/Typography";

export default function Component() {
  return (
    <div>
      <center>
        <Typography
          color="primary"
          component="span"
          gutterBottom
          paragraph
          variant="h3"
        >
          Hey! You just hit a page that doesn't exist.
        </Typography>
      </center>
    </div>
  );
}
