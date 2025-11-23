import { useState } from 'react';
import { 
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Fertilizer } from '../types';
import { defaultFertilizers } from '../data/defaultFertilizers';

// We will create this component next
import FertilizerForm from './FertilizerForm';

export default function FertilizerLibrary() {
  const [fertilizers, setFertilizers] = useLocalStorage<Fertilizer[]>('fertilizers', defaultFertilizers);
  const [open, setOpen] = useState(false);
  const [selectedFertilizer, setSelectedFertilizer] = useState<Fertilizer | undefined>(undefined);

  const handleAdd = () => {
    setSelectedFertilizer(undefined);
    setOpen(true);
  };

  const handleEdit = (fertilizer: Fertilizer) => {
    setSelectedFertilizer(fertilizer);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    // Basic confirmation, will be improved
    if (window.confirm('Are you sure you want to delete this fertilizer?')) {
      setFertilizers(fertilizers.filter(f => f.id !== id));
    }
  };

  const handleSave = (fertilizer: Fertilizer) => {
    if (fertilizer.id) {
      // Update existing
      setFertilizers(fertilizers.map(f => f.id === fertilizer.id ? fertilizer : f));
    } else {
      // Add new
      setFertilizers([...fertilizers, { ...fertilizer, id: new Date().getTime().toString() }]);
    }
    setOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Add a new fertilizer to your personal library.">
          <Button variant="contained" onClick={handleAdd}>
            Add New Fertilizer
          </Button>
        </Tooltip>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Nitrogen (N)%</TableCell>
              <TableCell align="right">Phosphorus (P)%</TableCell>
              <TableCell align="right">Potassium (K)%</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fertilizers.map((fertilizer) => (
              <TableRow key={fertilizer.id}>
                <TableCell component="th" scope="row">
                  {fertilizer.name}
                </TableCell>
                <TableCell align="right">{fertilizer.n}</TableCell>
                <TableCell align="right">{fertilizer.p}</TableCell>
                <TableCell align="right">{fertilizer.k}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit this fertilizer">
                    <IconButton onClick={() => handleEdit(fertilizer)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete this fertilizer">
                    <IconButton onClick={() => handleDelete(fertilizer.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <FertilizerForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        fertilizer={selectedFertilizer}
      />
    </Box>
  );
}
