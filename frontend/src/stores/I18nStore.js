import { defineStore } from 'pinia'

export const useI18nStore = defineStore('i18n', {
    state() {
        return {
            i18nData: null,
        }
    },

    actions: {
        async getI18n() {
            try {
                const res = await fetch('http://localhost:8000/ifm.php?api=getI18N', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();

                this.i18nData = data;
            } catch (err) {
                console.log(err);
            } 
        }
    }
});
