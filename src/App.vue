<template>
  <div id="app">
    <Header/>
    <router-view />
    <fixedMusic />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from './components/header.vue'
import fixedMusic from './components/fixedMusic.vue'

const route = useRoute()


</script>
