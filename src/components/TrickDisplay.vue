<script setup>
import Card from './Card.vue';
import { useGameStore } from '@/stores/gameStore';
import { computed } from 'vue';

const game = useGameStore();

const cardPositions = computed(() => {
  return game.currentTrick.cards.map(({ playerId, card }) => ({
    card,
    position: getPosition(playerId),
    playerId,
    isWinner: game.currentTrick.winnerId === playerId
  }));
});

function getPosition(playerId) {
  const positions = { 1: 'south', 2: 'west', 3: 'north', 4: 'east' };
  return positions[playerId];
}
</script>

<template>
  <div class="trick-display">
    <div
      v-for="pos in cardPositions"
      :key="pos.card.id"
      :class="['card-position', pos.position, { winner: pos.isWinner }]"
    >
      <Card :suit="pos.card.suit" :rank="pos.card.rank" />
      <div class="player-label">{{ pos.position.toUpperCase() }}</div>
    </div>
  </div>
</template>

<style scoped>
.trick-display {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 2rem auto;
  background-color: #2d5016;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.card-position {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.card-position.north {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.card-position.south {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.card-position.east {
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.card-position.west {
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.winner {
  outline: 3px solid gold;
  border-radius: 5px;
}

.player-label {
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
