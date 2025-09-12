<script setup>
import { ref, nextTick, computed } from 'vue';
import { useFilesStore } from '@/stores/FilesStore.js';
import { useModalsStore } from '@/stores/ModalsStore.js';

import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-min-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/theme-chrome';

const modeMap = {
    'json': 'json',
    'js': 'javascript',
}

const filesStore = useFilesStore();
const modalsStore = useModalsStore();

const modal = ref(null);
const input = ref(null);

const filename = ref('');
const content = ref('');
const error = ref('');

async function createFileAndClose() {
    if (filesStore.isLoading) {
        error.value = 'Wait until the table has loaded...'
        return;
    }

    try {
        await filesStore.createFile(filename.value, content.value);
        modalsStore.closeModal('newFile');
        error.value = '';
    } catch (err) {
        error.value = err.message;
    }
};

function getModeByExtension(filename) { 
    const ext = filename.split('.').pop(); 
    return modeMap[ext] || 'text'; 
};

const editorMode = computed(() => {
    return getModeByExtension(filename.value);
});

function open() {
    modal.value.show();
    nextTick(() => input.value.focus());
    isOpen.value = true;
};

function close() {
    filename.value = '';
    content.value = '';
    error.value = '';
    modal.value.close();
    isOpen.value = false;
};

const isOpen = ref(false);

defineExpose({ open, close, isOpen });
</script>

<template>
    <!-- Modal -->
    <dialog @keydown.esc="modalsStore.closeModal('newFile') "ref="modal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-slate-700 text-slate-300 rounded-lg shadow-xl/30 w-[400px] z-1">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">
                Create New File
            </h2>
            <button @click="modalsStore.closeModal('newFile')" class="hover:text-red-500 text-xl bg-slate-600 rounded-lg px-2 cursor-pointer">&times;</button>
        </div>

        <!-- Body -->
        <div class="flex flex-col pt-3">
            <input 
                ref="input"
                v-model="filename" 
                @keydown.enter="createFileAndClose"
                class="w-full focus:outline-none rounded-sm bg-slate-600 pl-2" 
                type="text" 
                placeholder="filename"
            />
            <p class="text-xs py-1">{{ 'Path: /' + filesStore.currentPath }}</p>
            <v-ace-editor
                v-model:value="content"
                :lang="editorMode"
                theme="chrome"
                style="height: 300px"
            />
            <p class="text-xs w-full truncate">{{ 'Mode: ' + editorMode }}</p>
            <div v-if="error !== ''" class="flex flex-wrap items-end w-full text-xs break-all text-red-500">{{ error }}</div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 justify-end text-white text-lg pt-3 border-t-1 border-slate-500">
            <button 
                @click="createFileAndClose"
                class="px-1 rounded-sm bg-green-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                Create
            </button>
            <button 
                @click="modalsStore.closeModal('newFile')"
                class="px-1 rounded-sm bg-red-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                Cancel
            </button>
        </div>
    </dialog>
</template>
