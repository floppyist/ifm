<script setup>
import { ref, onMounted } from 'vue';

import { useFilesStore } from '@/stores/FilesStore.js';
import { useModalsStore } from '@/stores/ModalsStore.js';

import Navbar from '@/components/Navbar.vue';
import IFMTable from '@/components/IFMTable.vue';
import Footer from '@/components/Footer.vue';

import NewDirModal from '@/components/modals/NewDirModal.vue';

const filesStore = useFilesStore();
const modalsStore = useModalsStore();

const newDirModal = ref(null);

onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeys);

    modalsStore.registerModal('newDir', newDirModal.value);

    modalsStore.setRemoveEventListenerCallback(() => {
        window.removeEventListener('keydown', handleGlobalKeys);
    });

    modalsStore.setAddEventListenerCallback(() => {
        window.addEventListener('keydown', handleGlobalKeys);
    });
});

function handleGlobalKeys(e) {
    const active = document.activeElement;

    if (active && (active.tagName === 'INPUT')) {
        return;
    }
    
    switch (e.key) {
        case 'n':
            e.preventDefault();
            modalsStore.openModal('newDir');
            break;
        case 'r':
            filesStore.refresh();
    }
};
</script>

<template>
    <main class="flex flex-col h-screen bg-white max-w-7xl mx-auto">
        <Navbar />

        <div class="flex-auto overflow-x-hidden">
            <IFMTable></IFMTable>
    </div>

        <Footer />

        <!-- Modals -->
        <NewDirModal ref="newDirModal" />
    </main>
</template>
