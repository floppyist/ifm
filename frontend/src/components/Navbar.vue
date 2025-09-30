<script setup>
import { ref } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';
import { useModalsStore } from '@/stores/ModalsStore.js';

/* Icons */
import { 
    ArrowPathIcon, 
    ArrowUpTrayIcon, 
    DocumentPlusIcon,
    FolderPlusIcon,
    Bars3Icon,
} from '@heroicons/vue/24/outline';

/* Stores */
const filesStore = useFilesStore();
const modalsStore = useModalsStore();

const search = ref(filesStore.search);

function onInput() {
    if (!search.value.startsWith('/')) {
        filesStore.isRecursiveSearch = false;
        filesStore.setSearch(search.value);
    }
}

function onEnter() {
    if (search.value.startsWith('/')) {
        filesStore.isRecursiveSearch = true;
        filesStore.searchFiles(search.value.replace('/', ''));
    }
}

function onExit() {
    document.getElementById('searchbar').blur();
}
</script>

<template>
    <nav class="sticky bg-slate-700 text-slate-300">
        <div class="flex justify-between p-3 items-center gap-3">
            <div class="flex w-full items-center gap-3">
                <div 
                    @click="filesStore.getFiles()"
                    class="text-3xl font-semibold bg-slate-600 rounded-lg px-3 cursor-pointer">
                    <p>
                        IFM
                    </p>
                </div>

                <input 
                    id="searchbar"
                    v-model="search" 
                    @input="onInput"
                    @keydown.enter="onEnter"
                    @keydown.escape="onExit"
                    class="w-full bg-slate-600 text-white text-semibold text-lg px-3 py-1 focus:outline-none rounded-lg" 
                    :class="{ 'ring-2 ring-red-400' : search.startsWith('/', '') }"
                    placeholder="Search..."
                />
            </div>

            <div class="flex items-center gap-3 bg-slate-600 rounded-lg px-3 py-2">
                <ArrowPathIcon 
                    @click="filesStore.refresh()"
                    class="size-5 cursor-pointer hover:text-blue-200"
                    :class="{ 'opacity-50 animate-spin pointer-events-none': filesStore.isLoading }" />

                <ArrowUpTrayIcon 
                    class="size-5 cursor-pointer hover:text-blue-200" 
                />

                <DocumentPlusIcon
                    @click="modalsStore.openModal('newFile')"
                    class="size-5 cursor-pointer hover:text-blue-200" 
                    :class="{ 'text-yellow-400' : modalsStore.modals.newFile?.isOpen }"
                />

                <FolderPlusIcon 
                    @click="modalsStore.openModal('newDir')"
                    class="size-5 cursor-pointer hover:text-blue-200" 
                    :class="{ 'text-yellow-400' : modalsStore.modals.newDir?.isOpen }"
                />

                <Bars3Icon 
                    @click="modalsStore.openModal('tasks')"
                    class="size-5 cursor-pointer hover:text-blue-200" 
                    :class="{ 'text-yellow-400': modalsStore.modals.tasks?.isOpen }"
                />
            </div>
        </div>
    </nav>
</template>
