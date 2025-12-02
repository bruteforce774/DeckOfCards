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

