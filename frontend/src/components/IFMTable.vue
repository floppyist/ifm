<script setup>
import { ref, onMounted, computed } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';

import {
    DocumentIcon,
    FolderIcon,
} from '@heroicons/vue/24/outline';

import {
    CloudArrowDownIcon,
    PencilSquareIcon,
    CodeBracketIcon,
    TrashIcon,
} from '@heroicons/vue/24/solid';

const filesStore = useFilesStore();

const container = ref(null);
const rowHeight = 40;
const buffer = 100;

const from = ref(0);
const to = ref(0);

onMounted(async () => {
    await filesStore.getFiles();

    updateRange();
});

function updateRange() {
    if (!container.value || !filesStore.filesData) return;

    const start = Math.max(0, Math.floor(container.value.scrollTop / rowHeight) - buffer * 2);
    const end = start + Math.ceil(container.value.clientHeight / rowHeight) + buffer * 2;

    from.value = start;
    to.value = end;
}

const topSpacer = computed(() => from.value * rowHeight);

const bottomSpacer = computed(() => {
    if (!filesStore.filesData) return 0;

    return Math.max(0, (filesStore.filteredFilesData.length - to.value) * rowHeight);
});

function handleFileNavigation(file) {
    switch (file.type) {
        case 'dir':
            if (file.name === '..') {
                filesStore.currentPath = filesStore.currentPath.substring(0, filesStore.currentPath.lastIndexOf('/'));
            } else {
                if (filesStore.currentPath === '') {
                    filesStore.currentPath = file.name;
                } else {
                    filesStore.currentPath += '/' + file.name;
                }
            }
        default: break;
    }
}
</script>

<template>
    <div v-show="filesStore.isLoading" class="flex items-center justify-center h-full">
        <div class="w-12 h-12 border-4 border-[#337ab7] border-dashed rounded-full animate-spin"></div>
    </div>

    <div ref="container" class="max-w-7xl mx-auto h-full overflow-auto scrollbar-hide" v-show="!filesStore.isLoading" @scroll="updateRange">
        <table class="table-auto w-full text-center">
            <thead class="h-10 sticky top-0 bg-slate-300">
                <tr>
                    <th class="w-10"></th>
                    <th class="text-left">Filename</th>
                    <th></th>
                    <th class="text-left">Size</th>
                    <th>Permissions</th>
                    <th>Owner</th>
                    <th>Group</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <!-- Top spacer for infinite scroll -->
                <tr style="height: 0" :style="{ height: topSpacer + 'px' }"></tr>

                <tr v-for="file in filesStore.filteredFilesData.slice(from, to)" :key="file.name" 
                    class="hover:bg-[#add8e6]" 
                    :style="{ height: rowHeight + 'px' }">
                    <td>
                        <div class="flex justify-center items-center">
                            <DocumentIcon v-if="file.type === 'file'" class="size-5 text-[#337ab7]" />
                            <FolderIcon v-if="file.type === 'dir' && file.name !== '..'" class="size-5 text-[#337ab7]" />
                        </div>
                    </td>
                    <td 
                        @click="handleFileNavigation(file)"
                        class="w-75 text-left text-[#337ab7] cursor-pointer hover:underline">
                        {{ file.name }}
                    </td>
                    <td>
                        <div class="flex justify-center items-center">
                            <CloudArrowDownIcon v-if="file.name !== '..'" class="size-4 text-[#337ab7] cursor-pointer" />
                        </div>
                    </td>
                    <td class="w-25 text-left">{{ file.size }}</td>
                    <td>{{ file.fileperms }}</td>
                    <td>{{ file.owner }}</td>
                    <td>{{ file.group }}</td>
                    <td>
                        <div v-if="file.name !== '..'" class="flex flex-wrap justify-center items-center gap-1">
                            <PencilSquareIcon class="size-4 cursor-pointer text-[#337ab7]" />
                            <CodeBracketIcon class="size-4 cursor-pointer text-[#337ab7]" />
                            <TrashIcon class="size-4 cursor-pointer text-[#337ab7]" />
                        </div>
                    </td>
                </tr>

                <!-- Bottom spacer for infinite scroll -->
                <tr style="height: 0" :style="{ height: bottomSpacer + 'px' }"></tr>
            </tbody>
        </table>
    </div>
</template>

