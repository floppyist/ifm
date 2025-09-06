import { ref, computed, watch } from 'vue';

import { defineStore } from 'pinia';

import axios from 'axios';

export const useFilesStore = defineStore('files', () => {
    const filesData = ref([]);
    const currentPath = ref("");
    const search = ref('');
    const isLoading = ref(false);

    const getFiles = async (dir) => {
        isLoading.value = true;

        const params = new URLSearchParams();
        params.append('api', 'getFiles');
        params.append('dir', dir);

        try {
            const res = await axios.post(window.location.href, params);
            filesData.value = res.data;
        } catch (err) {
            console.log(err);
        }

        isLoading.value = false;
    };

    const createDir = async (dir, dirname) => {
        const params = new URLSearchParams();
        params.append('api', 'createDir');
        params.append('dir', dir);
        params.append('dirname', dirname);

        try {
            await axios.post(window.location.href, params);
        } catch (err) {
            console.log(err);
        }
    };

    const downloadFile = async (file) => {
        const params = new URLSearchParams();
        params.append('api', 'download');
        params.append('dir', currentPath);
        params.append('filename', file.name);

        try {
            const res = await axios.post(window.location.href, params);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');

            link.href = url;
            link.download = file.name;
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.log(err);
        }
    }

    const setSearch = (query) => {
        search.value = query;
    };

    const filteredFilesData = computed(() => {
        return filesData.value.filter(f => f.name.includes(search.value));
    });

    watch(currentPath, (newPath) => {
        getFiles(newPath);
    });

    return {
        filesData,
        filteredFilesData,
        currentPath,
        search,
        isLoading,
        getFiles,
        setSearch,
        createDir,
        downloadFile,
    };
});

