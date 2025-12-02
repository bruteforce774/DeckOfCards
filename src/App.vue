<script setup>
import Card from './components/Card.vue';
import { useGameStore } from './stores/gameStore';
import { onMounted } from 'vue';

const game = useGameStore();

onMounted(() => {
  game.initializeDeck();
  game.setPlayerCount(4);
  game.dealHands(13);
});
</script>

<template>
  More to come...
</template>
