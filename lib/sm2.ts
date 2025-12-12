// Deprecated. Replaced by lib/algorithm.ts
// Keeping this file to export getInitialWordState compatible with new format to prevent breakages in AddWordModal
import { getInitialWordState as getAlgoInitialState } from './algorithm';

export const calculateReview = () => {
    throw new Error("SM-2 is deprecated. Use lib/algorithm.ts");
}

export const getInitialWordState = getAlgoInitialState;