import React, { useState, useRef } from "react";
import { makeStyles, fade } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";

import Typography from "@material-ui/core/Typography";
import FileIcon from "@material-ui/icons/DescriptionOutlined";

import ApplicationBar from "../ApplicationBar/ApplicationBar";
const useStyles = makeStyles((theme) => ({
  rootWhoseChildUsesFlexGrow: {
    width: "100%",
    height: "100vh",
    // backgroundImage: "url(../images/landing-bg.png)",
    // backgroundPosition: "center bottom",
  },
  content: {
    padding: theme.spacing(2),

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
}));

export default function Importer() {
  /*
    JSON形式のテキストファイルからインポート
    インポート時には簡易的な文法チェックを行う。
  */
  const classes = useStyles();
  const fileInputRef = useRef();
  const [path, setPath] = useState(null);

  function handleCheck(event) {
    event.preventDefault();
    setPath(fileInputRef.current.files[0].name);
  }

  return (
    <>
    <Box>
      <form onSubmit={handleCheck}>
        <Input
          className={classes.input}
          ref={fileInputRef}
          startAdornment={
            <InputAdornment position="start">
              <FileIcon/>
            </InputAdornment>
          }
          type="file"

        />
        <Button
          type="submit"
        >
          読み込み
        </Button>
      </form>

    </Box>
    <Box>
      {path}
    </Box>

    </>
  );
}
