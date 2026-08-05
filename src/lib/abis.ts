// Aptos Move module reference for the prediction market.
// Unlike EVM ABIs, Move entry/view functions are called by fully-qualified name:
//   `${MODULE_ADDRESS}::${MODULE_NAME}::${function_name}`
import { CONTRACTS } from './constants';

export const MODULE_ID = `${CONTRACTS.MODULE_ADDRESS}::${CONTRACTS.MODULE_NAME}`;

export const ENTRY_FUNCTIONS = {
  CREATE_MARKET: `${MODULE_ID}::create_market`,
  PLACE_BET: `${MODULE_ID}::place_bet`,
  RESOLVE_MARKET: `${MODULE_ID}::resolve_market`,
  CLAIM_WINNINGS: `${MODULE_ID}::claim_winnings`,
} as const;

export const VIEW_FUNCTIONS = {
  MARKET_COUNT: `${MODULE_ID}::market_count`,
  GET_MARKET: `${MODULE_ID}::get_market`,
  GET_BETTOR_COUNT: `${MODULE_ID}::get_bettor_count`,
  VAULT_ADDRESS: `${MODULE_ID}::vault_address`,
} as const;
