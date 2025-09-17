<script setup>
import { ref, nextTick } from 'vue';

import { useModalsStore } from '@/stores/ModalsStore.js';
import { useWorkerStore } from '@/stores/WorkerStore.js';

/* Icons */
import { 
    XCircleIcon, 
} from '@heroicons/vue/24/solid';

/* Stores */
const modalsStore = useModalsStore();
const workerStore = useWorkerStore();

const modal = ref(null);

const error = ref('');

function getStatusColor(task) {
    switch (task.status) {
        case 'PENDING': return 'bg-blue-400';
        case 'DONE': return 'bg-green-400';
        case 'ERROR': return 'bg-red-400';
        case 'ABORT': return 'bg-red-400';
        default: '';
    }
}

/* Modal specific stuff */
function open() {
    modal.value.show();
    nextTick(() => modal.value.focus());
    isOpen.value = true;
}

function close() {
    modal.value.close();
    isOpen.value = false;
}

const isOpen = ref(false);

defineExpose({ open, close, isOpen });
</script>

<template>
    <!-- Modal -->
    <dialog @keydown.esc="modalsStore.closeModal('tasks') "ref="modal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-slate-700 text-slate-300 rounded-lg shadow-xl/30 w-[400px] z-1 focus:outline-none">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">
                Task Manager
            </h2>
            <button @click="modalsStore.closeModal('tasks')" class="hover:text-red-500 text-xl bg-slate-600 rounded-lg px-2 cursor-pointer">&times;</button>
        </div>

        <!-- Body -->
        <div class="flex flex-col max-h-100 overflow-auto pt-3 break-all scrollbar-hide">
            <div v-for="task in workerStore.tasks.slice().reverse()" :key="task.id" class="py-2 text-xs text-slate-700">
                <div class="flex flex-col justify-between rounded-sm p-2"
                    :class="getStatusColor(task)">
                    <div class="flex justify-between font-bold">
                        {{ task.id }}
                        <XCircleIcon v-if="task.status === 'PENDING'" class="size-4"></XCircleIcon>
                    </div>
                    <div>{{ task.workerModuleURL }}</div>
                </div>
            </div>
            <div v-if="error !== ''" class="flex flex-wrap items-end w-full text-xs text-red-500">{{ error }}</div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 justify-end text-white text-lg pt-3 border-t-1 mt-2 border-slate-500">
            <button 
                @click="modalsStore.closeModal('tasks')"
                class="px-1 rounded-sm bg-red-500 hover:ring-2 hover:ring-yellow-400 cursor-pointer">
                Cancel
            </button>
        </div>
    </dialog>
</template>
