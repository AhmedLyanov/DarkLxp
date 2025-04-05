<template>
    <header>
        <div class="dark__newlxp_header_box">
            <RouterLink to="/">
                <div class="logo__box">
                    <img src="../assets/media/DarkLxpLogo.svg" alt="">
                </div>
            </RouterLink>

           
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
            window.dispatchEvent(new CustomEvent('toggle-notifications'))
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