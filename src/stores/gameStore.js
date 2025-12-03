import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDeckLogic } from '@/composables/useDeckLogic';

export const useGameStore = defineStore('game', () => {
  const { createDeck, shuffleDeck } = useDeckLogic();

  // State
  const deck = ref([]);
  const players = ref([]);

  // Bridge game state
  const gamePhase = ref('setup');
  const currentTrick = ref({
    id: 1,
    cards: [],
    leadPlayerId: null,
    winnerId: null,
    leadSuit: null
  });
  const currentPlayer = ref(1);
  const contract = ref(null);
  const trickHistory = ref([]);

  // Computed
  const cardsInDeck = computed(() => deck.value.length);
  const playerCount = computed(() => players.value.length);

  // Actions
  function initializeDeck() {
    deck.value = shuffleDeck(createDeck());
  }

  function setPlayerCount(count) {
    const positions = ['south', 'west', 'north', 'east'];
    players.value = [];
    for (let i = 0; i < count; i++) {
      players.value.push({
        id: i + 1,
        hand: [],
        isHuman: i === 0,
        position: positions[i],
        tricksWon: 0
      });
    }
  }

  function dealCard(playerId) {
    if (deck.value.length === 0) {
      console.warn('No cards left in deck!');
      return null;
    }

    const player = players.value.find(p => p.id === playerId);
    if (!player) {
      console.warn(`Player ${playerId} not found!`);
      return null;
    }

    const card = deck.value.pop();
    player.hand.push(card);
    return card;
  }

  function dealToAll() {
    if (deck.value.length < players.value.length) {
      console.warn('Not enough cards to deal to all players!');
      return;
    }

    players.value.forEach(player => {
      if (deck.value.length > 0) {
        const card = deck.value.pop();
        player.hand.push(card);
      }
    });
  }

  function dealHands(cardsPerPlayer) {
    const totalCardsNeeded = cardsPerPlayer * players.value.length;
    if (deck.value.length < totalCardsNeeded) {
      console.warn(`Not enough cards! Need ${totalCardsNeeded}, have ${deck.value.length}`);
      return;
    }

    for (let i = 0; i < cardsPerPlayer; i++) {
      dealToAll();
    }
  }

  function reset() {
    players.value.forEach(player => {
      player.hand = [];
    });
    initializeDeck();
  }

  function skipBidding(trump = 'hearts') {
    contract.value = {
      level: 1,
      trump: trump,
      declarer: 1,
      target: 7
    };
    gamePhase.value = 'playing';
    currentPlayer.value = 1;
  }

  function playCard(playerId, cardId) {
    if (gamePhase.value !== 'playing') {
      console.warn('Cannot play card: game not in playing phase');
      return;
    }

    const player = players.value.find(p => p.id === playerId);
    if (!player) {
      console.warn(`Player ${playerId} not found!`);
      return;
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      console.warn(`Card ${cardId} not found in player ${playerId}'s hand!`);
      return;
    }

    // If starting a new trick and previous trick was complete, clear it
    if (currentTrick.value.cards.length === 4) {
      currentTrick.value = {
        id: currentTrick.value.id + 1,
        cards: [],
        leadPlayerId: null,
        winnerId: null,
        leadSuit: null
      };
    }

    const card = player.hand[cardIndex];
    player.hand.splice(cardIndex, 1);

    // Add card to current trick
    currentTrick.value.cards.push({ playerId, card });

    // Set lead player and suit if this is first card
    if (currentTrick.value.cards.length === 1) {
      currentTrick.value.leadPlayerId = playerId;
      currentTrick.value.leadSuit = card.suit;
      // Set current player to the one after the leader
      currentPlayer.value = (playerId % 4) + 1;
    } else if (currentTrick.value.cards.length < 4) {
      // Advance to next player (only if trick not complete)
      currentPlayer.value = (currentPlayer.value % 4) + 1;
    }
  }

  return {
    // State
    deck,
    players,
    gamePhase,
    currentTrick,
    currentPlayer,
    contract,
    trickHistory,
    // Computed
    cardsInDeck,
    playerCount,
    // Actions
    initializeDeck,
    setPlayerCount,
    dealCard,
    dealToAll,
    dealHands,
    reset,
    skipBidding,
    playCard
  };
});
