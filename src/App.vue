<script setup>
import Card from './components/Card.vue';
import { useGameStore } from './stores/gameStore';
import { onMounted, computed } from 'vue';

const game = useGameStore();

onMounted(() => {
  game.initializeDeck();
  game.setPlayerCount(4);
  game.dealHands(13);
});

const hand = computed(() => game.players[0]?.hand || []);
</script>

<template>
  <Card v-for="card in hand" :key="card.id" :suit="card.suit" :rank="card.rank" />
</template>
