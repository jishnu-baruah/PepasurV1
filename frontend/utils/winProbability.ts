import { formatEther, parseEther } from 'viem';

/**
 * Calculate win probabilities for a game based on stake amount and player count
 */
export interface WinProbabilities {
  mafiaWinPercent: number;
  nonMafiaWinPercent: number;
  totalPot: bigint;
  totalPotFormatted: string;
  netPot: bigint;
  netPotFormatted: string;
}

export function calculateWinProbabilities(
  stakeAmount: bigint | number | string, // in Wei or as a number/string
  playerCount: number,
  minPlayers: number = 4
): WinProbabilities {
  // Convert stakeAmount to bigint if it's not already
  const stakeAmountBigInt = typeof stakeAmount === 'bigint'
    ? stakeAmount
    : typeof stakeAmount === 'string'
      ? parseEther(stakeAmount)
      : BigInt(stakeAmount);

  const totalPot = stakeAmountBigInt * BigInt(playerCount);
  const netPot = (totalPot * BigInt(98)) / BigInt(100); // After 2% house cut

  // Assuming 1 mafia, rest are non-mafia
  const mafiaCount = 1;
  const nonMafiaCount = playerCount - mafiaCount;

  // Calculate win percentages
  const mafiaWinPercent = playerCount > 0 && nonMafiaCount > 0
    ? Math.round(Number((netPot / BigInt(mafiaCount) * BigInt(100)) / stakeAmountBigInt) - 100)
    : 0;

  const nonMafiaWinPercent = playerCount > 0 && nonMafiaCount > 0
    ? Math.round(Number((netPot / BigInt(nonMafiaCount) * BigInt(100)) / stakeAmountBigInt) - 100)
    : 0;

  return {
    mafiaWinPercent,
    nonMafiaWinPercent,
    totalPot,
    totalPotFormatted: parseFloat(formatEther(totalPot)).toFixed(4),
    netPot,
    netPotFormatted: parseFloat(formatEther(netPot)).toFixed(4)
  };
}

/**
 * Format token amount from Wei (18 decimals)
 */
export function formatToken(wei: bigint | number | string): string {
  const weiBigInt = typeof wei === 'bigint'
    ? wei
    : typeof wei === 'string'
      ? BigInt(wei)
      : BigInt(wei);

  return parseFloat(formatEther(weiBigInt)).toFixed(4);
}

/**
 * Convert token amount to Wei (18 decimals)
 */
export function tokenToWei(amount: number | string): bigint {
  return parseEther(amount.toString());
}

/**
 * Truncate wallet address for display
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Legacy function names for backward compatibility (now removed - use formatToken and tokenToWei directly)
