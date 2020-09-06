import React from "react";
import {
  fade,
  withStyles,
} from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.common.white,
    border: "1px solid #ced4da",
    fontSize: 16,
    width: "auto",
    padding: "10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "&:focus": {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

export default function TextInput(props) {
  return (
    <FormControl fullWidth={props.fullWidth}>
      <InputLabel htmlFor="bootstrap-input" shrink>
        {props.label}
      </InputLabel>
      <BootstrapInput

        defaultValue={props.defaultValue}
        fullWidth={props.fullWidth}
        id="bootstrap-input"
        onChange={props.handleChange}
        required={props.required}
        size={props.size}
        startAdornment={
          <InputAdornment position="start">
            {props.icon}
          </InputAdornment>
        }
        type={props.type}
        value={props.value}
      />
    </FormControl>
  );
}
