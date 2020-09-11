import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from "../../src/theme";

export default function TopLayout(props) {
  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#D0E0D8" />
        <meta name="apple-mobile-web-app-title" content="FairyBiome" />
      </Helmet>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        {props.children}
      </ThemeProvider>
    </>
  );
}

TopLayout.propTypes = {
  children: PropTypes.node,
};
