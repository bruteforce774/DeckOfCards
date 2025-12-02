<script setup>
import { onMounted } from 'vue';
import Card from './components/Card.vue';
import { useGameStore } from './stores/gameStore';

const game = useGameStore();

onMounted(() => {
  game.initializeDeck();
});
</script>

<template>
  <div class="app">
    <div class="controls">
      <button @click="game.initializeDeck()">New Deck</button>
      <button @click="game.dealCard('player1')">Deal to Player 1</button>
      <button @click="game.dealCard('player2')">Deal to Player 2</button>
      <button @click="game.reset()">Reset</button>
      <p>Cards in deck: {{ game.cardsInDeck }}</p>
    </div>

    <div class="players">
      <div class="player">
        <h2>Player 1 ({{ game.players.player1.length }} cards)</h2>
        <div class="hand">
          <Card
            v-for="card in game.players.player1"
            :key="card.id"
            :rank="card.rank"
            :suit="card.suit"
          />
        </div>
      </div>

      <div class="player">
        <h2>Player 2 ({{ game.players.player2.length }} cards)</h2>
        <div class="hand">
          <Card
            v-for="card in game.players.player2"
            :key="card.id"
            :rank="card.rank"
            :suit="card.suit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.app {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  margin-bottom: 30px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}

.controls button {
  margin-right: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
}

.controls button:hover {
  background: #45a049;
}

.controls p {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

.players {
  display: flex;
  gap: 40px;
}

.player {
  flex: 1;
}

.player h2 {
  margin-bottom: 15px;
}

.hand {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background: #e8f5e9;
  border-radius: 8px;
  min-height: 150px;
}
</style>
