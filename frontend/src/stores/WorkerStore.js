import { ref, reactive } from 'vue';

import { defineStore } from 'pinia';

export const useWorkerStore = defineStore('worker', () => {
    /* State */
    const tasks = ref([]);

    /* Actions */
    function executeTask(workerModuleURL, payload) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(workerModuleURL, { type: 'module' });
            const taskId = Date.now();

            const task = reactive({ id: taskId, workerModuleURL, status: '' });
            tasks.value.push(task);

            task.status = 'PENDING';

            worker.onmessage = (e) => {
                if (e.data.error) {
                    task.status = 'ERROR';

                    reject(e.data.error);
                } else if (e.data.payload) {
                    task.status = 'DONE';

                    resolve(e.data.payload);
                }

                worker.terminate();
            };

            worker.onerror = (err) => {
                task.status = 'ERROR';

                reject(err.message);

                worker.terminate();
            };

            worker.postMessage(payload);
        });
    };

    function terminateTask(id) {
        const task = tasks.value.find(t => t.id === id);

        if (task) {
            task.worker.terminate();
            tasl.status = 'ABORT';
            tasks.value = tasks.value.filter(t => t.id !== id);
        }
    };

    return { 
        /* State */
        tasks,
        /* Actions */
        executeTask,
        terminateTask,
    };
});
