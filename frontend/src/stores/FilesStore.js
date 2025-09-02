import { defineStore } from 'pinia'

export const useFilesStore = defineStore('files', {
    state() {
        return {
            filesData: null,
        }
    },

    actions: {
        async getFiles() {
            try {
                const res = await fetch('http://localhost:8000/ifm.php?api=getFiles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: {
                        dir: "",
                    }
                });

                const data = await res.json();

                this.filesData = data;
            } catch (err) {
                console.log(err);
            } 
        }
    }
});
