<script setup>
import { useFilesStore } from '@/stores/FilesStore.js';

const filesStore = useFilesStore();
</script>

<template>
    <div class="bg-slate-600 text-slate-200">
        <div class="flex justify-between items-center gap-3">
            <div class="flex items-center break-all gap-3 pl-3">
                {{ '/' + filesStore.currentPath }}
            </div>

            <div class="flex flex-wrap items-center gap-3 pr-3">
                <!-- -1: Dont count ".." folder -->
                {{ filesStore.selectedFiles.size + '/' + filesStore.filteredFiles.length + ' File(s) selected' }}
            </div>
        </div>
    </div>
</template>
