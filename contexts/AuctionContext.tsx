import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { Manager, Player, AuctionState } from '@/types/auction';
import Colors from '@/constants/colors';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface UserSession {
  role: UserRole;
  managerId?: string;
}

const STORAGE_KEY = 'auction_state';
const AUCTION_ROW_ID = 'main';
const PLAYER_BUCKET = 'player-images';

const initialState: AuctionState = {
  isSetupComplete: false,
  managers: [],
  players: [],
  currentPlayer: null,
  currentBid: 0,
  currentBidder: null,
  bidIncrement: 10,
  auctionStarted: false,
  auctionEnded: false,
};

async function persistLocal(state: AuctionState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('Error saving local auction state:', error);
  }
}

async function persistRemote(state: AuctionState) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.from('auction_state').upsert({
    id: AUCTION_ROW_ID,
    state,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.log('Error saving remote auction state:', error.message);
  }
}

async function uploadPlayerImage(uri: string, fileName?: string | null) {
  if (!isSupabaseConfigured || !supabase) return uri;

  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = (fileName || '').split('.').pop()?.toLowerCase() || 'jpg';
  const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExtension}`;

  const { error } = await supabase.storage
    .from(PLAYER_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || `image/${safeExtension === 'jpg' ? 'jpeg' : safeExtension}`,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(PLAYER_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const [AuctionProvider, useAuction] = createContextHook(() => {
  const [state, setState] = useState<AuctionState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    let cancelled = false;

    const loadState = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('auction_state')
            .select('state')
            .eq('id', AUCTION_ROW_ID)
            .maybeSingle();

          if (error) throw error;

          if (!cancelled && data?.state) {
            setState(data.state as AuctionState);
            await persistLocal(data.state as AuctionState);
          } else if (!cancelled) {
            await supabase.from('auction_state').upsert({
              id: AUCTION_ROW_ID,
              state: initialState,
              updated_at: new Date().toISOString(),
            });
          }

          channel = supabase
            .channel('auction-state-sync')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'auction_state',
                filter: `id=eq.${AUCTION_ROW_ID}`,
              },
              payload => {
                const remoteState = (payload.new as { state?: AuctionState } | null)?.state;
                if (remoteState) {
                  setState(remoteState);
                  void persistLocal(remoteState);
                }
              },
            )
            .subscribe();
        } else {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (!cancelled && stored) {
            setState(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.log('Error loading auction state:', error);

        // Local state remains a useful fallback if the network/backend is unavailable.
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (!cancelled && stored) setState(JSON.parse(stored));
        } catch (localError) {
          console.log('Error loading local fallback:', localError);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadState();

    return () => {
      cancelled = true;
      if (channel) void supabase?.removeChannel(channel);
    };
  }, []);

  const commitState = useCallback((newState: AuctionState) => {
    setState(newState);
    void persistLocal(newState);
    void persistRemote(newState);
  }, []);

  const updateState = useCallback((updates: Partial<AuctionState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      void persistLocal(newState);
      void persistRemote(newState);
      return newState;
    });
  }, []);

  // ---------------- AUTH / SESSION ----------------

  const loginAdmin = useCallback(() => setSession({ role: 'admin' }), []);
  const loginManager = useCallback((managerId: string) => setSession({ role: 'manager', managerId }), []);
  const loginViewer = useCallback(() => setSession({ role: 'viewer' }), []);
  const logout = useCallback(() => setSession(null), []);

// ---------------- MANAGERS ----------------

const setupManagers = useCallback(
  (managerNames: string[], budget: number) => {
    // Keep existing manager IDs when managers already exist so that
    // manager PINs remain attached to the same people. The Team
    // Management screen is the preferred way to edit the league.
    if (state.managers.length > 0 || state.auctionStarted || state.auctionEnded) {
      return;
    }

    const managers: Manager[] = managerNames.map((name, index) => ({
      id: `manager_${Date.now()}_${index}`,
      name,
      teamName: name,
      budget,
      initialBudget: budget,
      players: [],
      color:
        Colors.managerColors[
          index % Colors.managerColors.length
        ],
    }));

    updateState({
      managers,
      isSetupComplete: true,
      auctionStarted: false,
      auctionEnded: false,
    });
  },
  [state.managers.length, state.auctionStarted, state.auctionEnded, updateState],
);

const addManager = useCallback(
  (name: string, teamName: string, startingBudget: number) => {
    if (state.auctionStarted || state.auctionEnded) {
      return false;
    }

    if (state.managers.length >= 8) {
      return false;
    }

    const trimmedName = name.trim();
    const trimmedTeamName = teamName.trim();

    if (!trimmedName || !trimmedTeamName || startingBudget <= 0) {
      return false;
    }

    const newManager: Manager = {
      id: `manager_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: trimmedName,
      teamName: trimmedTeamName,
      budget: startingBudget,
      initialBudget: startingBudget,
      players: [],
      color:
        Colors.managerColors[
          state.managers.length % Colors.managerColors.length
        ],
    };

    updateState({
      managers: [...state.managers, newManager],
      isSetupComplete: true,
    });

    return true;
  },
  [
    state.auctionStarted,
    state.auctionEnded,
    state.managers,
    updateState,
  ],
);

const updateManager = useCallback(
  (
    managerId: string,
    updates: {
      name?: string;
      teamName?: string;
      startingBudget?: number;
    },
  ) => {
    if (state.auctionStarted || state.auctionEnded) {
      return false;
    }

    const manager = state.managers.find(
      m => m.id === managerId,
    );

    if (!manager) {
      return false;
    }

    const updatedManagers = state.managers.map(m => {
      if (m.id !== managerId) {
        return m;
      }

      const newName =
        updates.name !== undefined
          ? updates.name.trim()
          : m.name;

      const newTeamName =
        updates.teamName !== undefined
          ? updates.teamName.trim()
          : (m.teamName || m.name);

      const newBudget =
        updates.startingBudget !== undefined
          ? updates.startingBudget
          : m.initialBudget;

      return {
        ...m,
        name: newName || m.name,
        teamName: newTeamName || newName || m.name,
        budget: newBudget,
        initialBudget: newBudget,
      };
    });

    updateState({
      managers: updatedManagers,
    });

    return true;
  },
  [
    state.auctionStarted,
    state.auctionEnded,
    state.managers,
    updateState,
  ],
);

const removeManager = useCallback(
  (managerId: string) => {
    if (state.auctionStarted || state.auctionEnded) {
      return false;
    }

    const manager = state.managers.find(
      m => m.id === managerId,
    );

    if (!manager) {
      return false;
    }

    // Never remove a manager who already owns players.
    if (manager.players.length > 0) {
      return false;
    }

    updateState({
      managers: state.managers.filter(
        m => m.id !== managerId,
      ),
    });

    return true;
  },
  [
    state.auctionStarted,
    state.auctionEnded,
    state.managers,
    updateState,
  ],
);
  // ---------------- PLAYERS ----------------

  const addPlayer = useCallback(async (name: string, role: string, photo: string | null) => {
    let remotePhoto = photo;
    if (photo && isSupabaseConfigured) {
      remotePhoto = await uploadPlayerImage(photo);
    }

    const newPlayer: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      photo: remotePhoto,
      role,
      basePrice: 50,
      soldPrice: null,
      soldTo: null,
      status: 'available',
    };

    setState(prev => {
      const newState = { ...prev, players: [...prev.players, newPlayer] };
      void persistLocal(newState);
      void persistRemote(newState);
      return newState;
    });
  }, []);

  const addPlayers = useCallback(async (
    playerInputs: { name: string; photo: string; fileName?: string | null }[],
  ) => {
    if (playerInputs.length === 0) return;

    const timestamp = Date.now();
    const newPlayers: Player[] = [];

    const uploaded = await Promise.all(
      playerInputs.map((player, index) =>
        uploadPlayerImage(player.photo, player.fileName).then(remotePhoto => ({ player, index, remotePhoto })),
      ),
    );

    uploaded.forEach(({ player, index, remotePhoto }) => {
      newPlayers.push({
        id: `player_${timestamp}_${index}_${Math.random().toString(36).slice(2, 7)}`,
        name: player.name,
        photo: remotePhoto,
        role: 'Player',
        basePrice: 50,
        soldPrice: null,
        soldTo: null,
        status: 'available',
      });
    });

    setState(prev => {
      const newState = { ...prev, players: [...prev.players, ...newPlayers] };
      void persistLocal(newState);
      void persistRemote(newState);
      return newState;
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        players: prev.players.filter(p => !(p.id === playerId && p.status === 'available')),
      };
      void persistLocal(newState);
      void persistRemote(newState);
      return newState;
    });
  }, []);

  const removePlayers = useCallback((playerIds: string[]) => {
    if (playerIds.length === 0) return;
    const ids = new Set(playerIds);

    setState(prev => {
      const newState = {
        ...prev,
        players: prev.players.filter(p => !(ids.has(p.id) && p.status === 'available')),
      };
      void persistLocal(newState);
      void persistRemote(newState);
      return newState;
    });
  }, []);

  // ---------------- AUCTION ----------------

  const startAuction = useCallback(() => {
    const availablePlayers = state.players.filter(p => p.status === 'available');
    if (availablePlayers.length > 0) {
      const firstPlayer = availablePlayers[0];
      updateState({
        auctionStarted: true,
        auctionEnded: false,
        currentPlayer: firstPlayer,
        currentBid: firstPlayer.basePrice,
        currentBidder: null,
      });
    }
  }, [state.players, updateState]);

  const selectPlayerForAuction = useCallback((playerId: string) => {
    const player = state.players.find(p => p.id === playerId);
    if (player && player.status === 'available') {
      updateState({
        auctionStarted: true,
        auctionEnded: false,
        currentPlayer: player,
        currentBid: player.basePrice,
        currentBidder: null,
      });
    }
  }, [state.players, updateState]);

  const placeBid = useCallback((managerId: string) => {
    const manager = state.managers.find(m => m.id === managerId);
    if (!manager || !state.currentPlayer) return;

    const newBid = state.currentBidder
      ? state.currentBid + state.bidIncrement
      : state.currentBid;

    if (manager.budget >= newBid) {
      updateState({ currentBid: newBid, currentBidder: manager });
    }
  }, [state.managers, state.currentPlayer, state.currentBid, state.currentBidder, state.bidIncrement, updateState]);

  const increaseBid = useCallback((amount: number) => {
    if (state.currentBidder) {
      const newBid = state.currentBid + amount;
      if (state.currentBidder.budget >= newBid) updateState({ currentBid: newBid });
    }
  }, [state.currentBid, state.currentBidder, updateState]);

  const sellPlayer = useCallback(() => {
    if (!state.currentPlayer || !state.currentBidder) return;

    const updatedPlayers = state.players.map(p =>
      p.id === state.currentPlayer!.id
        ? { ...p, status: 'sold' as const, soldPrice: state.currentBid, soldTo: state.currentBidder!.id }
        : p,
    );

    const updatedManagers = state.managers.map(m =>
      m.id === state.currentBidder!.id
        ? {
            ...m,
            budget: m.budget - state.currentBid,
            players: [...m.players, { ...state.currentPlayer!, soldPrice: state.currentBid, soldTo: m.id, status: 'sold' as const }],
          }
        : m,
    );

    updateState({ players: updatedPlayers, managers: updatedManagers, currentPlayer: null, currentBid: 0, currentBidder: null });
  }, [state.currentPlayer, state.currentBidder, state.currentBid, state.players, state.managers, updateState]);

  const markUnsold = useCallback(() => {
    if (!state.currentPlayer) return;
    const updatedPlayers = state.players.map(p =>
      p.id === state.currentPlayer!.id ? { ...p, status: 'unsold' as const } : p,
    );
    updateState({ players: updatedPlayers, currentPlayer: null, currentBid: 0, currentBidder: null });
  }, [state.currentPlayer, state.players, updateState]);

  const endAuction = useCallback(() => {
    updateState({ auctionEnded: true, auctionStarted: false, currentPlayer: null, currentBid: 0, currentBidder: null });
  }, [updateState]);

  const resetAuction = useCallback(() => {
    commitState(initialState);
    setSession(null);
  }, [commitState]);

  const setBidIncrement = useCallback((increment: number) => updateState({ bidIncrement: increment }), [updateState]);
  const getAvailablePlayers = useCallback(() => state.players.filter(p => p.status === 'available'), [state.players]);
  const getSoldPlayers = useCallback(() => state.players.filter(p => p.status === 'sold'), [state.players]);
  const getUnsoldPlayers = useCallback(() => state.players.filter(p => p.status === 'unsold'), [state.players]);

  const reAuctionPlayer = useCallback((playerId: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        players: prev.players.map(p =>
          p.id === playerId && p.status === 'unsold'
            ? { ...p, status: 'available' as const, soldPrice: null, soldTo: null }
            : p,
        ),
      };
      void persistLocal(newState);
      void persistRemote(newState);
      return newState;
    });
  }, []);

  return {
  ...state,
  isLoading,
  session,
  loginAdmin,
  loginManager,
  loginViewer,
  logout,

  setupManagers,
  addManager,
  updateManager,
  removeManager,

  addPlayer,
  addPlayers,
  removePlayer,
  removePlayers,

  startAuction,
  selectPlayerForAuction,
  placeBid,
  increaseBid,
  sellPlayer,
  markUnsold,
  endAuction,
  resetAuction,
  setBidIncrement,
  getAvailablePlayers,
  getSoldPlayers,
  getUnsoldPlayers,
  reAuctionPlayer,
  };
});
