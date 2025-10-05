<script setup>
import { useModalsStore } from '@/stores/ModalsStore.js';

/* Icons */
import {
    PencilSquareIcon,
    ClipboardDocumentIcon,
    ArrowTopRightOnSquareIcon,
    TrashIcon,
    ClipboardIcon,
} from '@heroicons/vue/24/solid';

const modalsStore = useModalsStore();

function onEdit() {
    modalsStore.openModal('editFile', props.file);
    emit('close');
}

function onCopy() {
    console.log("COPY!");
}

function onMove() {
    console.log("MOVE!");
}

function onDelete() {
    console.log("DELETE!");
}

async function onCopyName() {
    await navigator.clipboard.writeText(props.file.name);
    emit('close');
}

const props = defineProps({
    file: Object,
    x: Number,
    y: Number,
});

const emit = defineEmits(['close']);
</script>

<template>
    <div class="fixed bg-slate-700 text-white rounded-sm w-40 p-1"
        :style="{ top: y + 'px', left: x + 'px' }">
        <div @click="onEdit" class="hover:bg-slate-500 rounded-sm pl-1 cursor-pointer flex items-center">
            <PencilSquareIcon class="size-5 pr-1" />
            Edit
        </div>
        <div @click="onCopy" class="hover:bg-slate-500 rounded-sm pl-1 cursor-pointer flex items-center">
            <ClipboardDocumentIcon class="size-5 pr-1" />
            Copy 
        </div>
        <div @click="onMove" class="hover:bg-slate-500 rounded-sm pl-1 cursor-pointer flex items-center">
            <ArrowTopRightOnSquareIcon class="size-5 pr-1" />
            Move 
        </div>
        <div @click="onDelete" class="hover:bg-red-500 rounded-sm pl-1 cursor-pointer flex items-center">
            <TrashIcon class="size-5 pr-1" />
            Delete 
        </div>
        <div @click="onCopyName" class="hover:bg-blue-500 rounded-sm pl-1 cursor-pointer flex items-center">
            <ClipboardIcon class="size-5 pr-1" />
            Copy filename
        </div>
    </div>
</template>
