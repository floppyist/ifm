import { reactive, ref, computed, watch } from 'vue';

import { defineStore } from 'pinia';

import axios from 'axios';

export const useFilesStore = defineStore('files', () => {
    const state = reactive({
        files: [],
        filteredFiles: computed(() => {
            return state.files.filter(f => f.name.includes(search.value));
        }),
    });

    const currentPath = ref('');
    const search = ref('');
    const isLoading = ref(false);

    const getFiles = async (dir) => {
        isLoading.value = true;

        const params = new URLSearchParams();
        params.append('api', 'getFiles');
        params.append('dir', dir);

        try {
            const res = await axios.post(window.location.href, params);
            state.files = res.data;
        } catch (err) {
            console.log(err);
        }

        isLoading.value = false;
    };

    const createDir = async (dirname) => {
        const params = new URLSearchParams();
        params.append('api', 'createDir');
        params.append('dir', currentPath.value);
        params.append('dirname', dirname);

        try {
            const res = await axios.post(window.location.href, params);

            console.log(res);
            if (res.data.status === 'ERROR') {
                // TODO: Create store for messages like this
                console.log(res.data.message);
            } else {
                state.files.push(res.data.fileData);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const downloadFile = (file) => {
        const params = {
            api: 'download',
            dir: currentPath.value,
            filename: file.name,
        }

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

    const setSearch = (query) => {
        search.value = query;
    };

    watch(currentPath, (newPath) => {
        getFiles(newPath);
    });

    return {
        state,
        currentPath,
        search,
        isLoading,
        getFiles,
        setSearch,
        downloadFile,
    };
});

