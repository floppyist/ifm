<script setup>
import { useFilesStore } from '@/stores/FilesStore.js';
import { useI18nStore } from '@/stores/I18nStore.js';

import Navbar from '@/components/Navbar.vue';
import IFMTable from '@/components/IFMTable.vue';

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
    <main class="flex flex-col h-screen bg-slate-300">
        <Navbar></Navbar>

        <div class="flex-auto overflow-y-auto overflow-x-hidden">
            <IFMTable></IFMTable>
        </div>
    </main>
</template>

<style scoped></style>
