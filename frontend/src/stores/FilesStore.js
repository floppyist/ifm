import { ref, reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { useWorkerStore } from './WorkerStore';

/* Workers */
import fileLoader from '@/workers/fileLoader.js?raw';
import contentLoader from '@/workers/contentLoader.js?raw';
import fileCreationWorker from '@/workers/fileCreationWorker.js?raw';
import fileEditWorker from '@/workers/fileEditWorker.js?raw';
import fileCopyMoveWorker from '@/workers/fileCopyMoveWorker.js?raw';
import dirCreationWorker from '@/workers/dirCreationWorker.js?raw';
import downLoader from '@/workers/downLoader.js?raw';
import recursiveSearchWorker from '@/workers/recursiveSearchWorker.js?raw';

export const useFilesStore = defineStore('files', () => {
    /* State */
    const files = ref(new Map());
    const selectedFiles = ref(new Map());
    const recursiveSearchFiles = ref(new Map());
    const currentPath = ref('');

    const search = ref('');
    const sorting = ref({ key: 'name', ascending: true });

    const isLoading = ref(false);
    const isRecursiveSearch = ref(false);

    /* Used to add debounce for search */
    let searchTimeout;

    /* Stores */
    const workerStore = useWorkerStore();

    /* Getters */
    const filteredFiles = computed(() => {
        /* 
         * Treat map temporarily as array for filtering (search)
         * Switching between normal file view and recursive search results 
         */
        return Array.from(isRecursiveSearch.value ? recursiveSearchFiles.value.values() : files.value.values())
            .filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()))
            .sort((a, b) => {
                /* Sort directories first and put them always at the top */
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }

                const { key, ascending } = sorting.value;

                let result;

                if (key === 'size_raw') {
                    result = a[key] - b[key];
                } else if (typeof a[key] === 'string') {
                    result = a[key].localeCompare(b[key]);
                } else {
                    result = a[key] - b[key];
                }

                return ascending ? result : -result;
            });
    });

    /* Actions */
    async function getFiles(dir = '') {
        isLoading.value = true;

        const blob = new Blob([fileLoader], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, 'getFiles', {
                dir,
                url: window.location.href
            });

            /* Reset current map */
            const newMap = new Map();

            for (const f of res) {
                newMap.set(f.name, reactive(f));
            }

            files.value = newMap;
            selectedFiles.value = new Map();
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
            const res = await workerStore.executeTask(workerURL, 'getFileContent', {
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
            const res = await workerStore.executeTask(workerURL, 'createFile', {
                dir: currentPath.value,
                filename,
                content,
                override,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                files.value.set(res.fileData.name, reactive(res.fileData));
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        }
    }

    async function editFile(file, newname='', override=false) {
        const blob = new Blob([fileEditWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, 'editFile', {
                dir: currentPath.value,
                filename: file.name,
                content: file.content || '',
                newname,
                override,
                mime_type: file.mime_type || '',
                url: window.location.href,
            });

            if (res.status === 'OK') {
                files.value.delete(file.name);
                files.value.set(res.fileData.name, reactive(res.fileData));
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        }
    }

    async function moveCopyFile(destination, action) {
        isLoading.value = true;

        const blob = new Blob([fileCopyMoveWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, 'moveCopyFile', {
                dir: currentPath.value,
                files: [...selectedFiles.value.keys()],
                destination,
                action,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                /* Remove already moved files from main files array based on selectedFiles */
                for (const f of selectedFiles.value.keys()) {
                    files.value.delete(f);
                }

                selectedFiles.value = new Map();
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function searchFiles(pattern) {
        isLoading.value = true;

        const blob = new Blob([recursiveSearchWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, 'searchFiles', {
                dir: currentPath.value,
                pattern,
                url: window.location.href,
            });

            /* Reset current map */
            const newMap = new Map();

            for (const f of res) {
                newMap.set(f.name, reactive(f));
            }

            recursiveSearchFiles.value = newMap;
        } catch (err) {
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function createDir(dirname) {
        const blob = new Blob([dirCreationWorker], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, 'createDir', {
                dir: currentPath.value,
                dirname,
                url: window.location.href,
            });

            if (res.status === 'OK') {
                files.value.set(res.fileData.name, reactive(res.fileData));
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            throw err;
        }
    }

    async function downloadFile(file) {
        isLoading.value = true;

        const blob = new Blob([downLoader], { type: 'application/javascript'} );
        const workerURL = URL.createObjectURL(blob);

        try {
            const res = await workerStore.executeTask(workerURL, 'downloadFile', {
                api: file.type === 'file' ? 'download' : 'zipnload',
                dir: file.path,
                filename: file.name,
                url: window.location.href,
            });

            if (res) {
                const blob = new Blob([res], { type: file.mime_type });

                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = file.type === 'file' ? file.name : file.name + '.zip';
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(link.href);
            }
        } catch (err) {
            console.log('Worker error:', err);
        } finally {
            isLoading.value = false;
        }
    }

    async function changePath(dir) {
        currentPath.value = dir;
        await getFiles(dir);
    }

    function setSearch(query) {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            search.value = query;
        }, 300);
    }
    
    return {
        /* State */
        files,
        selectedFiles,
        recursiveSearchFiles,
        currentPath,
        search,
        sorting,
        isLoading,
        isRecursiveSearch,
        /* Getters */
        filteredFiles,
        /* Actions */
        getFiles,
        refresh,
        getFileContent,
        createFile,
        editFile,
        moveCopyFile,
        searchFiles,
        createDir,
        downloadFile,
        changePath,
        setSearch,
    };
});

