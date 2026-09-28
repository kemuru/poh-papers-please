// The one door from the UI to the court's engine. Swap the import for '../court/jury' when it lands.
export { appealCase, appealFee, canAppeal, hearCase, isUpheld, settle } from './fakeCourt';
export { JURY_SIZES, type CourtCase, type Evidence, type Round, type Seat } from '../court/types';
