import { defineStore } from 'pinia'

import axios from 'axios';

export const useFilesStore = defineStore('files', {
    state() {
        return {
            filesData: [],
            search: '',
            isLoading: false,
        }
    },

    actions: {
        async getFiles(dir) {
            this.isLoading = true;

            const params = new URLSearchParams();
            params.append('api', 'getFiles');
            params.append('dir', dir);

            try {
                const res = await axios.post(window.location.href, params);

                this.filesData = res.data;
            } catch (err) {
                console.log(err);
            }

            this.isLoading = false;
        },

        setSearch(query) {
            this.search = query;
        },

        async createDir(dir, dirname) {
            const params = new URLSearchParams();
            params.append('api', 'createDir');
            params.append('dir', dir);
            params.append('dirname', dirname);

            try {
                const res = await axios.post(window.location.href, params);
            } catch (err) {
                console.log(err);
            }
        },
    }
});
