<script setup>
import { ref, onMounted } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';
import { useModalsStore } from '@/stores/ModalsStore.js';

/* Components */
import Navbar from '@/components/Navbar.vue';
import IFMTable from '@/components/IFMTable.vue';
import Footer from '@/components/Footer.vue';

/* Modals */
import NewFileModal from '@/components/modals/NewFileModal.vue';
import EditFileModal from '@/components/modals/EditFileModal.vue';
import NewDirModal from '@/components/modals/NewDirModal.vue';
import TasksModal from '@/components/modals/TasksModal.vue';

/* Stores */
const filesStore = useFilesStore();
const modalsStore = useModalsStore();

const newFileModal = ref(null);
const editFileModal = ref(null);
const newDirModal = ref(null);
const tasksModal = ref(null);

/* Check for double-press shortcuts like "gg" */
let lastKey = null;
let timeout = null;

onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeys);

    modalsStore.registerModal('newFile', newFileModal.value);
    modalsStore.registerModal('editFile', editFileModal.value);
    modalsStore.registerModal('newDir', newDirModal.value);
    modalsStore.registerModal('tasks', tasksModal.value);

    /* Register event listeners in ModalsStore to control them while opening modals which have their own */
    modalsStore.setRemoveEventListenerCallback(() => {
        window.removeEventListener('keydown', handleGlobalKeys);
    });

    modalsStore.setAddEventListenerCallback(() => {
        window.addEventListener('keydown', handleGlobalKeys);
    });
})

function handleGlobalKeys(e) {
    const active = document.activeElement;

    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
    }

    if (e.shiftKey) {
        switch (e.key) {
            case 'G':
                e.preventDefault();
                const scrollContainer = document.getElementById('scrollContainer');
                scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
                break;
            case 'F':
                e.preventDefault();
                modalsStore.openModal('newFile');
                break;
            case 'D':
                e.preventDefault();
                modalsStore.openModal('newDir')
                break;
            case 'A':
                e.preventDefault();

                filesStore.selectedFiles = new Map(
                    filesStore.filteredFiles.map(f => { return [f.name, f]; }),
                );

                break;
            case 'T':
                e.preventDefault();
                modalsStore.openModal('tasks');
                break;
        }
    } else {
        switch (e.key) {
            case 'Escape':
                /* Remove all selections */
                filesStore.selectedFiles = new Map();
                break;
            case 'r':
                filesStore.refresh();
                break;
            case 'g':
                if (lastKey === 'g') {
                    scrollContainer.scrollTo(0, 0);
                    lastKey = null;
                    clearTimeout(timeout);
                } else {
                    lastKey = 'g';
                    timeout = setTimeout(() => {
                        lastKey = null;
                    }, 500);
                }
                break;
        }
    }
}
</script>

<template>
    <main class="flex flex-col h-screen bg-white max-w-7xl mx-auto">
        <Navbar />

        <div class="flex-auto overflow-x-hidden">
            <IFMTable></IFMTable>
        </div>

        <Footer />

        <!-- Modals -->
        <NewFileModal ref="newFileModal" />
        <EditFileModal ref="editFileModal" />
        <NewDirModal ref="newDirModal" />
        <TasksModal ref="tasksModal" />
    </main>
</template>
