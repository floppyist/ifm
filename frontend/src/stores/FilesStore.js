import { ref, reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import { useWorkerStore } from './WorkerStore';

import fileLoader from '@/workers/fileLoader.js?raw';
import contentLoader from '@/workers/contentLoader.js?raw';
import dirCreationWorker from '@/workers/dirCreationWorker.js?raw';
import downLoader from '@/workers/downLoader.js?raw';

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

            files.value = res.map(f => reactive(f));

            selectedFiles.value = new Set();
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
        }
    };

    async function downloadFile(file) {
        const blob = new Blob([downLoader], { type: 'application/javascript'} );
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                api: file.type === 'file' ? 'download' : 'zipnload',
                dir: currentPath.value,
                filename: file.name,
                url: window.location.href,
            });

            if (res) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(res);
                link.download = file.type === 'file' ? file.name : file.name + '.zip';
                link.click();

                URL.revokeObjectURL(link.href);
            }
        } catch (err) {
            console.log('Worker error:', err);
        }
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

