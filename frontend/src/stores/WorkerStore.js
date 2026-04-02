import { ref, reactive } from 'vue';

import { defineStore } from 'pinia';

export const useWorkerStore = defineStore('worker', () => {
    /* State */
    const tasks = ref([]);

    /* Actions */
    function executeTask(workerModuleURL, workerName, payload) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(workerModuleURL, { type: 'module' });
            const taskId = Date.now();

            const task = reactive({ 
                id: taskId, 
                workerName: workerName, 
                payload, 
                workerModuleURL, 
                status: 'PENDING',
                worker: worker,
                cancelPromise: reject,
            });

            tasks.value.push(task);

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
            task.cancelPromise({ cancelled: true });
            task.status = 'ABORT';
        }
    };

    function terminateEverything() {
        tasks.value.forEach(task => {
            terminateTask(task.id);
        });
    }

    return { 
        /* State */
        tasks,
        /* Actions */
        executeTask,
        terminateTask,
        terminateEverything,
    };
});
