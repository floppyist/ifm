<script setup>
import { computed } from 'vue';

import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-min-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/theme-chrome';

const modeMap = {
    'json': 'json',
    'js': 'javascript',
};

const content = defineModel();

const props = defineProps({
    'filename': String,
    'newname': String,
});

/* Sets the ACE Editor Mode to the given extension */
function getModeByExtension(filename) { 
    const ext = filename.split('.').pop(); 
    return modeMap[ext] || 'text'; 
}

/* Determines whether the respective extension is available for each entry */
const editorMode = computed(() => {
    return getModeByExtension(props.newname === undefined || props.newname === '' ? props.filename : props.newname);
});
</script>

<template>
    <v-ace-editor
        v-model:value="content"
        :lang="editorMode"
        theme="chrome"
        style="height: 300px"
    />
    <p class="text-xs w-full truncate">{{ 'Mode: ' + editorMode }}</p>
</template>
