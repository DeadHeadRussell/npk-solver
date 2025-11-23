import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Slider, 
  Button,
  FormControl,
  Alert,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Stack,
  Autocomplete
} from '@mui/material';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Fertilizer, RecipeIngredient, Blend } from '../types';
import { defaultFertilizers } from '../data/defaultFertilizers';
import { calculateMix } from '../services/solver.ts';

// Helper function to handle number input changes allowing empty strings
const handleNumberInputChange = (setter: React.Dispatch<React.SetStateAction<number | string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Allow empty string, or only valid numbers
  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
    setter(value);
  }
};

// Helper function to safely get a number from state, defaulting to 0 for NPK, or a specific default for others
const getSafeNumber = (value: number | string, defaultValue: number = 0): number => {
  if (value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};


export default function Mixer() {
  // State for mixer inputs
  const [targetN, setTargetN] = useState<number | string>(10);
  const [targetP, setTargetP] = useState<number | string>(10);
  const [targetK, setTargetK] = useState<number | string>(10);
  const [totalWeight, setTotalWeight] = useState<number | string>(1000);
  const [tolerance, setTolerance] = useState<number>(5); // Slider is always a number
  const [increment, setIncrement] = useState<number | string>(10);

  // State for fertilizer selection
  const [allFertilizers] = useLocalStorage<Fertilizer[]>('fertilizers', defaultFertilizers);
  // Default to all fertilizers being selected
  const [selectedFertilizers, setSelectedFertilizers] = useState<Fertilizer[]>(allFertilizers);

  // State for results and saving
  const [calculationResult, setCalculationResult] = useState<{ 
    recipe?: RecipeIngredient[]; 
    error?: string;
    actualNPK?: { n: number; p: number; k: number };
    actualWeight?: number;
  } | null>(null);
  const [pastBlends, setPastBlends] = useLocalStorage<Blend[]>('pastBlends', []);

  // --- Handlers ---
  const handleCalculateMix = async () => {
    const safeTargetN = getSafeNumber(targetN);
    const safeTargetP = getSafeNumber(targetP);
    const safeTargetK = getSafeNumber(targetK);
    const safeTotalWeight = getSafeNumber(totalWeight, 0);
    const safeIncrement = getSafeNumber(increment, 0);

    if (safeTotalWeight <= 0) {
      setCalculationResult({ error: "Total Blend Weight must be greater than 0." });
      return;
    }
    if (safeIncrement <= 0) {
      setCalculationResult({ error: "Ingredient Increment must be greater than 0." });
      return;
    }

    // Pass all selected fertilizers to the solver.
    // The solver itself will handle the logic for zero targets now.
    const params = {
      targetN: safeTargetN,
      targetP: safeTargetP,
      targetK: safeTargetK,
      totalWeight: safeTotalWeight,
      tolerance,
      increment: safeIncrement,
      availableFertilizers: selectedFertilizers, 
    };
    
    setCalculationResult(null); 
    const result = await calculateMix(params);
    setCalculationResult(result);
  };

  const handleSaveBlend = () => {
    if (calculationResult?.recipe && !calculationResult.error && calculationResult.actualNPK && calculationResult.actualWeight) {
      const newBlend: Blend = {
        id: crypto.randomUUID(),
        name: `Blend ${new Date().toLocaleString()}`,
        date: new Date().toISOString(),
        targetNPK: { 
          n: getSafeNumber(targetN), 
          p: getSafeNumber(targetP), 
          k: getSafeNumber(targetK) 
        },
        totalWeight: calculationResult.actualWeight,
        recipe: calculationResult.recipe,
      };
      setPastBlends((prevBlends) => [...prevBlends, newBlend]);
      alert('Blend saved successfully!');
    } else {
      alert('Cannot save blend: no successful calculation result found or missing NPK/Weight data.');
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page reload
    handleCalculateMix();
  };

  // --- Render ---
  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleFormSubmit}>
      <Stack spacing={4}>
        {/* NPK and Blend Parameter Inputs */}
        <Box>
          <Typography variant="h6" gutterBottom>Target NPK Ratio</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Tooltip title="Desired percentage of Nitrogen in the final blend.">
              <TextField
                label="Target N"
                type="text" // Changed to text
                value={targetN}
                onChange={handleNumberInputChange(setTargetN)}
                inputProps={{ pattern: '[0-9]*', min: 0, max: 100 }}
                variant="outlined"
                sx={{ width: 100 }}
              />
            </Tooltip>
            <Tooltip title="Desired percentage of Phosphorus (P2O5 equivalent) in the final blend.">
              <TextField
                label="Target P"
                type="text" // Changed to text
                value={targetP}
                onChange={handleNumberInputChange(setTargetP)}
                inputProps={{ pattern: '[0-9]*', min: 0, max: 100 }}
                variant="outlined"
                sx={{ width: 100 }}
              />
            </Tooltip>
            <Tooltip title="Desired percentage of Potassium (K2O equivalent) in the final blend.">
              <TextField
                label="Target K"
                type="text" // Changed to text
                value={targetK}
                onChange={handleNumberInputChange(setTargetK)}
                inputProps={{ pattern: '[0-9]*', min: 0, max: 100 }}
                variant="outlined"
                sx={{ width: 100 }}
              />
            </Tooltip>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Blend Parameters</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Tooltip title="The total desired weight of the final fertilizer blend in grams.">
              <TextField
                label="Total Blend Weight (g)"
                type="text" // Changed to text
                value={totalWeight}
                onChange={handleNumberInputChange(setTotalWeight)}
                inputProps={{ pattern: '[0-9]*', min: 1 }}
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title="Allowed deviation (plus or minus) from the target NPK percentages. Higher tolerance makes finding a solution easier.">
              <Box sx={{ width: 220 }}>
                <Typography id="tolerance-slider" gutterBottom>Tolerance (%)</Typography>
                <Slider
                  value={tolerance}
                  onChange={(e, newValue) => setTolerance(newValue as number)}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={20}
                />
              </Box>
            </Tooltip>
            <Tooltip title="The minimum amount (in grams) by which each ingredient can be added to the mix. A higher increment simplifies the mix.">
              <TextField
                label="Ingredient Increment (g)"
                type="text" // Changed to text
                value={increment}
                onChange={handleNumberInputChange(setIncrement)}
                inputProps={{ pattern: '[0-9]*', min: 1 }}
                variant="outlined"
              />
            </Tooltip>
          </Stack>
        </Box>

        {/* Multi-Select Autocomplete for Fertilizers */}
        <FormControl fullWidth>
          <Typography variant="h6" gutterBottom>Available Fertilizers for Mix</Typography>
          <Autocomplete
            multiple
            id="fertilizer-selector"
            options={allFertilizers}
            getOptionLabel={(option) => `${option.name} (${option.n}-${option.p}-${option.k})`}
            value={selectedFertilizers}
            onChange={(event, newValue) => {
              setSelectedFertilizers(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Fertilizers"
                placeholder="Type to search..."
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableCloseOnSelect
            sx={{ mb: 1 }}
          />
          <Button onClick={() => setSelectedFertilizers(allFertilizers)} variant="outlined" size="small" sx={{ maxWidth: 120 }}>
            Select All
          </Button>
        </FormControl>

        <Box>
          <Tooltip title="Calculate the optimal blend based on your inputs and selected fertilizers.">
            <Button variant="contained" color="primary" type="submit" onClick={handleCalculateMix} size="large">
              Calculate Mix
            </Button>
          </Tooltip>
        </Box>

        {/* Calculation Result Section */}
        {calculationResult && (
          <Box sx={{ mt: 2 }}>
            {calculationResult.error && (
              <Alert severity="error">{calculationResult.error}</Alert>
            )}
            {calculationResult.recipe && calculationResult.recipe.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Calculated Recipe:</Typography>
                {calculationResult.actualNPK && calculationResult.actualWeight && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Actual NPK: {calculationResult.actualNPK.n.toFixed(1)}-{calculationResult.actualNPK.p.toFixed(1)}-{calculationResult.actualNPK.k.toFixed(1)} | Actual Weight: {calculationResult.actualWeight.toFixed(1)}g
                  </Typography>
                )}
                <List dense>
                  {calculationResult.recipe.map((item, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText 
                        primary={`${item.amount.toFixed(1)}g of ${item.fertilizer.name}`}
                        secondary={`(${item.fertilizer.n}-${item.fertilizer.p}-${item.fertilizer.k})`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Tooltip title="Save this successful blend to your Past Blends for future reference.">
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    sx={{ mt: 1 }} 
                    onClick={handleSaveBlend}
                  >
                    Save Blend
                  </Button>
                </Tooltip>
              </Box>
            )}
            {calculationResult.recipe && calculationResult.recipe.length === 0 && (
              <Alert severity="info">No suitable mix found with current parameters.</Alert>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
