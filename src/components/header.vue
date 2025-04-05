<template>
    <header>
        <div class="dark__newlxp_header_box">
            <RouterLink to="/">
                <div class="logo__box">
                    <img src="../assets/media/DarkLxpLogo.svg" alt="">
                </div>
            </RouterLink>
            
            <div class="header-right" v-if="isAuthenticated">
                <button @click="toggleNotifications" class="notifications-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
                </button>
            </div>
        </div>
    </header>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { computed } from 'vue'

export default {
    name: 'Header',
    setup() {
        const authStore = useAuthStore()
        
        const isAuthenticated = computed(() => !!authStore.token)
        const unreadCount = computed(() => authStore.unreadNotificationsCount)
        
        const toggleNotifications = () => {
            // Здесь можно добавить логику для показа уведомлений
            // Например, через emit или хранилище
        }
        
        return {
            isAuthenticated,
            unreadCount,
            toggleNotifications
        }
    }
}
</script>

<style>
header {
    display: flex;
    position: fixed;
    top: 0px;
    width: 100%;
    height: 72px;
    background-color: #1e1e1e;
    padding: 12px 40px;
    z-index: 200;
    -webkit-box-pack: justify;
    justify-content: space-between;
    border-bottom: 1px solid #5670d0;
    box-shadow: 0px 0px 10px 0px #5670d0;
}

.dark__newlxp_header_box {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.notifications-button {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #ff4757;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
}
</style>