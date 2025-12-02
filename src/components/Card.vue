<script setup>
const props = defineProps({
  suit: String,
  rank: String,
  clickable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['card-click']);

function handleClick() {
  if (!props.disabled && props.clickable) {
    emit('card-click');
  }
}
</script>

<template>
  <div
    :class="[
      'card-wrapper',
      { clickable, disabled, selected }
    ]"
    @click="handleClick"
  >
    <img :src="`/svgs/${rank}_of_${suit}.svg`" :alt="`${rank} of ${suit}`" />
  </div>
</template>

<style scoped>
.card-wrapper {
  display: inline-block;
  transition: transform 0.2s, opacity 0.3s;
}

.card-wrapper img {
  width: 90px;
  height: auto;
  display: block;
}

.card-wrapper.clickable {
  cursor: pointer;
}

.card-wrapper.clickable:hover:not(.disabled) {
  transform: translateY(-8px);
}

.card-wrapper.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.card-wrapper.selected {
  transform: translateY(-12px);
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
}
</style>