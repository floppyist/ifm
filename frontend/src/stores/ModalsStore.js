import { ref } from 'vue';

import { defineStore } from 'pinia';

export const useModalsStore = defineStore('modals', () => {
    /* State */
    const modals = {
        newFile: ref(null),
        editFile: ref(null),
        newDir: ref(null),
        tasks: ref(null),
    };

    let removeEventListenerCallback = null;
    let addEventListenerCallback = null;

    /* Actions */
    function registerModal(name, instance) {
        if (modals[name]) {
            modals[name].value = instance;
        }
    };

    function setRemoveEventListenerCallback(callback) {
        removeEventListenerCallback = callback;
    };

    function setAddEventListenerCallback(callback) {
        addEventListenerCallback = callback;
    };

    function openModal(name, data='') {
        if (modals[name]) {
            removeEventListenerCallback();
            modals[name].value.open(data);
        } else {
            console.log("Modal [" + name + "] is not registered.")
        }
    };

    function closeModal(name) {
        if (modals[name]) {
            modals[name].value.close();
            addEventListenerCallback();
        } else {
            console.log("Modal [" + name + "] is not registered.")
        }
    };

    return { 
        /* State */
        modals,
        /* Actions */
        registerModal,
        setRemoveEventListenerCallback,
        setAddEventListenerCallback,
        openModal,
        closeModal,
    };
});
