import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useWorkerStore } from './WorkerStore';

import fileLoader from '@/workers/fileLoader.js?raw';
import contentLoader from '@/workers/contentLoader.js?raw';
import dirCreationWorker from '@/workers/dirCreationWorker.js?raw';

export const useFilesStore = defineStore('files', () => {
    // --- State ---
    const files = ref([]);
    const selectedFiles = ref(new Set());
    const currentPath = ref('');
    const search = ref('');
    const isLoading = ref(false);

    const workerStore = useWorkerStore();

    // --- Getters ---
    const filteredFiles = computed(() => {
        return files.value.filter(f => f.name.toLowerCase().includes(search.value));
    });

    // --- Actions ---
    async function getFiles(dir = '') {
        isLoading.value = true;

        const blob = new Blob([fileLoader], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, { 
                dir, 
                url: window.location.href 
            });

            files.value = res;
            currentPath.value = dir;
        } catch (err) {
            console.error('Worker error:', err);
        } finally {
            isLoading.value = false;
        }
    };

    async function getFileContent(file) {
        if (file.name === '..' || file.type === 'dir') return null;

        isLoading.value = true;

        const blob = new Blob([contentLoader], { type: 'application/javascript'} );
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                dir: currentPath.value,
                filename: file.name,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                return res.data.content;
            } else {
                console.warn(res.message);
            }
        } catch (err) {
            console.error('Worker error:', err);
        } finally {
            isLoading.value = false;
        }
    };

    async function createDir(dirname) {
        isLoading.value = true;

        const blob = new Blob([dirCreationWorker], { type: 'application/javascript'} );
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                dir: currentPath.value,
                dirname: dirname,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                files.value.unshift(res.fileData);
            } else {
                console.warn(res.message);
            }
        } catch (err) {
            console.log('Worker error:', err);
        } finally {
            isLoading.value = false;
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
    };

    async function changePath(dir) {
        currentPath.value = dir;

        await getFiles(dir);
    };

    function setSearch(query) {
        search.value = query;
    };

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
        getFileContent,
        createDir,
        downloadFile,
        changePath,
        setSearch,
    };
});

