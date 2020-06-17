import { createMuiTheme } from "@material-ui/core/styles";

// autism-friendly pallette
// 発達障害児や自閉症児が見やすいトーンを抑えた配色

const theme = createMuiTheme({
  palette: {
    primary: { main: '#212962' },
    secondary: { main: '#BF360C' },
    background: { default: '#7285a3'},
    error: { main: '#a52228', },
  },
});

export default theme;
