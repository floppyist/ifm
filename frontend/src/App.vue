<script setup>
import { useFilesStore } from '@/stores/FilesStore.js';

const store = useFilesStore();

if (!store.filesData) {
    store.getFiles();
}
</script>

<template>
    <pre>{{ store.filesData }}</pre>
</template>

<style scoped></style>
