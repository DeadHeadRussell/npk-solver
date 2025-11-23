import { Box, List, ListItem, ListItemText, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Blend } from '../types';

export default function PastBlends() {
  const [pastBlends, setPastBlends] = useLocalStorage<Blend[]>('pastBlends', []);

  const handleDeleteBlend = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved blend?')) {
      setPastBlends(pastBlends.filter(blend => blend.id !== id));
    }
  };

  return (
    <Box>
      {pastBlends.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No blends saved yet. Calculate and save a blend in the Mixer tab!
        </Typography>
      ) : (
        <List>
          {pastBlends.map((blend) => (
            <ListItem 
              key={blend.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteBlend(blend.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={blend.name}
                secondary={`Target NPK: ${blend.targetNPK.n}-${blend.targetNPK.p}-${blend.targetNPK.k}, Total Weight: ${blend.totalWeight.toFixed(1)}g (${new Date(blend.date).toLocaleDateString()})`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
