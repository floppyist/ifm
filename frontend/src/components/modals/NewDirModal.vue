<script setup>
import { ref } from 'vue';
import { useFilesStore } from '@/stores/FilesStore.js';

const filesStore = useFilesStore();

const modal = ref(null);
const input = ref(null);

const dirname = ref('');

function open() {
    window.addEventListener('keydown', handleKey);

    modal.value.show();
    input.value.focus();
}

function close() {
    window.removeEventListener('keydown', handleKey);

    dirname.value = '';

    modal.value.close();
    modal.value.blur();
}

function handleKey(e) {
    if (e.key === 'Escape') {
        close();
    }
}

defineExpose({ open, close });
</script>

<template>
    <!-- Modal -->
    <dialog ref="modal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-slate-700 text-slate-300 rounded-lg shadow-lg w-[400px] z-1">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">
                Create New Directory
            </h2>
            <button @click="close()" class="hover:text-red-500 text-xl bg-slate-600 rounded-lg px-2 cursor-pointer">&times;</button>
        </div>

        <!-- Body -->
        <div class="flex flex-col py-5">
            <input 
                ref="input"
                v-model="dirname" 
                @keydown.enter="filesStore.createDir(dirname), close()"
                class="w-full focus:outline-none rounded-sm bg-slate-600 pl-2" type="text" placeholder="Dirname"
                tabindex="0"
            />
            <p class="px-2 text-xs">{{ 'Path: /' + filesStore.currentPath }}</p>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 justify-end text-white text-lg">
            <button 
                @click="filesStore.createDir(dirname), close()"
                class="px-1 rounded-sm border-2 border-green-500 hover:bg-green-500 cursor-pointer"
                tabindex="1">
                <p>
                    Create
                </p>
            </button>
            <button 
                @click="close()"
                class="px-1 rounded-sm border-2 border-red-500 hover:bg-red-500 cursor-pointer"
                tabindex="2">
                <p>
                    Cancel
                </p>
            </button>
        </div>
    </dialog>
</template>
