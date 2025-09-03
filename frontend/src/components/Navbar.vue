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
    <nav class="sticky bg-[#222222] text-slate-200">
        <div class="h-12 p-3 flex items-center gap-3">
            <div class="text-2xl font-bold">
                <p>IFM</p>
            </div>
            <input v-model="search" @input="updateSearch" class="bg-white text-[#222222] pl-1 focus:outline-none" placeholder="Search..">
            <div class="flex justify-end w-full items-center gap-3">
                <ArrowPathIcon class="size-5 cursor-pointer hover:text-[#337ab7]" />
                <ArrowDownTrayIcon class="size-5 cursor-pointer hover:text-[#337ab7]" />
                <DocumentPlusIcon class="size-5 cursor-pointer hover:text-[#337ab7]" />
                <FolderPlusIcon class="size-5 cursor-pointer hover:text-[#337ab7]" />
                <Bars3Icon class="size-5 cursor-pointer hover:text-[#337ab7]" />
            </div>
        </div>
    </nav>
</template>
