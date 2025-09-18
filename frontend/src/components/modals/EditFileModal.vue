<script setup>
import { ref, nextTick, computed } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';
import { useModalsStore } from '@/stores/ModalsStore.js';

import ACEEditor from '@/components/ACEEditor.vue';

/* Stores */
const filesStore = useFilesStore();
const modalsStore = useModalsStore();

const modal = ref(null);
const input = ref(null);

const file = ref(null);
const newname = ref('');
const error = ref('');

/* Used to set visibility of the override button */
const overrideFlag = ref(false);

async function editFileAndClose(override) {
    if (filesStore.isLoading) {
        error.value = 'Wait until the table has loaded...'
        return;
    }

    try {
        await filesStore.editFile(file.value, newname.value, override);
        modalsStore.closeModal('editFile');
        error.value = '';
    } catch (err) {
        overrideFlag.value = true;
        error.value = err.message;
    }
}

/* Modal specific stuff */
async function open(data) {
    file.value = data;
    file.value.content = await filesStore.getFileContent(file.value);

    modal.value.show();
    nextTick(() => input.value.focus());
    isOpen.value = true;
}

function close() {
    newname.value = '';
    error.value = '';
    overrideFlag.value = false;
    modal.value.close();
    isOpen.value = false;
}

const isOpen = ref(false);

defineExpose({ open, close, isOpen });
</script>

<template>
    <!-- Modal -->
    <dialog @keydown.esc="modalsStore.closeModal('editFile') "ref="modal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-slate-700 text-slate-300 rounded-lg shadow-xl/30 w-[400px] z-1">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">
                Edit File
            </h2>
            <button @click="modalsStore.closeModal('editFile')" class="hover:text-red-500 text-xl bg-slate-600 rounded-lg px-2 cursor-pointer">&times;</button>
        </div>

        <!-- Body -->
        <div v-if="file" class="flex flex-col pt-3">
            <input 
                ref="input"
                v-model="newname" 
                @keydown.enter="editFileAndClose(false)"
                class="w-full focus:outline-none rounded-sm bg-slate-600 pl-2" 
                type="text" 
                :placeholder="file.name"
            />
            <p class="text-xs py-1">{{ 'Path: /' + filesStore.currentPath }}</p>
            <ACEEditor 
                v-model="file.content"
                :content="file.content"
                :filename="file.name"
                :newname="newname"
            />
            <div v-if="error !== ''" class="flex flex-wrap items-end w-full text-xs break-all text-red-500">{{ error }}</div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 justify-end text-white text-lg pt-3 border-t-1 border-slate-500">
            <button 
                @click="editFileAndClose(false)"
                class="px-1 rounded-sm bg-green-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                Save
            </button>
            <button 
                v-if="overrideFlag"
                @click="editFileAndClose(true)"
                class="px-1 rounded-sm bg-yellow-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                Override
            </button>
            <button 
                @click="modalsStore.closeModal('editFile')"
                class="px-1 rounded-sm bg-red-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                Cancel
            </button>
        </div>
    </dialog>
</template>
