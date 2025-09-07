<script setup>
import { ref, onMounted, computed, watch } from 'vue';
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
    ChevronDoubleUpIcon,
    EllipsisVerticalIcon,
} from '@heroicons/vue/24/solid';

const filesStore = useFilesStore();

const scrollContainer = ref(null);
const itemHeight = 50;
const buffer = 20;

const scrollTop = ref(0);
const containerHeight = ref(0);

onMounted(() => {
    filesStore.getFiles();

    containerHeight.value = scrollContainer.value.clientHeight;
});

function onScroll() {
    scrollTop.value = scrollContainer.value.scrollTop;
};

const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight) - buffer);
const endIndex = computed(() => Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + buffer);

const visibleFiles = computed(() => {
    const start = Math.max(0, startIndex.value);
    const end = Math.min(filesStore.filteredFiles.length, endIndex.value);

    return filesStore.filteredFiles.slice(start, end);
});

const topSpacer = computed(() => Math.max(0, startIndex.value) * itemHeight);
const bottomSpacer = computed(() => Math.max(0, filesStore.filteredFiles.length - endIndex.value) * itemHeight);

function handleFileNavigation(file) {
    switch (file.type) {
        case 'dir':
            if (file.name === '..') {
                filesStore.changePath(filesStore.currentPath.substring(0, filesStore.currentPath.lastIndexOf('/')));
            } else {
                if (filesStore.currentPath === '') {
                    filesStore.changePath(file.name);
                } else {
                    filesStore.changePath(filesStore.currentPath + '/' + file.name);
                }
            }
        default: break;
    }
};

watch(() => filesStore.search, () => {
    // NOTE: A bit hacky, but prevents longer filtering of elements (search) if the user has previously scrolled to the end
    if (scrollContainer.value) scrollContainer.value.scrollTop = 0;
});
</script>

<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="flex border-b border-gray-300 bg-gray-100 h-[50px] items-center px-2 font-semibold">
            <div class="w-8"></div>
            <div class="flex-1">Filename</div>
            <div class="w-8"></div>
            <div class="w-24 text-left">Size</div>
            <div class="w-32 text-center">Permissions</div>
            <div class="w-24 text-center">Owner</div>
            <div class="w-24 text-center">Group</div>
            <div class="w-8"></div>
        </div>

        <!-- Body -->
        <div v-show="!filesStore.isLoading" class="flex-1 overflow-auto relative scrollbar-hide" ref="scrollContainer" @scroll="onScroll">
            <!-- Top spacer -->
            <div :style="{ height: topSpacer + 'px' }"></div>

            <!-- Visible rows -->
            <div v-for="file in visibleFiles" :key="file.name" 
                class="flex border-b border-gray-200 h-[50px] items-center px-2 hover:bg-[#add8e6]">
                <div class="w-8 flex justify-center">
                    <DocumentIcon v-if="file.type === 'file'" class="size-5 text-[#337ab7]" />
                    <FolderIcon v-if="file.type === 'dir' && file.name !== '..'" class="size-5 text-[#337ab7]" />
                    <ChevronDoubleUpIcon v-if="file.name === '..'" class="size-5 text-[#337ab7]" />
                </div>
                <div class="flex-1">
                    <span
                        @click="handleFileNavigation(file)" 
                        class="truncate text-[#337ab7] cursor-pointer hover:underline">
                        {{ (file.name === '..' ? '[up]' : file.name )}}
                    </span>
                </div>
                <div class="w-10 flex justify-center">
                    <CloudArrowDownIcon 
                        @click="filesStore.downloadFile(file)"
                        v-if="file.name !== '..'" 
                        class="size-6 text-[#337ab7] cursor-pointer" />
                </div>
                <div class="w-24 text-left truncate">{{ file.size }}</div>
                <div class="w-32 text-center truncate">{{ file.fileperms }}</div>
                <div class="w-24 text-center truncate">{{ file.owner }}</div>
                <div class="w-24 text-center truncate">{{ file.group }}</div>
                <div class="w-8"> 
                    <EllipsisVerticalIcon class="size-6 cursor-pointer text-[#337ab7]" />
                </div>
            </div>

            <!-- Bottom spacer -->
            <div :style="{ height: bottomSpacer + 'px' }"></div>

        </div>
    </div>

    <!-- Spinner -->
    <div
        v-show="filesStore.isLoading"
        class="absolute inset-0 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-[#337ab7] border-dashed rounded-full animate-spin"></div>
    </div>
</template>
