import { ref, reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import { useWorkerStore } from './WorkerStore';

import fileLoader from '@/workers/fileLoader.js?raw';
import contentLoader from '@/workers/contentLoader.js?raw';
import fileCreationWorker from '@/workers/fileCreationWorker.js?raw';
import fileEditWorker from '@/workers/fileEditWorker.js?raw';
import dirCreationWorker from '@/workers/dirCreationWorker.js?raw';
import downLoader from '@/workers/downLoader.js?raw';

export const useFilesStore = defineStore('files', () => {
    /* State */
    const files = ref(new Map());
    const selectedFiles = ref(new Set());
    const currentPath = ref('');
    const search = ref('');
    const isLoading = ref(false);

    const workerStore = useWorkerStore();

    /* Getters */
    const filteredFiles = computed(() => {
        return Array.from(files.value.values())
            .filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()));
    });

    /* Actions */
    async function getFiles(dir = '') {
        isLoading.value = true;

        const blob = new Blob([fileLoader], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                dir,
                url: window.location.href
            });

            const newMap = new Map();
            for (const f of res) {
                newMap.set(f.name, reactive(f));
            }

            files.value = newMap;
            selectedFiles.value = new Set();
            currentPath.value = dir;
        } catch (err) {
            console.error('Worker error:', err);
        } finally {
            isLoading.value = false;
        }
    }

    async function refresh() {
        await getFiles(currentPath.value);
    }

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
    }

    async function createFile(filename, content, override=false) {
        const blob = new Blob([fileCreationWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                dir: currentPath.value,
                filename,
                content,
                override,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                // Rebuild map to show new files at the top of the table
                files.value = new Map([[res.fileData.name, reactive(res.fileData)], ...files.value]);
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        }
    }

    async function editFile(filename, newname='', content, override=false) {
        const blob = new Blob([fileEditWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                dir: currentPath.value,
                filename,
                newname,
                content,
                override,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                const existing = files.value.get(filename);
                let rebuild = true;

                if (!existing) {
                    // New name isnt existing so just add
                    files.value.set(res.fileData.name, reactive(res.fileData));
                } else if (filename === res.fileData.name) {
                    // Copy all properties/fields from "existing" into the main files data map to prevent
                    // files that have not been renamed from moving up in order
                    Object.assign(existing, reactive(res.fileData));

                    rebuild = false;
                } else {
                    files.value.delete(filename);
                    files.value.set(res.fileData.name, reactive(res.fileData));
                }

                if (rebuild)
                    // Rebuild map to show renamed files at the top of the table
                    files.value = new Map([[res.fileData.name, reactive(res.fileData)], ...files.value]);
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        }
    }

    async function createDir(dirname) {
        const blob = new Blob([dirCreationWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, {
                dir: currentPath.value,
                dirname,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                // Rebuild map to show new directories at the top of the table
                files.value = new Map([[res.fileData.name, reactive(res.fileData)], ...files.value]);
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        }
    }

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
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(link.href);
            }
        } catch (err) {
            console.log('Worker error:', err);
        }
    }

    async function changePath(dir) {
        currentPath.value = dir;
        await getFiles(dir);
    }

    function setSearch(query) {
        search.value = query;
    }

    return {
        /* State */
        files,
        selectedFiles,
        currentPath,
        search,
        isLoading,
        /* Getters */
        filteredFiles,
        /* Actions */
        getFiles,
        refresh,
        getFileContent,
        createFile,
        editFile,
        createDir,
        downloadFile,
        changePath,
        setSearch,
    };
});

