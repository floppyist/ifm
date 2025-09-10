import { ref } from 'vue';

import { defineStore } from 'pinia';

export const useModalsStore = defineStore('modals', () => {
    const modals = {
        newDir: ref(null),
    };

    let removeEventListenerCallback = null;
    let addEventListenerCallback = null;

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

    function openModal(name) {
        if (modals[name]) {
            removeEventListenerCallback();
            modals[name].value.open();
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
        modals,
        registerModal,
        setRemoveEventListenerCallback,
        setAddEventListenerCallback,
        openModal,
        closeModal,
    };
});
