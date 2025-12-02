<script setup>
import Card from './components/Card.vue';
import { useGameStore } from './stores/gameStore';
import { onMounted, computed, ref, watch } from 'vue';
import { useDeckLogic } from './composables/useDeckLogic';

const game = useGameStore();
const { ranks } = useDeckLogic();
const suitOrder = ['spades', 'hearts', 'clubs', 'diamonds'];


function sortByRankDesc(cards) {
  return [...cards].sort((a, b) => ranks.indexOf(b.rank) - ranks.indexOf(a.rank));
}

const selectedPlayers = ref([]);

onMounted(() => {
  game.initializeDeck();
  game.setPlayerCount(4);
  game.dealHands(13);
});

watch(
  () => game.players.length,
  (newLen) => {
    selectedPlayers.value = Array.from({ length: newLen }, (_, idx) => idx);
  },
  { immediate: true }
);

const groupedHands = computed(() => {
  const hands = [];

  for (const idx of selectedPlayers.value) {
    const player = game.players[idx];
    if (!player) continue;
    const suitsObj = {};

    for (const suit of suitOrder) {
      const cardsOfSuit = (player.hand || []).filter(card => card.suit === suit);
      const sortedCards = sortByRankDesc(cardsOfSuit);
      suitsObj[suit] = sortedCards;
    }

    hands.push({
      playerId: player.id,
      suits: suitsObj
    });
  }
  return hands;
});

// 1. Get all hearts from a hand
// 2. Get all face cards (jack, queen, king)
// 3. Sort cards by suit alphabetically
// 4. Count cards in each suit
// 5. Check if hand has any aces
// 6. Create array of player names from game.players

// const hearts = hand.filter(card => card.suit === 'hearts');

// const faceCards = hand.filter(card =>
//   ['jack', 'queen', 'king'].includes(card.rank)
// );

// const sorted = [...hand].sort((a, b) => suits.indexOf(a.suit) - suits.indexOf(b.suit));

// const counts = {};
// for (const card of hand) {
//   if (!counts[card.suit]) {
//     counts[card.suit] = 0;
//   }
//   counts[card.suit]++;
// }

// const hasAce = hand.some(card => card.rank === 'ace');

// const names = game.players.map(player => player.name);

// const allHearts = hand.every(card => card.suit === 'hearts');
</script>


<template>
  <div v-for="hand in groupedHands" :key="hand.playerId">
    <div v-for="suit in suitOrder" :key="suit">
      <div>
        <Card v-for="card in hand.suits[suit]" :key="card.id" :suit="card.suit" :rank="card.rank" />
      </div>
    </div>
    <hr />
  </div>
</template>
