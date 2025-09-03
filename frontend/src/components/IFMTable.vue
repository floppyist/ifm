<script setup>
import { useFilesStore } from '@/stores/FilesStore.js';

const filesStore = useFilesStore();

if (!filesStore.clientData) {
    filesStore.getFiles();
}
</script>

<template>
    <table class="w-full">
        <thead class="bg-slate-600">
            <tr>
                <th>Filename</th>
                <th></th>
                <th>Size</th>
                <th>Permissions</th>
                <th>Owner</th>
                <th>Group</th>
            </tr>
        </thead>
        <tbody class="text-center">
            <tr v-for="file in filesStore.filesData" :key="file.name">
                <td>{{ file.name }}</td>
                <td>[DOWNLOAD_BUTTON]</td>
                <td>{{ file.size }}</td>
                <td>{{ file.fileperms }}</td>
                <td>{{ file.owner }}</td>
                <td>{{ file.group }}</td>
            </tr>
        </tbody>
    </table>
</template>
