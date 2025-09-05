<script setup>
import Navbar from '@/components/Navbar.vue';
import IFMTable from '@/components/IFMTable.vue';
import Footer from '@/components/Footer.vue';
</script>

<template>
    <main class="flex flex-col h-screen bg-white max-w-7xl mx-auto">
        <Navbar />

        <div class="flex-auto overflow-y-auto overflow-x-hidden">
            <IFMTable></IFMTable>
        </div>

        <Footer />
    </main>
</template>

<style scoped></style>
