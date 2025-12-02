import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDeckLogic } from '@/composables/useDeckLogic';

export const useGameStore = defineStore('game', () => {
  const { createDeck, shuffleDeck } = useDeckLogic();

  // State
  const deck = ref([]);
  const players = ref([]);

  // Computed
  const cardsInDeck = computed(() => deck.value.length);
  const playerCount = computed(() => players.value.length);

  // Actions
  function initializeDeck() {
    deck.value = shuffleDeck(createDeck());
  }

  function setPlayerCount(count) {
    players.value = [];
    for (let i = 0; i < count; i++) {
      players.value.push({
        id: i + 1,
        hand: []
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

  return {
    // State
    deck,
    players,
    // Computed
    cardsInDeck,
    playerCount,
    // Actions
    initializeDeck,
    setPlayerCount,
    dealCard,
    dealToAll,
    dealHands,
    reset
  };
});
