export { generateSuggestion, type SuggestionResult } from './suggestionEngine';
export { isWeatherAppropriate, weatherFitScore, needsOuterwear, needsAccessories } from './weatherRules';
export { recencyScore, varietyScore } from './rotationScorer';
export { areColorsCompatible, colorHarmonyScore } from './colorHarmony';
