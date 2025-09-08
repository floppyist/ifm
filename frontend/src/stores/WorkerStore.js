import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWorkerStore = defineStore('worker', () => {
    const tasks = ref([]);

    function executeTask(workerModuleURL, payload) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(workerModuleURL, { type: 'module' });
            const taskId = Date.now();

            tasks.value.push({ id: taskId, worker });

            worker.onmessage = (e) => {
                if (e.data.error) reject(e.data.error);
                else if (e.data.payload) resolve(e.data.payload);

                worker.terminate();

                tasks.value = tasks.value.filter(t => t.id !== taskId);
            };

            worker.onerror = (err) => {
                reject(err.message);

                worker.terminate();

                tasks.value = tasks.value.filter(t => t.id !== taskId);
            };

            worker.postMessage(payload);
        });
    };

    function terminateTask(id) {
        const task = tasks.value.find(t => t.id === id);

        if (task) {
            task.worker.terminate();
            tasks.value = tasks.value.filter(t => t.id !== id);
        }
    };

    return { 
        tasks,
        executeTask,
        terminateTask,
    };
});
