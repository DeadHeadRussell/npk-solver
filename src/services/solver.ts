/**
 * @file This module provides the core logic for calculating optimal fertilizer blends
 * using Mixed-Integer Linear Programming (MILP) via the glpk.js library.
 */

import type { Fertilizer, RecipeIngredient } from '../types';
import GLPK from 'glpk.js';

export interface CalculateMixParams {
  targetN: number;
  targetP: number;
  targetK: number;
  totalWeight: number;
  tolerance: number;
  increment: number;
  availableFertilizers: Fertilizer[];
}

export interface CalculationResult {
  recipe?: RecipeIngredient[];
  error?: string;
  actualNPK?: { n: number; p: number; k: number };
  actualWeight?: number;
}

export async function calculateMix(params: CalculateMixParams): Promise<CalculationResult> {
  const { 
    targetN, 
    targetP, 
    targetK, 
    totalWeight, 
    tolerance, 
    increment, 
    availableFertilizers: fertilizers
  } = params;

  const availableFertilizers = fertilizers.filter(fertilizer => {
    if (targetN === 0 && fertilizer.n > 0) return false;
    if (targetP === 0 && fertilizer.p > 0) return false;
    if (targetK === 0 && fertilizer.k > 0) return false;
    return true;
  });

  if (availableFertilizers.length === 0) {
    return { error: 'No fertilizers selected for mixing.' };
  }
  if (totalWeight <= 0 || increment <= 0) {
    return { error: 'Total weight and increment must be positive.' };
  }

  const glpk = await GLPK();
  const toleranceMultiplier = tolerance / 100;
  const epsilon = 0.001; 

  const lp = {
    name: 'Fertilizer-Mix',
    objective: {
      direction: glpk.GLP_MIN,
      name: 'count',
      vars: [] 
    },
    subjectTo: [],
    bounds: [], // This is for variable bounds, defined below
    binaries: [], // Names of binary variables
    generals: [] // Names of general integer variables
  } as any;

  const M = totalWeight * 2; // A large number for Big-M method

  // Map fertilizer IDs to their original objects for easy lookup
  const fertilizerMap = new Map<string, Fertilizer>();
  availableFertilizers.forEach((f, index) => {
    fertilizerMap.set(`x${index}`, f);

    const x_var = `x${index}`; // Continuous variable for amount of fertilizer f
    const z_var = `z${index}`; // Integer variable for increments of fertilizer f
    const y_var = `y${index}`; // Binary variable for whether fertilizer f is used

    // Objective: Minimize sum(y_f) - Add y_var to objective function
    lp.objective.vars.push({ name: y_var, coef: 1 });

    // Declare variable types for GLPK
    lp.binaries.push(y_var);
    lp.generals.push(z_var);

    // Variable Bounds: 0 <= x_f <= totalWeight, 0 <= z_f <= (totalWeight / increment), 0 <= y_f <= 1
    lp.bounds.push({ name: x_var, type: glpk.GLP_DB, lb: 0, ub: totalWeight });
    lp.bounds.push({ name: z_var, type: glpk.GLP_DB, lb: 0, ub: Math.floor(totalWeight / increment) });
    lp.bounds.push({ name: y_var, type: glpk.GLP_DB, lb: 0, ub: 1 }); // Binary variable bounds

    // --- Constraints related to each fertilizer ---

    // C1: Increment Constraint: x_f - increment * z_f = 0
    // Ensures that the amount of fertilizer x_f is always a multiple of the `increment`.
    lp.subjectTo.push({
      name: `c_increment_${index}`,
      vars: [{ name: x_var, coef: 1 }, { name: z_var, coef: -increment }],
      bnds: { type: glpk.GLP_FX, lb: 0, ub: 0 } // Fixed at 0
    });

    // C2: Big-M Upper Bound: x_f - M * y_f <= 0
    // If y_f is 0, then x_f must be 0. If y_f is 1, x_f can be up to M (totalWeight).
    lp.subjectTo.push({
      name: `c_bigM_upper_${index}`,
      vars: [{ name: x_var, coef: 1 }, { name: y_var, coef: -M }],
      bnds: { type: glpk.GLP_UP, ub: 0 } // Upper bound is 0 (i.e., <= 0)
    });

    // C3: Big-M Lower Bound: x_f - epsilon * y_f >= 0
    // If y_f is 1, then x_f must be at least epsilon. Ensures y_f is 1 if x_f > 0.
    lp.subjectTo.push({
      name: `c_bigM_lower_${index}`,
      vars: [{ name: x_var, coef: 1 }, { name: y_var, coef: -epsilon }],
      bnds: { type: glpk.GLP_LO, lb: 0 } // Lower bound is 0 (i.e., >= 0)
    });
  });

  // --- Global Constraint: Total Weight of the Blend ---
  // C4: Total weight constraint: sum(x_f) = totalWeight
  // The sum of all fertilizer amounts (x_f) must exactly equal the target `totalWeight`.
  lp.subjectTo.push({
    name: 'c_total_weight',
    vars: availableFertilizers.map((_, index) => ({ name: `x${index}`, coef: 1 })),
    bnds: { type: glpk.GLP_FX, lb: totalWeight, ub: totalWeight } // Fixed to totalWeight
  });

  // --- NPK Percentage Constraints (with conditional logic for zero targets) ---
  // Only add nutrient constraints if they are meaningful.
  // A constraint where the target is 0 AND all selected fertilizers are also 0 for that nutrient
  // results in a redundant `0 = 0` constraint that can cause some solvers to fail.

  // Nitrogen (N)
  const isNitrogenConstraintNecessary = !(targetN === 0 && availableFertilizers.every(f => f.n === 0));
  if (isNitrogenConstraintNecessary) {
    const targetNAmount = totalWeight * (targetN / 100);
    lp.subjectTo.push({
      name: 'c_N_tolerance',
      vars: availableFertilizers.map((f, index) => ({ name: `x${index}`, coef: f.n / 100 })),
      bnds: { type: glpk.GLP_DB, lb: targetNAmount * (1 - toleranceMultiplier), ub: targetNAmount * (1 + toleranceMultiplier) }
    });
  }

  // Phosphorus (P)
  const isPhosphorusConstraintNecessary = !(targetP === 0 && availableFertilizers.every(f => f.p === 0));
  if (isPhosphorusConstraintNecessary) {
    const targetPAmount = totalWeight * (targetP / 100);
    lp.subjectTo.push({
      name: 'c_P_tolerance',
      vars: availableFertilizers.map((f, index) => ({ name: `x${index}`, coef: f.p / 100 })),
      bnds: { type: glpk.GLP_DB, lb: targetPAmount * (1 - toleranceMultiplier), ub: targetPAmount * (1 + toleranceMultiplier) }
    });
  }

  // Potassium (K)
  const isPotassiumConstraintNecessary = !(targetK === 0 && availableFertilizers.every(f => f.k === 0));
  if (isPotassiumConstraintNecessary) {
    const targetKAmount = totalWeight * (targetK / 100);
    lp.subjectTo.push({
      name: 'c_K_tolerance',
      vars: availableFertilizers.map((f, index) => ({ name: `x${index}`, coef: f.k / 100 })),
      bnds: { type: glpk.GLP_DB, lb: targetKAmount * (1 - toleranceMultiplier), ub: targetKAmount * (1 + toleranceMultiplier) }
    });
  }

  try {
    const result = await glpk.solve(lp);

    if (result.result.status === glpk.GLP_OPT || result.result.status === glpk.GLP_FEAS) {
      const recipe: RecipeIngredient[] = [];
      let actualN = 0, actualP = 0, actualK = 0, actualWeight = 0;

      availableFertilizers.forEach((f, index) => {
        const x_val = result.result.vars[`x${index}`];
        if (x_val && x_val > epsilon) { 
          recipe.push({ fertilizer: f, amount: x_val });
          actualN += (x_val * f.n / 100);
          actualP += (x_val * f.p / 100);
          actualK += (x_val * f.k / 100);
          actualWeight += x_val;
        }
      });
      
      const finalNPK = {
        n: (actualN / actualWeight) * 100 || 0,
        p: (actualP / actualWeight) * 100 || 0,
        k: (actualK / actualWeight) * 100 || 0,
      };

      const finalRecipe = recipe.filter(item => item.amount > epsilon);

      return { 
        recipe: finalRecipe, 
        actualNPK: finalNPK, 
        actualWeight: actualWeight
      };
    } else {
      let errorMessage = 'No feasible solution found.';
      if (result.result.status === glpk.GLP_NOFEAS) {
        errorMessage = 'No feasible solution could be found for the given parameters. Try adjusting NPK targets, tolerance, or available fertilizers.';
      } else if (result.result.status === glpk.GLP_UNBND) {
        errorMessage = 'The problem is unbounded (variables can increase indefinitely without violating constraints).';
      } else if (result.result.status === glpk.GLP_UNDEF) {
        errorMessage = 'The problem is undefined (e.g., due to contradictory constraints or numerical instability).';
      } else {
        errorMessage = `Solver finished with status: ${result.result.status}`;
      }
      return { error: errorMessage };
    }
  } catch (err) {
    console.error("Error solving GLPK problem:", err);
    return { error: `An unexpected error occurred during calculation: ${err instanceof Error ? err.message : String(err)}` };
  }
}
