<script setup>
import { useFilesStore } from '@/stores/FilesStore.js';
import { useI18nStore } from '@/stores/I18nStore.js';

const filesStore = useFilesStore();
const i18nStore = useI18nStore();

if (!filesStore.filesData) {
    filesStore.getFiles();
}

if (!i18nStore.i18nData) {
    i18nStore.getI18n();
}
</script>

<template>
    <div class="flex flex-row">
        <pre>{{ filesStore.filesData }}</pre>
        <pre>{{ i18nStore.i18nData }}</pre>
    </div>
</template>

<style scoped></style>
