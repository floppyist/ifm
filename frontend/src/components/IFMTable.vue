<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';

import ItemContextMenu from '@/components/ItemContextMenu.vue';

/* Icons */
import {
    DocumentIcon,
    FolderIcon,
    ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';

import {
    CloudArrowDownIcon,
    ChevronDoubleUpIcon,
    EllipsisHorizontalIcon,
} from '@heroicons/vue/24/solid';

/* Stores */
const filesStore = useFilesStore();

/* Used to determine the correct icon to display */
const downloadIcons = {
    dir: CloudArrowDownIcon,
    file:  ArrowDownTrayIcon,
};

const scrollContainer = ref(null);

/* Fixed height for table rows to calculate total table height correctly */
const itemHeight = 50;
const buffer = 20;
const scrollTop = ref(0);
const containerHeight = ref(0);

let ascending = true;

/* Dummy folder to handle upward path navigation */
const dblDotFolder = reactive({
    name: '..', 
    type: 'dir', 
});

onMounted(() => {
    /* Fetch all files from backend in root directory at first */
    filesStore.getFiles();

    containerHeight.value = scrollContainer.value.clientHeight;
})

/* Virtual scrolling */
function onScroll() {
    /* Using RequestAnimationFrame to update frame by frame */
    requestAnimationFrame(() => {
        scrollTop.value = scrollContainer.value.scrollTop;
    });
}

/* Calculation of indices to obtain the range of rows to be rendered */
const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight) - buffer);
const endIndex = computed(() => Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + buffer);

/* Get a slice of the lines to be rendered instead of rendering everything at once */
const visibleFiles = computed(() => {
    const start = Math.max(0, startIndex.value);
    const end = Math.min(filesStore.filteredFiles.length, endIndex.value);

    return filesStore.filteredFiles.slice(start, end);
});

/* 
 * The spacers ensure that when scrolling all the way to the top or bottom, the entire table is 
 * accounted for, not just the rows that are currently rendered (e.g. vim controls)
 */
const topSpacer = computed(() => Math.max(0, startIndex.value) * itemHeight);
const bottomSpacer = computed(() => Math.max(0, filesStore.filteredFiles.length - endIndex.value) * itemHeight);


/*
 * Context menu stuff
 */
const showItemContextMenu = ref(false);
const itemContextMenuX = ref(0);
const itemContextMenuY = ref(0);
const itemContextMenuFile = ref(null);

/* 
 * General navigation handling
 *
 * changePath directly triggers the retrieval of the new data from the backend in the new directory
 */
async function handleFileNavigation(file) {
    if (filesStore.isRecursiveSearch) {
        filesStore.changePath(file.path === '.' ? '' : file.path);
        filesStore.isRecursiveSearch = false;

        return;
    }

    switch (file.type) {
        case 'dir':
            if (file.name === '..') {
                /* Cut path with "/" into slices and remove the last one => upward navigation */
                filesStore.changePath(filesStore.currentPath.substring(0, filesStore.currentPath.lastIndexOf('/')));
            } else {
                if (filesStore.currentPath === '') {
                    /* If in root dir, then just take dirname as next path */
                    filesStore.changePath(file.name);
                } else {
                    /* Extend path if not in root dir */
                    filesStore.changePath(filesStore.currentPath + '/' + file.name);
                }

                /* Disable recursive search to handle file navigation properly */
                filesStore.isRecursiveSearch = false;
            }

            /* Always scroll top if new directory is loaded and rendered */
            if (scrollContainer.value) scrollContainer.value.scrollTop = 0;
            break;
        case 'file':
            /* Opens file directly */
            window.location.href = hrefEncode(filesStore.currentPath + "/" + file.name);
            break;
        default: 
            break;
    }
}

/* Allows the individual selection of multiple files */
function toggleFileSelection(file, event) {
    if (event.ctrlKey || event.type === 'dblclick') {
        if (filesStore.selectedFiles.has(file.name)) {
            filesStore.selectedFiles.delete(file.name);
        } else {
            filesStore.selectedFiles.set(file.name, reactive(file));
        }
    }
}

function getDownloadIcon(type) {
    return downloadIcons[type] || DocumentIcon;
}

function sortBy(key) {
    ascending = !ascending;

    filesStore.sorting.key = key;
    filesStore.sorting.ascending = ascending;
}

function onFileDrop(file) {
    file.isDragOver = false;

    if (file.type !== 'dir') {
        return null;
    }

    if (filesStore.selectedFiles.has(file.name)) {
        if (filesStore.selectedFiles.size > 1) {
            /* Prevents a folder from being moved within itself */
            filesStore.selectedFiles.delete(file.name);
        } else {
            return null;
        }
    }

    filesStore.moveCopyFile(file.name, 'move');
}

function onFileDragEnter(file) {
    file.isDragOver = true;
}

function onFileDragLeave(file, event) {
    /* Prevents the isDragOver flag from being set when hovering over child element */
    if (!event.currentTarget.contains(event.relatedTarget)) {
        file.isDragOver = false;
    }
}

function onFileDragStart(file) {
    filesStore.selectedFiles.set(file.name, file);
}

function toggleItemContextMenu(file, event) {
    if (!filesStore.isRecursiveSearch) {
        itemContextMenuX.value = event.clientX;
        itemContextMenuY.value = event.clientY;
        itemContextMenuFile.value = file;
        showItemContextMenu.value = !showItemContextMenu.value;
    }
}

/*
 * Taken from ifm.js to encode filenames properly
 */
function hrefEncode(link) {
    return link
        .replace( /%/g, '%25' )
        .replace( /;/g, '%3B' )
        .replace( /\?/g, '%3F' )
        .replace( /:/g, '%3A' )
        .replace( /@/g, '%40' )
        .replace( /&/g, '%26' )
        .replace( /=/g, '%3D' )
        .replace( /\+/g, '%2B' )
        .replace( /\$/g, '%24' )
        .replace( /,/g, '%2C' )
        .replace( /</g, '%3C' )
        .replace( />/g, '%3E' )
        .replace( /#/g, '%23' )
        .replace( /"/g, '%22' )
        .replace( /{/g, '%7B' )
        .replace( /}/g, '%7D' )
        .replace( /\|/g, '%7C' )
        .replace( /\^/g, '%5E' )
        .replace( /\[/g, '%5B' )
        .replace( /\]/g, '%5D' )
        .replace( /\\/g, '%5C' )
        .replace( /`/g, '%60' )
}

watch(() => filesStore.search, () => {
    /* NOTE: A bit hacky, but prevents longer filtering of elements (search) if the user has previously scrolled to the end */
    if (scrollContainer.value) scrollContainer.value.scrollTop = 0;
})
</script>

<template>
    <div class="h-full flex flex-col bg-slate-200 max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex border-b border-gray-300 bg-slate-300 text-gray-700 h-[50px] items-center text-xl">
            <div class="w-10"></div>
            <div class="flex-1">
                <p @click="sortBy('name')" class="w-max cursor-pointer select-none">
                    Filename
                </p>
            </div>
            <div class="w-10"></div>
            <div class="w-24">
                <p @click="sortBy('size_raw')" class="w-max cursor-pointer select-none">
                    Size
                </p>
            </div>
            <div class="w-32 justify-center hidden sm:flex">
                <p class="select-none">
                    Permissions
                </p>
            </div>
            <div class="w-24 justify-center hidden md:flex">
                <p @click="sortBy('owner')" class="w-max cursor-pointer select-none">
                    Owner
                </p>
            </div>
            <div class="w-24 justify-center hidden lg:flex">
                <p @click="sortBy('group')" class="w-max cursor-pointer select-none">
                    Group
                </p>
            </div>
        </div>

        <!-- Body -->
        <div v-show="!filesStore.isLoading" 
            ref="scrollContainer"
            id="scrollContainer"
            class="flex-1 overflow-auto relative scrollbar-hide" 
            @scroll="onScroll">

            <!-- Top spacer -->
            <div :style="{ height: topSpacer + 'px' }"></div>

            <!-- Static dot folder -->
            <div v-show="filesStore.currentPath !== ''"
                class="sticky top-0 flex border-b border-gray-300 h-[50px] items-center hover:bg-blue-300"
                :class="[dblDotFolder.isDragOver ? 'bg-green-200' : 'bg-slate-200']"
                @dragover.prevent
                @dragenter="onFileDragEnter(dblDotFolder)"
                @dragleave="onFileDragLeave(dblDotFolder, $event)"
                @drop="onFileDrop(dblDotFolder)">

                <!-- File icon -->
                <div class="w-10 flex justify-center">
                    <ChevronDoubleUpIcon class="size-5 text-[#337ab7]" />
                </div>

                <!-- Filename -->
                <div class="flex flex-1 items-center h-full min-w-[75px] truncate select-none">
                    <span
                        @click.stop="handleFileNavigation(dblDotFolder)" 
                        class="truncate text-[#337ab7] cursor-pointer hover:underline select-text">
                        <p>
                            {{ '[up]' }}
                        </p>
                    </span>
                </div>

                <!-- Download button -->
                <div class="flex w-10 justify-center">
                    <CloudArrowDownIcon 
                        v-if="filesStore.currentPath !== ''"
                        @click="filesStore.downloadFile(dblDotFolder)"
                        class="size-5 text-[#337ab7] cursor-pointer" 
                    />
                </div>

                <!-- File size -->
                <div class="w-24 text-left truncate"></div>

                <!-- File permissions -->
                <div class="w-32 hidden sm:flex"></div>

                <!-- File owner -->
                <div class="w-24 hidden md:flex"></div>

                <!-- File group -->
                <div class="w-24 hidden lg:flex"></div>
            </div>

            <!-- Data -->
            <div v-if="visibleFiles.length === 0" class="relative w-full h-full flex items-center justify-center">
                <svg class="absolute inset-0 w-full h-full">
                    <defs>
                        <pattern id="slash" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="20" stroke="black" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#slash)" />
                </svg>

                <p class="relative z-2 text-2xl font-bold bg-slate-200 px-4 py-2">
                    {{ 'no results' }}
                </p>
            </div>
            <div v-else v-for="file in visibleFiles" :key="file.name" 
                class="flex border-b border-gray-300 h-[50px] items-center hover:bg-blue-300"
                :draggable="filesStore.isRecursiveSearch ? false : true"
                :class="{ 'bg-blue-200': filesStore.selectedFiles.has(file.name), 'bg-green-200' : file.isDragOver && file.type === 'dir' }"
                :style="{ top: itemHeight + 'px' }"
                @click="toggleFileSelection(file, $event)"
                @dblclick="toggleFileSelection(file, $event)"
                @dragover.prevent
                @dragenter="onFileDragEnter(file)"
                @dragleave="onFileDragLeave(file, $event)"
                @dragstart="onFileDragStart(file)"
                @drop="onFileDrop(file)"
                @contextmenu.prevent="toggleItemContextMenu(file, $event)">

                <!-- File icon -->
                <div class="w-10 flex justify-center">
                    <DocumentIcon v-if="file.type === 'file'" class="size-5 text-[#337ab7]" />
                    <FolderIcon v-if="file.type === 'dir' && file.name !== '..'" class="size-5 text-[#337ab7]" />
                </div>

                <!-- Filename -->
                <div class="flex flex-1 justify-between items-center h-full min-w-[75px] truncate select-none">
                    <p @click.stop="handleFileNavigation(file)" class="items-center truncate text-[#337ab7] cursor-pointer hover:underline select-text">
                        {{ file.name }}
                    </p>
                    <p v-if="filesStore.isRecursiveSearch && file.path !== '.'" class="text-sm text-gray-500">
                        {{ file.path }}
                    </p>
                </div>

                <!-- Download button -->
                <div class="flex w-10 justify-center">
                    <component :is="getDownloadIcon(file.type)"
                        @click="filesStore.downloadFile(file)"
                        class="size-5 text-[#337ab7] cursor-pointer" 
                    />
                </div>

                <!-- File size -->
                <div class="w-24 text-left truncate">{{ file.size }}</div>

                <!-- File permissions -->
                <div class="w-32 justify-center truncate hidden sm:flex">{{ file.fileperms }}</div>

                <!-- File owner -->
                <div class="w-24 justify-center truncate hidden md:flex">{{ file.owner }}</div>

                <!-- File group -->
                <div class="w-24 justify-center truncate hidden lg:flex">{{ file.group }}</div>
            </div>

            <!-- Bottom spacer -->
            <div :style="{ height: bottomSpacer + 'px' }"></div>

            <ItemContextMenu 
                v-if="showItemContextMenu"
                :x="itemContextMenuX"
                :y="itemContextMenuY"
                :file="itemContextMenuFile"
                @close="showItemContextMenu = false"
            />
        </div>
    </div>

    <!-- Spinner -->
    <div
        v-show="filesStore.isLoading"
        class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-12 h-12 border-4 border-[#337ab7] border-dashed rounded-full animate-spin"></div>
    </div>
</template>
