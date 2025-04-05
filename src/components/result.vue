<template>
    <div class="main-container">

        <div class="tasks-container">
            <div class="result-container">
                <div class="header">
                    <h1>{{ result_constants.TITLE_TASKS }}</h1>
                    <div class="header-right">
                        <button @click="handleLogout" class="logout-button">
                            <span>{{ result_constants.LOGOUT }}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div v-if="loading" class="loading">
                    <div class="spinner"></div>
                    <span>{{ result_constants.DOWNLOAD_DATA }}</span>
                </div>

                <div v-else>
                    <div class="filters">
                        <div class="select-wrapper">
                            <select v-model="pageSize" @change="fetchTasks" class="custom-select">
                                <option value="5">{{ result_constants.FIVE_TASKS }}</option>
                                <option value="10">{{ result_constants.TEN_TASKS }}</option>
                                <option value="20">{{ result_constants.TWENTY_TASKS }}</option>
                            </select>
                            <div class="select-arrow"></div>
                        </div>

                        <div class="pagination">
                            <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                            <span class="pagination-info">Страница {{ currentPage }} из {{ totalPages }}</span>
                            <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="tasks-list">
                        <div v-for="task in tasks" :key="task.contentBlock.id" class="task-card"
                            :class="{ 'task-test': task.kind === 'TEST' }">
                            <div class="task-header">
                                <h3>{{ task.contentBlock.name }}</h3>
                                <span class="task-badge">{{ task.kind === 'TASK' ? '📝 Задание' : '🧪 Тест' }}</span>
                            </div>
                            <div class="task-discipline">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span>{{ task.topic?.chapter?.discipline?.name || 'Без дисциплины' }}</span>
                            </div>
                            <div class="task-deadline">
                                <div class="deadline-info">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                    <span>{{ formatDate(task.taskDeadline) }}</span>
                                </div>
                                <div v-if="daysLeft(task.taskDeadline)" class="days-left" :class="{
                                    'warning': daysLeft(task.taskDeadline) <= 3,
                                    'danger': daysLeft(task.taskDeadline) <= 1
                                }">
                                    {{ daysLeft(task.taskDeadline) }} {{ dayForm(daysLeft(task.taskDeadline)) }}
                                </div>
                            </div>
                            <button @click="viewTaskDetails(task)" class="view-button">
                                <span>{{ result_constants.DETAILED }}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" />
                                    <path
                                        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="selectedTask" class="modal">
                    <div class="modal-content">
                        <span class="close" @click="selectedTask = null">&times;</span>
                        <h2>{{ selectedTask.contentBlock.name }}</h2>
                        <div class="modal-body" v-html="taskDetailsHtml"></div>
                        <div class="modal-actions">
                            <button class="modal-button close-button" @click="selectedTask = null">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div class="notifications-container">
            <div class="contact_dev">
                <div class="github_repository">
                    <a href="" target="_blank" >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.195 22 16.418 22 12.017 22 6.484 17.522 2 12 2z" />
                        </svg>
                        
                        <span>GitHub repository</span>
                    </a>
                </div>
            </div>

            <div class="notifications-header">
                <h2>Уведомления</h2>
                <button @click="markAllAsRead" class="mark-read-button">Прочитать все</button>
            </div>

            <div v-if="notifications.length > 0" class="notifications-list">
                <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                    :class="{ 'unread': !notification.isRead }" @click="viewNotification(notification)">
                    <div class="notification-content">
                        <h4>{{ notification.title }}</h4>
                        <p>{{ notification.body }}</p>
                        <span class="notification-time">{{ formatNotificationDate(notification.createdAt) }}</span>
                    </div>
                    <div v-if="!notification.isRead" class="unread-dot"></div>
                </div>
            </div>
            <div v-else class="no-notifications">
                Нет новых уведомлений
            </div>

            <div v-if="selectedNotification" class="modal">
                <div class="modal-content">
                    <span class="close" @click="closeNotification">&times;</span>
                    <h2>{{ selectedNotification.title }}</h2>
                    <div class="modal-body">
                        <p>{{ selectedNotification.body }}</p>
                        <div class="notification-meta">
                            <span>Получено: {{ formatNotificationDate(selectedNotification.createdAt) }}</span>
                            <span>Статус: {{ selectedNotification.isRead ? 'Прочитано' : 'Не прочитано' }}</span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-button close-button" @click="closeNotification">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import result_constants from '../constants/result'

export default {
    setup() {
        const authStore = useAuthStore()
        const router = useRouter()

        const tasks = ref([])
        const loading = ref(true)
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalPages = ref(1)
        const selectedTask = ref(null)
        const taskDetailsHtml = ref('')
        const notifications = ref([])
        const showNotifications = ref(false)
        const selectedNotification = ref(null)
        const error = ref(null)

        const apiUrl = 'https://api.newlxp.ru/graphql'


        const unreadNotificationsCount = computed(() => {
            return notifications.value.filter(n => !n.isRead).length
        })

        const fetchTasks = async () => {
            try {
                loading.value = true
                error.value = null

                if (!authStore.user?.id) {
                    throw new Error('User ID not found')
                }

                const query = `
                    query StudentAvailableTasks($input: StudentAvailableTasksInput!) {
                        studentAvailableTasks(input: $input) {
                            hasMore
                            page
                            perPage
                            total
                            totalPages
                            items {
                                kind
                                taskDeadline
                                contentBlock {
                                    ... on TaskDisciplineTopicContentBlock {
                                        id
                                        name
                                        kind
                                    }
                                    ... on TestDisciplineTopicContentBlock {
                                        id
                                        name
                                        kind
                                    }
                                }
                                topic {
                                    id
                                    name
                                    chapter {
                                        discipline {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                `

                const variables = {
                    input: {
                        studentId: authStore.user.id,
                        pageSize: parseInt(pageSize.value),
                        page: currentPage.value,
                        filters: { fromArchivedDiscipline: false }
                    }
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: JSON.stringify({ query, variables })
                })

                const data = await response.json()

                if (data.errors) {
                    throw new Error(data.errors[0].message)
                }

                tasks.value = data.data.studentAvailableTasks.items
                totalPages.value = data.data.studentAvailableTasks.totalPages
            } catch (err) {
                console.error('Fetch tasks error:', err)
                error.value = 'Ошибка загрузки заданий: ' + err.message
            } finally {
                loading.value = false
            }
        }

        const fetchNotifications = async () => {
            try {
                const query = `
                    query GetNotifications($input: NotificationsInput!) {
                        notifications(input: $input) {
                            items {
                                isRead
                                id
                                title
                                body
                                createdAt
                            }
                            hasMore
                            page
                            perPage
                            total
                            totalPages
                        }
                    }
                `

                const variables = {
                    input: {
                        filters: {},
                        page: 1,
                        pageSize: 10
                    }
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: JSON.stringify({ query, variables })
                })

                const data = await response.json()

                if (data.errors) {
                    throw new Error(data.errors[0].message)
                }

                notifications.value = data.data.notifications.items
                authStore.unreadNotificationsCount = data.data.notifications.items.filter(n => !n.isRead).length
            } catch (err) {
                console.error('Fetch notifications error:', err)
                error.value = 'Ошибка загрузки уведомлений: ' + err.message
            }
        }

        const fetchTaskDetails = async (task) => {
            try {
                const query = `
                    query GetDisciplineTaskBlockByTopicIdAndContentId($input: GetByTopicIdAndContentIdInput!, $studentId: UUID!) {
                        getDisciplineTaskBlockByTopicIdAndContentId(input: $input) {
                            id
                            name
                            maxScore
                            body
                            studentCanSendAnswers(studentId: $studentId)
                            studentDeadline(studentId: $studentId)
                        }
                    }
                `

                const variables = {
                    input: {
                        contentId: task.contentBlock.id,
                        topicId: task.topic.id
                    },
                    studentId: authStore.user.id
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: JSON.stringify({
                        operationName: "GetDisciplineTaskBlockByTopicIdAndContentId",
                        query,
                        variables
                    })
                })

                const data = await response.json()

                if (data.errors) {
                    throw new Error(data.errors[0].message)
                }

                const taskDetails = data.data.getDisciplineTaskBlockByTopicIdAndContentId
                taskDetailsHtml.value = formatTaskDetails(taskDetails)
                selectedTask.value = task
            } catch (err) {
                console.error('Fetch task details error:', err)
                error.value = 'Ошибка загрузки деталей задания: ' + err.message
            }
        }

        const formatTaskDetails = (task) => {
            let html = `<div class="task-meta-grid">
                <div class="meta-item">
                    <span class="meta-label">Макс. балл:</span>
                    <span class="meta-value">${task.maxScore || 'Не указан'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Срок сдачи:</span>
                    <span class="meta-value">${formatDate(task.studentDeadline)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Можно отправить:</span>
                    <span class="meta-value ${task.studentCanSendAnswers ? 'yes' : 'no'}">
                        ${task.studentCanSendAnswers ? 'Да' : 'Нет'}
                    </span>
                </div>
            </div>`

            if (task.body) {
                try {
                    const bodyJson = JSON.parse(task.body)
                    html += `<div class="task-body">`

                    bodyJson.forEach(item => {
                        if (item.type === 'paragraph' && item.data?.text) {
                            html += `<p>${item.data.text}</p>`
                        } else if (item.type === 'header' && item.data?.text) {
                            html += `<h3>${item.data.text}</h3>`
                        }
                    })

                    html += `</div>`
                } catch (e) {
                    console.error('Error parsing task body:', e)
                    html += `<div class="task-body"><p>${task.body}</p></div>`
                }
            }

            return html
        }

        const formatDate = (dateString) => {
            if (!dateString) return 'Не указан'
            const date = new Date(dateString)
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
        
        const formatNotificationDate = (dateString) => {
            if (!dateString) return ''
            const date = new Date(dateString)
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const daysLeft = (dateString) => {
            if (!dateString) return null
            const deadline = new Date(dateString)
            const now = new Date()
            const diffTime = deadline - now
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays > 0 ? diffDays : 0
        }

        const dayForm = (days) => {
            if (days % 10 === 1 && days % 100 !== 11) return 'день'
            if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня'
            return 'дней'
        }

        const markNotificationAsRead = async (notificationId) => {
            try {
                const query = `
                    mutation MarkNotificationAsRead($input: MarkNotificationAsReadInput!) {
                        markNotificationAsRead(input: $input) {
                            success
                        }
                    }
                `

                const variables = {
                    input: {
                        notificationId
                    }
                }

                await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: JSON.stringify({ query, variables })
                })

                const index = notifications.value.findIndex(n => n.id === notificationId)
                if (index !== -1) {
                    notifications.value[index].isRead = true
                }
            } catch (err) {
                console.error('Mark notification as read error:', err)
            }
        }

        const markAllAsRead = async () => {
            try {
                const unreadIds = notifications.value
                    .filter(n => !n.isRead)
                    .map(n => n.id)

                if (unreadIds.length === 0) return

                const query = `
                    mutation MarkNotificationsAsRead($input: MarkNotificationsAsReadInput!) {
                        markNotificationsAsRead(input: $input) {
                            success
                        }
                    }
                `

                const variables = {
                    input: {
                        notificationIds: unreadIds
                    }
                }

                await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: JSON.stringify({ query, variables })
                })

                notifications.value = notifications.value.map(n => ({
                    ...n,
                    isRead: true
                }))
            } catch (err) {
                console.error('Mark all notifications as read error:', err)
            }
        }

        const viewTaskDetails = (task) => {
            fetchTaskDetails(task)
        }

        const viewNotification = (notification) => {
            selectedNotification.value = notification
            if (!notification.isRead) {
                markNotificationAsRead(notification.id)
            }
        }

        const closeNotification = () => {
            selectedNotification.value = null
        }

        const toggleNotifications = () => {
            showNotifications.value = !showNotifications.value
            if (showNotifications.value && notifications.value.length === 0) {
                fetchNotifications()
            }
        }

        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++
                fetchTasks()
            }
        }

        const prevPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--
                fetchTasks()
            }
        }

        const handleLogout = () => {
            authStore.logout()
            router.push('/login')
        }


        onMounted(() => {
            if (!authStore.token) {
                router.push('/login')
            } else {
                fetchTasks()
                fetchNotifications()
            }

            window.addEventListener('toggle-notifications', () => {
                showNotifications.value = !showNotifications.value
                if (showNotifications.value && notifications.value.length === 0) {
                    fetchNotifications()
                }
            })
        })


        return {
            tasks,
            loading,
            currentPage,
            pageSize,
            totalPages,
            selectedTask,
            taskDetailsHtml,
            notifications,
            showNotifications,
            selectedNotification,
            unreadNotificationsCount,
            error,
            result_constants,


            fetchTasks,
            fetchNotifications,
            markAllAsRead,
            viewTaskDetails,
            viewNotification,
            closeNotification,
            toggleNotifications,
            nextPage,
            prevPage,
            formatDate,
            formatNotificationDate,
            daysLeft,
            dayForm,
            handleLogout
        }
    }
}
</script>
<style scoped>
.main-container {
    display: flex;
    min-height: 100vh;
    background-color: #1a1a1a;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tasks-container {
    flex: 1;
    padding: 90px 15px 15px 15px;
    user-select: none;
    max-width: calc(100% - 400px);
}

.notifications-container {
    width: 400px;
    background-color: #252525;
    padding: 90px 20px 20px 20px;
    border-left: 1px solid #3a3a3a;
    height: 100vh;
    overflow-y: auto;
    position: sticky;
    top: 0;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #3a3a3a;
}

.notifications-header h2 {
    font-size: 20px;
    color: #ffffff;
    margin: 0;
}

.mark-read-button {
    background: none;
    border: 1px solid #5670d0;
    color: #5670d0;
    cursor: pointer;
    font-size: 13px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s;
}

.mark-read-button:hover {
    background-color: rgba(86, 112, 208, 0.1);
}

.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notification-item {
    background-color: #333333;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    position: relative;
    min-height: 80px;
    max-height: 120px;
    overflow: hidden;
}


.notification-item:hover {
    background-color: #3a3a3a;
}

.notification-item.unread {
    border-left: 3px solid #5670d0;
}

.notification-content {
    flex: 1;
}

.notification-content h4 {
    margin: 0 0 8px 0;
    font-size: 15px;
    color: #ffffff;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.notification-content p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #b0b0b0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 40px;
}


.notification-time {
    font-size: 12px;
    color: #707070;
}

.unread-dot {
    width: 10px;
    height: 10px;
    background-color: #5670d0;
    border-radius: 50%;
    margin-left: 10px;
    margin-top: 8px;
    flex-shrink: 0;
}

.no-notifications {
    text-align: center;
    padding: 40px 20px;
    color: #707070;
    font-size: 14px;
    background-color: #333333;
    border-radius: 8px;
}

.result-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 25px;
    background-color: #252525;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #3a3a3a;
}

.header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    letter-spacing: -0.5px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logout-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #3a3a3a;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    font-size: 14px;
}

.logout-button:hover {
    background-color: #4a4a4a;
    transform: translateY(-1px);
}

.logout-button svg {
    transition: transform 0.2s ease;
}
.contact_dev {
    padding: 15px;
    margin-bottom: 20px;
    background-color: #333333;
    border-radius: 8px;
   
}

.contact_dev:hover{
    box-shadow: 1px 1px 15px  #5670d0;
}

.github_repository a {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ffffff;
    text-decoration: none;
    font-size: 30px;
    font-weight: 500;
    transition: all 0.2s;
    padding: 8px 12px;
    border-radius: 6px;
}



.github_repository span {
    font-family: Inter, sans-serif;
    font-style: normal;
    font-size: 16px;
    line-height: 24px;
    font-weight: 700;
}
.logout-button:hover svg {
    transform: translateX(2px);
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #a0a0a0;
    font-size: 16px;
    gap: 15px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(86, 112, 208, 0.2);
    border-top: 4px solid #5670d0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding: 10px 0;
    flex-wrap: wrap;
    gap: 15px;
}

.select-wrapper {
    position: relative;
    min-width: 180px;
}

.custom-select {
    width: 100%;
    padding: 10px 35px 10px 15px;
    background-color: #333333;
    color: #ffffff;
    border: 1px solid #444;
    border-radius: 8px;
    font-size: 14px;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s;
}

.custom-select:focus {
    outline: none;
    border-color: #5670d0;
}

.select-arrow {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #a0a0a0;
    pointer-events: none;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ffffff;
}

.pagination-info {
    font-size: 14px;
    color: #d0d0d0;
}

.pagination-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #333333;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
    background-color: #5670d0;
    transform: translateY(-1px);
}

.pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-button svg {
    stroke: currentColor;
}

.tasks-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 15px;
}

.task-card {
    background-color: #333333;
    border-radius: 10px;
    padding: 20px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-left: 4px solid #5670d0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.task-card.task-test {
    border-left-color: #9c50d0;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    gap: 10px;
}

.task-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.4;
    flex: 1;
}

.task-badge {
    font-size: 12px;
    padding: 4px 8px;
    background-color: rgba(86, 112, 208, 0.2);
    color: #a0b0ff;
    border-radius: 12px;
    white-space: nowrap;
}

.task-test .task-badge {
    background-color: rgba(156, 80, 208, 0.2);
    color: #d0a0ff;
}

.task-discipline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-size: 13px;
    color: #b0b0b0;
}

.task-discipline svg {
    stroke: currentColor;
    flex-shrink: 0;
}

.task-deadline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-top: 15px;
    border-top: 1px solid #3a3a3a;
}

.deadline-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #d0d0d0;
}

.deadline-info svg {
    stroke: currentColor;
    flex-shrink: 0;
}

.days-left {
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
    background-color: rgba(76, 175, 80, 0.2);
    color: #8bc34a;
}

.days-left.warning {
    background-color: rgba(255, 193, 7, 0.2);
    color: #ffc107;
}

.days-left.danger {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

.view-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background-color: rgba(86, 112, 208, 0.2);
    color: #a0b0ff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.view-button:hover {
    background-color: rgba(86, 112, 208, 0.3);
    color: #ffffff;
}

.view-button svg {
    stroke: currentColor;
    transition: transform 0.2s;
}

.view-button:hover svg {
    transform: scale(1.1);
}

.task-test .view-button {
    background-color: rgba(156, 80, 208, 0.2);
    color: #d0a0ff;
}

.task-test .view-button:hover {
    background-color: rgba(156, 80, 208, 0.3);
    color: #ffffff;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    background-color: #2a2a2a;
    border-radius: 12px;
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid #3a3a3a;
    animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-content h2 {
    font-size: 22px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 20px 0;
    padding: 25px 25px 0 25px;
}

.close {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 28px;
    color: #a0a0a0;
    cursor: pointer;
    transition: color 0.2s;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.close:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
}

.modal-body {
    padding: 0 25px 25px 25px;
    color: #e0e0e0;
    line-height: 1.6;
    overflow-y: auto;
    max-height: calc(70vh - 100px);
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    padding: 15px 25px;
    border-top: 1px solid #3a3a3a;
    background-color: rgba(0, 0, 0, 0.1);
}

.modal-button {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 14px;
}

.close-button {
    background-color: #3a3a3a;
    color: #ffffff;
}

.close-button:hover {
    background-color: #4a4a4a;
}

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #5670d0;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #4a60b8;
}

.modal-body::-webkit-scrollbar-track {
    background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #5670d0;
}

:deep(.task-meta-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
}

:deep(.meta-item) {
    background-color: #333333;
    padding: 12px;
    border-radius: 8px;
}

:deep(.meta-label) {
    display: block;
    font-size: 12px;
    color: #a0a0a0;
    margin-bottom: 5px;
}

:deep(.meta-value) {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
}

:deep(.meta-value.yes) {
    color: #8bc34a;
}

:deep(.meta-value.no) {
    color: #f44336;
}

:deep(.task-body) {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #3a3a3a;
}

:deep(.task-body p) {
    margin-bottom: 15px;
    line-height: 1.6;
    color: #e0e0e0;
}

:deep(.task-body h3) {
    font-size: 18px;
    color: #ffffff;
    margin: 20px 0 10px 0;
}

@media (max-width: 1200px) {
    .main-container {
        flex-direction: column;
    }

    .tasks-container {
        max-width: 100%;
        padding: 90px 15px 15px 15px;
    }

    .notifications-container {
        width: 100%;
        height: auto;
        max-height: 400px;
        border-left: none;
        border-top: 1px solid #3a3a3a;
        padding: 20px;
    }
}

@media (max-width: 768px) {
    .result-container {
        padding: 15px;
    }

    .header h1 {
        font-size: 22px;
    }

    .tasks-list {
        grid-template-columns: 1fr;
    }

    .filters {
        flex-direction: column;
        align-items: stretch;
    }

    .select-wrapper {
        width: 100%;
    }

    .pagination {
        justify-content: center;
    }

    .modal-content {
        width: 95%;
    }

    :deep(.task-meta-grid) {
        grid-template-columns: 1fr;
    }
}
</style>