<script setup>
import { ref } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';

import { 
    ArrowPathIcon, 
    ArrowDownTrayIcon, 
    DocumentPlusIcon,
    FolderPlusIcon,
    Bars3Icon,
} from '@heroicons/vue/24/outline';

const filesStore = useFilesStore();

const search = ref(filesStore.search);

function updateSearch() {
    filesStore.setSearch(search.value);
}
</script>

<template>
    <nav class="sticky bg-slate-700 text-slate-300">
        <div class="flex justify-between p-3 items-center gap-3">
            <div class="flex w-full items-center gap-3">
                <div @click="filesStore.getFiles()"
                    class="text-3xl font-semibold text-blue-200 bg-slate-600 rounded-lg px-3 cursor-pointer">
                    <p>IFM</p>
                </div>

                <input 
                    v-model="search" 
                    @input="updateSearch" 
                    class="w-full bg-slate-600 text-white text-semibold text-lg px-3 py-1 focus:outline-none rounded-lg" 
                    placeholder="Search..">
            </div>

            <div class="flex items-center gap-3 bg-slate-600 rounded-lg px-3 py-2">
                <ArrowPathIcon 
                    @click="filesStore.getFiles(filesStore.currentPath)" 
                    class="size-5 cursor-pointer hover:text-blue-200"
                    :class="{ 'opacity-50 animate-spin pointer-events-none': filesStore.isLoading }" />

                <ArrowDownTrayIcon class="size-5 cursor-pointer hover:text-blue-200" />
                <DocumentPlusIcon class="size-5 cursor-pointer hover:text-blue-200" />
                <FolderPlusIcon class="size-5 cursor-pointer hover:text-blue-200" />
                <Bars3Icon class="size-5 cursor-pointer hover:text-blue-200" />
            </div>
        </div>
    </nav>
</template>
