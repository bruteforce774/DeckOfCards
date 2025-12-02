<script setup>
import Card from './components/Card.vue';
import { useGameStore } from './stores/gameStore';

const game = useGameStore();

onMounted(() => {
  game.initializeDeck();
});
</script>

<template>
  More to come...
</template>
