import { ref, computed } from 'vue';

import { defineStore } from 'pinia';

import axios from 'axios';

export const useFilesStore = defineStore('files', () => {
    const filesData = ref([]);
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

    const setSearch = (query) => {
        search.value = query;
    };

    const filteredFilesData = computed(() => {
        return filesData.value.filter(f => f.name.includes(search.value));
    });

    return {
        filesData,
        filteredFilesData,
        search,
        isLoading,
        getFiles,
        setSearch,
        createDir,
    };
});

