<script setup>
import { useFilesStore } from '@/stores/FilesStore.js';
import { useWorkerStore } from '@/stores/WorkerStore.js';

const filesStore = useFilesStore();
const workerStore = useWorkerStore();
</script>

<template>
    <div class="bg-slate-600 text-slate-200">
        <div class="flex justify-between items-center gap-3">
            <div class="flex items-center break-all gap-3 pl-3">
                <p>
                    {{ '/' + filesStore.currentPath }}
                </p>
            </div>

            <div 
                v-show="!filesStore.isLoading" 
                class="flex flex-wrap items-center gap-3 pr-3">
                <p>
                    {{ filesStore.selectedFiles.size + '/' + filesStore.filteredFiles.length + ' File(s) selected' }}
                </p>
            </div>
        </div>
        <div class="pl-3 text-xs">
            <p>
                {{ 'Running tasks: ' + workerStore.tasks.length }}
            </p>
        </div>
    </div>
</template>
