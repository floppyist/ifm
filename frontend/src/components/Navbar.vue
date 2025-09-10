<script setup>
import { ref, onMounted } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';

import NewDirModal from '@/components/modals/NewDirModal.vue';

import { 
    ArrowPathIcon, 
    ArrowUpTrayIcon, 
    DocumentPlusIcon,
    FolderPlusIcon,
    Bars3Icon,
} from '@heroicons/vue/24/outline';

const filesStore = useFilesStore();

const search = ref(filesStore.search);

const newDirModal = ref(null);
const isNewDirModalOpen = ref(false);

onMounted(() => 
    window.addEventListener('keydown', handleKey)
);

function handleKey(e) {
    switch (e.key) {
        case 'n':
            e.preventDefault();
            openModal(newDirModal.value);
            window.removeEventListener('keydown', handleKey);
            break;
    }
};

function openModal(modal) {
    isNewDirModalOpen.value = true;

    modal.open();
    window.removeEventListener('keydown', handleKey)
};

function closeModal(modal) {
    isNewDirModalOpen.value = false;

    modal.close();
    window.addEventListener('keydown', handleKey);
}
</script>

<template>
    <nav class="sticky bg-slate-700 text-slate-300">
        <div class="flex justify-between p-3 items-center gap-3">
            <div class="flex w-full items-center gap-3">
                <div 
                    @click="filesStore.getFiles()"
                    class="text-3xl font-semibold text-blue-200 bg-slate-600 rounded-lg px-3 cursor-pointer">
                    <p>
                        IFM
                    </p>
                </div>

                <input 
                    v-model="search" 
                    @input="filesStore.setSearch(search)" 
                    class="w-full bg-slate-600 text-white text-semibold text-lg px-3 py-1 focus:outline-none rounded-lg" 
                    placeholder="Search.."
                />
            </div>

            <div class="flex items-center gap-3 bg-slate-600 rounded-lg px-3 py-2">
                <ArrowPathIcon 
                    @click="filesStore.getFiles(filesStore.currentPath)" 
                    class="size-5 cursor-pointer hover:text-blue-200"
                    :class="{ 'opacity-50 animate-spin pointer-events-none': filesStore.isLoading }" />

                <ArrowUpTrayIcon 
                    class="size-5 cursor-pointer hover:text-blue-200" 
                />

                <DocumentPlusIcon 
                    class="size-5 cursor-pointer hover:text-blue-200" 
                />

                <FolderPlusIcon 
                    @click="openModal(newDirModal)" 
                    class="size-5 cursor-pointer hover:text-blue-200" 
                    :class="{ 'text-yellow-400' : isNewDirModalOpen }"
                />

                <Bars3Icon 
                    class="size-5 cursor-pointer hover:text-blue-200" 
                />
            </div>
        </div>
    </nav>

    <!-- Modals -->
    <NewDirModal ref="newDirModal" @close="closeModal(newDirModal)" /> 
</template>
