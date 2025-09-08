import { reactive, ref, computed } from 'vue';

import { defineStore } from 'pinia';

import axios from 'axios';

export const useFilesStore = defineStore('files', () => {
    // --- State ---
    const files = ref([]);
    const selectedFiles = ref(new Set());
    const currentPath = ref('');
    const search = ref('');
    const isLoading = ref(false);

    // --- Getters ---
    const filteredFiles = computed(() => {
        return files.value.filter(f => f.name.toLowerCase().includes(search.value));
    })

    // --- Actions ---
    async function getFiles(dir = '') {
        isLoading.value = true;

        const params = new URLSearchParams();
        params.append('api', 'getFiles');
        params.append('dir', dir);

        try {
            const res = await axios.post(window.location.href, params);

            files.value = res.data.map(f => reactive(f));
            currentPath.value = dir;
        } catch (err) {
            console.log(err);
        } finally {
            isLoading.value = false;
        }
    };

    async function changePath(dir) {
        currentPath.value = dir;
        await getFiles(dir);
    };

    function setSearch(query) {
        search.value = query;
    };

    async function createDir(dirname) {
        const params = new URLSearchParams();
        params.append('api', 'createDir');
        params.append('dir', currentPath.value);
        params.append('dirname', dirname);

        try {
            const res = await axios.post(window.location.href, params);

            if (res.data.status === 'OK') {
                files.value.push(res.data.fileData);
            } else {
                console.warn(res.data.message);
            }
        } catch (err) {
            console.log(err);
        }
    };

    async function downloadFile(files) {
        let params = {};

        if (files.type === 'file') params = { api: 'download', dir: currentPath.value, filename: files.name };
        if (files.type === 'dir') params = { api: 'zipnload', dir: currentPath.value, filename: files.name };

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.location.href;
        form.style.display = 'none';

        for (const key in params) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];

            form.appendChild(input);
        }

        document.body.appendChild(form);

        form.submit();
        form.remove();
    }

    async function getFileContent(file) {
        const params = new URLSearchParams();
        params.append('api', 'getContent');
        params.append('dir', currentPath.value);
        params.append('filename', file.name);

        try {
            const res = await axios.post(window.location.href, params);

            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    return {
        // State
        files,
        selectedFiles,
        currentPath,
        search,
        isLoading,
        // Getters
        filteredFiles,
        // Actions
        getFiles,
        changePath,
        setSearch,
        createDir,
        downloadFile,
        getFileContent,
    };
});

