<template>
    <transition name="network-notification">
      <div v-if="showStatus" class="network-status" :class="statusClass">
        <div class="status-icon">
          <svg v-if="isOnline" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </div>
        <div class="status-content">
          <div class="status-title">{{ isOnline ? 'Соединение восстановлено' : 'Потеряно соединение' }}</div>
          <div class="status-message">{{ isOnline ? 'Вы снова онлайн' : 'Проверьте интернет-подключение' }}</div>
        </div>
        <div class="status-progress" :class="{'active': showStatus}"></div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  
  const isOnline = ref(navigator.onLine)
  const showStatus = ref(false)
  
  const statusClass = computed(() => ({
    'online': isOnline.value,
    'offline': !isOnline.value
  }))
  
  const updateNetworkStatus = () => {
    const newStatus = navigator.onLine
    if (newStatus !== isOnline.value) {
      isOnline.value = newStatus
      showStatus.value = true
      
      setTimeout(() => {
        showStatus.value = false
      }, 5000)
    }
  }
  
  onMounted(() => {
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('online', updateNetworkStatus)
    window.removeEventListener('offline', updateNetworkStatus)
  })
  </script>
  
  <style scoped>
  .network-status {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    z-index: 9999;
    overflow: hidden;
    transform: translateX(0);
    backdrop-filter: blur(10px);
  }
  
  .network-status.online {
    background: rgba(32, 107, 196, 0.9);
    border-left: 4px solid #4CAF50;
    color: white;
  }
  
  .network-status.offline {
    background: rgba(69, 90, 115, 0.9);
    border-left: 4px solid #F44336;
    color: white;
  }
  
  .status-icon {
    margin-right: 12px;
  }
  
  .status-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .status-content {
    flex: 1;
  }
  
  .status-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .status-message {
    font-size: 13px;
    opacity: 0.9;
  }
  
  .status-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    background: rgba(255, 255, 255, 0.2);
  }
  
  .status-progress.active {
    animation: progress 5s linear forwards;
  }
  
  .status-progress.active.online {
    background: rgba(255, 255, 255, 0.6);
  }
  
  .status-progress.active.offline {
    background: rgba(255, 255, 255, 0.4);
  }
  
  @keyframes progress {
    0% { width: 100%; }
    100% { width: 0%; }
  }
  
  .network-notification-enter-active {
    animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .network-notification-leave-active {
    animation: slideOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  </style>