import React from 'react';
import {
  fade,
  withStyles,
} from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    width: 'auto',
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

export default function TextInput(props){
    return (
        <FormControl fullWidth={props.fullWidth}>
          <InputLabel shrink htmlFor="bootstrap-input">
            {props.label}
          </InputLabel>
          <BootstrapInput 

            id="bootstrap-input"
            startAdornment={
              <InputAdornment position="start">
                {props.icon}
              </InputAdornment>
            }
            fullWidth={props.fullWidth}
            defaultValue={props.defaultValue} 
            required={props.required}
            size={props.size}
            value={props.value}
            type={props.type}
            onChange={props.handleChange}
          />
        </FormControl>
    )
}