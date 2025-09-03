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

onMounted(async () => {
    await filesStore.getFiles();
});

const filteredList = computed(() => {
    return filesStore.filesData.filter(f => f.name.includes(filesStore.search)) || [];
});
</script>

<template>
    <table class="w-full text-center">
        <thead class="h-10">
            <tr>
                <th></th>
                <th class="text-left">Filename</th>
                <th></th>
                <th class="text-left">Size</th>
                <th>Permissions</th>
                <th>Owner</th>
                <th>Group</th>
                <th></th>
            </tr>
        </thead>
        <tbody >
            <tr v-for="file in filteredList" :key="file.name" class="hover:bg-[#add8e6]">
                <td class="h-10">
                    <div class="flex justify-center items-center">
                        <DocumentIcon v-if="file.type === 'file'" class="size-5 text-[#337ab7]" />
                        <FolderIcon v-if="file.type === 'dir' && file.name !== '..'" class="size-5 text-[#337ab7]" />
                    </div>
                </td>
                <td class="text-left text-[#337ab7] cursor-pointer"> 
                    {{ file.name }}
                </td>
                <td>
                    <div class="flex justify-center items center">
                        <CloudArrowDownIcon v-if="file.name !== '..'" class="size-4 text-[#337ab7] cursor-pointer" />
                    </div>
                </td>
                <td class="text-left">{{ file.size }}</td>
                <td>{{ file.fileperms }}</td>
                <td>{{ file.owner }}</td>
                <td>{{ file.group }}</td>
                <td>
                    <div v-if="file.name !== '..'" class="flex justify-center items-center gap-1">
                        <PencilSquareIcon class="size-4 cursor-pointer text-[#337ab7]" />
                        <CodeBracketIcon class="size-4 cursor-pointer text-[#337ab7]" />
                        <TrashIcon class="size-4 cursor-pointer text-[#337ab7]" />
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>
