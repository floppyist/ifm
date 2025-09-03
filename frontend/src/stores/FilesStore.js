import { defineStore } from 'pinia'

import axios from 'axios';

export const useFilesStore = defineStore('files', {
    state() {
        return {
            filesData: [],
            search: '',
        }
    },

    actions: {
        async getFiles(dir) {
            const params = new URLSearchParams();
            params.append('api', 'getFiles');
            params.append('dir', dir);

            try {
                const res = await axios.post(window.location.href, params);

                this.filesData = res.data;
            } catch (err) {
                console.log(err);
            }
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
