<script setup>
import Navbar from '@/components/Navbar.vue';
import IFMTable from '@/components/IFMTable.vue';
</script>

<template>
    <main class="flex flex-col h-screen bg-slate-300">
        <Navbar></Navbar>

        <div class="flex-auto overflow-y-auto overflow-x-hidden">
            <IFMTable></IFMTable>
        </div>
    </main>
</template>

<style scoped></style>
