import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // A nice green
    },
    secondary: {
      main: '#FFC107', // A complementary amber
    },
  },
});

export default theme;
