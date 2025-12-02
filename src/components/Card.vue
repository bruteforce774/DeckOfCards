<script setup>
defineProps({
  suit: String,
  rank: String
});
</script>

<template>
    <img :src="`/svgs/${rank}_of_${suit}.svg`" :alt="`${rank} of ${suit}`" />
</template>

<style>
img {
  width: 90px;
  height: auto;
}
</style>