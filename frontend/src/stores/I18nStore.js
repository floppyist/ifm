import { defineStore } from 'pinia'

import axios from 'axios';

export const useI18nStore = defineStore('i18n', {
    state() {
        return {
            i18nData: null,
        }
    },

    actions: {
        async getI18n() {
            const params = new URLSearchParams();
            params.append('api', 'getI18N');

            try {
                const res = await axios.post(window.location.href, params);

                this.i18nData = res.data;
            } catch (err) {
                console.log(err);
            }
        },
    }
});
