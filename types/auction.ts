export interface Player {
  id: string;
  name: string;
  photo: string | null;
  role: string;
  basePrice: number;
  soldPrice: number | null;
  soldTo: string | null;
  status: 'unsold' | 'available' | 'sold';
}

export interface Manager {
  id: string;
  name: string;
  teamName: string;
  budget: number;
  initialBudget: number;
  players: Player[];
  color: string;
}

export interface AuctionState {
  isSetupComplete: boolean;
  managers: Manager[];
  players: Player[];
  currentPlayer: Player | null;
  currentBid: number;
  currentBidder: Manager | null;
  bidIncrement: number;
  auctionStarted: boolean;
  auctionEnded: boolean;
}

export interface Bid {
  managerId: string;
  amount: number;
  timestamp: number;
}