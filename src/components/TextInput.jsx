import React from 'react';
import {
  fade,
  withStyles,
  makeStyles,
} from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';


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
      <FormControl>
        <InputLabel shrink htmlFor="bootstrap-input">
          {props.label}
        </InputLabel>
        <BootstrapInput 
          fullWidth={props.fullWidth}
          defaultValue={props.defaultValue} 
          size={props.size}
          value={props.value}
          type={props.type}
          onChange={props.onChange}
        />
      </FormControl>
    )
}