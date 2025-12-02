import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDeckLogic } from '@/composables/useDeckLogic';

export const useGameStore = defineStore('game', () => {
  const { createDeck, shuffleDeck } = useDeckLogic();

  // State
  const deck = ref([]);
  const players = ref({
    player1: [],
  });

  // Computed
  const cardsInDeck = computed(() => deck.value.length);

  // Actions
  function initializeDeck() {
    deck.value = shuffleDeck(createDeck());
  }

  function dealCard(playerName) {
    if (deck.value.length === 0) {
      console.warn('No cards left in deck!');
      return;
    }

    const card = deck.value.pop();
    if (players.value[playerName]) {
      players.value[playerName].push(card);
    }
  }

  function reset() {
    players.value.player1 = [];
    initializeDeck();
  }

  return {
    // State
    deck,
    players,
    // Computed
    cardsInDeck,
    // Actions
    initializeDeck,
    dealCard,
    reset
  };
});
