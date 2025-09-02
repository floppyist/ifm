<script setup>
import { ref } from 'vue';

const test = ref("test");
</script>

<template>
    <input v-model="test">
    <p>{{ test }}</p>
</template>

<style scoped></style>
