import { useState } from 'react';
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import Mixer from './components/Mixer';
import FertilizerLibrary from './components/FertilizerLibrary';
import PastBlends from './components/PastBlends';

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    // Make the main box a flex container that takes the full viewport height
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NPK Solver
          </Typography>
        </Toolbar>
      </AppBar>
      {/* The main content container will grow to fill available space */}
      <Container maxWidth="lg" sx={{ mt: 4, flexGrow: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Mixer" />
            <Tab label="Fertilizer Library" />
            <Tab label="Past Blends" />
          </Tabs>
        </Box>
        {/* Add padding-bottom here to ensure space at the end of the content */}
        <Box sx={{ pt: 3, pb: 4 }}>
          {value === 0 && <Mixer />}
          {value === 1 && <FertilizerLibrary />}
          {value === 2 && <PastBlends />}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
