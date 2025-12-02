<script setup>
import Card from './components/Card.vue';
import TrickDisplay from './components/TrickDisplay.vue';
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
  game.skipBidding('hearts');
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

function handleCardClick(card, playerId) {
  game.playCard(playerId, card.id);
}

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

// const playersWithAces = game.players
// .filter(player => (player.hand || []).some(card => card.rank === 'ace'))
// .map(player => player.name);
</script>


<template>
  <div class="bridge-game">
    <h1>Bridge Game</h1>

    <div v-if="game.gamePhase !== 'setup'">
      <p>Game Phase: {{ game.gamePhase }} | Current Player: {{ game.currentPlayer }} | Trump: {{ game.contract?.trump }}</p>
    </div>

    <TrickDisplay v-if="game.gamePhase === 'playing' || game.gamePhase === 'trickComplete'" />

    <div v-for="hand in groupedHands" :key="hand.playerId" class="player-hand">
      <h3>Player {{ hand.playerId }} ({{ game.players.find(p => p.id === hand.playerId)?.position }})</h3>
      <div class="cards-row">
        <template v-for="suit in suitOrder" :key="suit">
          <Card
            v-for="card in hand.suits[suit]"
            :key="card.id"
            :suit="card.suit"
            :rank="card.rank"
            :clickable="hand.playerId === game.currentPlayer && game.gamePhase === 'playing'"
            @card-click="handleCardClick(card, hand.playerId)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bridge-game {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.player-hand {
  margin-bottom: 2rem;
}

.cards-row {
  display: flex;
  gap: 0.3rem;
  flex-wrap: nowrap;
}

.cards-row .card-wrapper {
  flex-shrink: 0;
}

.cards-row .card-wrapper img {
  width: 70px;
}
</style>
