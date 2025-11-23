import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip
} from '@mui/material';
import type { Fertilizer } from '../types';

interface FertilizerFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (fertilizer: Fertilizer) => void;
  fertilizer?: Fertilizer;
}

const emptyFertilizer: Fertilizer = { id: '', name: '', n: 0, p: 0, k: 0 };

export default function FertilizerForm({ open, onClose, onSave, fertilizer }: FertilizerFormProps) {
  const [formState, setFormState] = useState<Fertilizer>(fertilizer || emptyFertilizer);

  useEffect(() => {
    setFormState(fertilizer || emptyFertilizer);
  }, [fertilizer, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: name === 'name' ? value : Number(value),
    });
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{fertilizer ? 'Edit Fertilizer' : 'Add New Fertilizer'}</DialogTitle>
      <DialogContent>
        <Tooltip title="Enter the common name of the fertilizer.">
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Fertilizer Name"
            type="text"
            fullWidth
            variant="standard"
            value={formState.name}
            onChange={handleChange}
          />
        </Tooltip>
        <Tooltip title="Percentage of Nitrogen (N) in the fertilizer (e.g., 10 for 10% N).">
          <TextField
            margin="dense"
            name="n"
            label="Nitrogen (N) %"
            type="number"
            fullWidth
            variant="standard"
            value={formState.n}
            onChange={handleChange}
          />
        </Tooltip>
        <Tooltip title="Percentage of Phosphorus (P2O5 equivalent) in the fertilizer (e.g., 15 for 15% P).">
          <TextField
            margin="dense"
            name="p"
            label="Phosphorus (P) %"
            type="number"
            fullWidth
            variant="standard"
            value={formState.p}
            onChange={handleChange}
          />
        </Tooltip>
        <Tooltip title="Percentage of Potassium (K2O equivalent) in the fertilizer (e.g., 20 for 20% K).">
          <TextField
            margin="dense"
            name="k"
            label="Potassium (K) %"
            type="number"
            fullWidth
            variant="standard"
            value={formState.k}
            onChange={handleChange}
          />
        </Tooltip>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
