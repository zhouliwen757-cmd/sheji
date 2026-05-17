<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Toast 
      :key="toastKey" 
      :message="toastMessage" 
      :type="toastType" 
    />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Toast from '@/components/Toast.vue'
import { useToast } from '@/composables/useToast'

const { toastMessage, toastType, toastKey } = useToast()
</script>
