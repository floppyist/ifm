<script setup>
import { ref, nextTick } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';
import { useModalsStore } from '@/stores/ModalsStore.js';

import ACEEditor from '@/components/ACEEditor.vue';

/* Stores */
const filesStore = useFilesStore();
const modalsStore = useModalsStore();

const modal = ref(null);
const input = ref(null);

const filename = ref('');
const content = ref('');
const error = ref('');

/* Used to set visibility of the override button */
const overrideFlag = ref(false);
const fullscreenFlag = ref(false);

async function createFileAndClose(override) {
    if (filesStore.isLoading) {
        error.value = 'Wait until the table has loaded...'
        return;
    }

    try {
        await filesStore.createFile(filename.value, content.value, override);
        modalsStore.closeModal('newFile');
        error.value = '';
    } catch (err) {
        nextTick(() => input.value.focus());
        overrideFlag.value = true;
        error.value = err.message;
    }
}

/* Modal specific stuff */
function open() {
    modal.value.show();
    nextTick(() => input.value.focus());
    isOpen.value = true;
}

function close() {
    filename.value = '';
    content.value = '';
    error.value = '';
    overrideFlag.value = false;
    fullscreenFlag.value = false;
    modal.value.close();
    isOpen.value = false;
}

const isOpen = ref(false);

defineExpose({ open, close, isOpen });
</script>

<template>
    <!-- Modal -->
    <dialog 
        @keydown.esc="modalsStore.closeModal('newFile')"
        ref="modal" 
        :class="fullscreenFlag ? 'w-full h-full' : 'h-[70vh]'"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-slate-700 text-slate-300 rounded-lg shadow-xl/30 w-[400px] z-1">
        <div class="flex flex-col h-full">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold">
                    Create New File
                </h2>
                <div class="flex gap-1">
                    <button @click="fullscreenFlag = !fullscreenFlag" class="hover:text-red-500 text-xl bg-slate-600 rounded-lg px-2 cursor-pointer">
                        {{ fullscreenFlag ? '&minus;' : '&plus;'}}
                    </button>
                    <button @click="modalsStore.closeModal('newFile')" class="hover:text-red-500 text-xl bg-slate-600 rounded-lg px-2 cursor-pointer">&times;</button>
                </div>
            </div>

            <!-- Body -->
            <div class="flex flex-1 flex-col pt-3 min-h-[300px]">
                <div class="flex flex-row gap-2">
                    <input 
                        ref="input"
                        v-model="filename" 
                        @keydown.enter="createFileAndClose(false)"
                        @input="overrideFlag = false"
                        class="w-full focus:outline-none rounded-sm bg-slate-600 pl-2" 
                        :class="overrideFlag ? 'ring-2 ring-red-500' : ''"
                        type="text" 
                        placeholder="filename"
                    />
                    <button 
                        v-if="overrideFlag"
                        @click="createFileAndClose(true)"
                        class="px-1 rounded-sm bg-yellow-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                        Override
                    </button>
                </div>
                <p class="text-xs py-1">{{ 'Path: /' + filesStore.currentPath }}</p>
                <ACEEditor 
                    v-model="content"
                    :filename="filename"
                    class="flex-1"
                />
                <div v-if="error !== ''" class="flex flex-wrap items-end w-full text-xs break-all text-red-500">{{ error }}</div>
            </div>

            <!-- Footer -->
            <div class="flex gap-2 justify-end text-white text-lg pt-3 border-t-1 border-slate-500">
                <button 
                    @click="createFileAndClose(false)"
                    class="px-1 rounded-sm bg-green-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                    Create
                </button>
                <button 
                    @click="modalsStore.closeModal('newFile')"
                    class="px-1 rounded-sm bg-red-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                    Cancel
                </button>
            </div>
        </div>
    </dialog>
</template>
