<template>
    <div class="main__content_tasks">
        <div class="result-container">
            <div class="header">
                <h1>{{ result_constants.TITLE_TASKS }}</h1>
                <button @click="handleLogout" class="logout-button">Выйти</button>
            </div>

            <div v-if="loading" class="loading">
                <span>{{ result_constants.DOWNLOAD_DATA }}</span>
            </div>
            
            <div v-else>
                <div class="filters">
                    <select v-model="pageSize" @change="fetchTasks" class="custom-select">
                        <option value="5">{{ result_constants.FIVE_TASKS }}</option>
                        <option value="10">{{ result_constants.TEN_TASKS }}</option>
                        <option value="20">{{ result_constants.TWENTY_TASKS }}</option>
                    </select>
                    
                    <div class="pagination">
                        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">←</button>
                        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
                        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">→</button>
                    </div>
                </div>

                <div class="tasks-list">
                    <div v-for="task in tasks" :key="task.contentBlock.id" class="task-card">
                        <h3>{{ task.contentBlock.name }}</h3>
                        <div class="task-meta">
                            <span class="task-type">{{ task.kind === 'TASK' ? '📝 Задание' : '🧪 Тест' }}</span>
                            <span class="discipline">{{ task.topic?.chapter?.discipline?.name }}</span>
                        </div>
                        <div class="deadline">
                            <span>{{result_constants.DEADLINE_SET}} {{ formatDate(task.taskDeadline) }}</span>
                            <span v-if="daysLeft(task.taskDeadline)" 
                                  :class="{'warning': daysLeft(task.taskDeadline) <= 3}">
                                Осталось {{ daysLeft(task.taskDeadline) }} дней
                            </span>
                        </div>
                        <button @click="viewTaskDetails(task)" class="view-button">{{ result_constants.DETAILED }}</button>
                    </div>
                </div>
            </div>
            <div v-if="selectedTask" class="modal">
                <div class="modal-content">
                    <span class="close" @click="selectedTask = null">&times;</span>
                    <h2>{{ selectedTask.contentBlock.name }}</h2>
                    <div v-html="taskDetailsHtml"></div>
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
        
        const apiUrl = 'https://api.newlxp.ru/graphql'

        const fetchTasks = async () => {
    try {
        loading.value = true
        
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
    } catch (error) {
        console.error('Fetch tasks error:', error)
        error.value = 'Ошибка загрузки заданий: ' + error.message
    } finally {
        loading.value = false
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
            } catch (error) {
                console.error('Fetch task details error:', error)
                alert('Ошибка загрузки деталей задания: ' + error.message)
            }
        }
        
        const formatTaskDetails = (task) => {
            let html = `<p><strong>Макс. балл:</strong> ${task.maxScore || 'Не указан'}</p>`
            html += `<p><strong>Срок сдачи:</strong> ${formatDate(task.studentDeadline)}</p>`
            html += `<p><strong>Можно отправить:</strong> ${task.studentCanSendAnswers ? 'Да' : 'Нет'}</p>`
            
            if (task.body) {
                try {
                    const bodyJson = JSON.parse(task.body)
                    html += `<div class="task-body">`
                    
                    bodyJson.forEach(item => {
                        if (item.type === 'paragraph' && item.data?.text) {
                            html += `<p>${item.data.text}</p>`
                        }
                    })
                    
                    html += `</div>`
                } catch (e) {
                    console.error('Error parsing task body:', e)
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
        
        const daysLeft = (dateString) => {
            if (!dateString) return null
            const deadline = new Date(dateString)
            const now = new Date()
            const diffTime = deadline - now
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
        
        const viewTaskDetails = (task) => {
            fetchTaskDetails(task)
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
            }
        })
        
        return {
            tasks,
            loading,
            currentPage,
            pageSize,
            totalPages,
            selectedTask,
            taskDetailsHtml,
            fetchTasks,
            nextPage,
            prevPage,
            formatDate,
            daysLeft,
            viewTaskDetails,
            result_constants,
            handleLogout
        }
    }
}
</script>
<style scoped>
.main__content_tasks {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 90px 15px 15px 15px;
    user-select: none;
    background-color: #333333;
}

.result-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #252424;
    border-radius: 8px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #5670d0;
}

.header h1 {
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    color: #ffffff;
}

.logout-button {
    padding: 8px 16px;
    background-color: #5670d0;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: Inter, sans-serif;
    font-weight: 500;
    transition: background-color 0.2s;
}

.logout-button:hover {
    background-color: #3951a8;
}

.loading {
    text-align: center;
    padding: 50px;
    font-size: 1.2em;
    color: #ffffff;
    font-family: Inter, sans-serif;
}

.filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 0;
}

.custom-select {
    padding: 10px;
    background-color: #1e1e1e;
    color: #ffffff;
    border: 1px solid #5670d0;
    border-radius: 8px;
    font-family: Inter, sans-serif;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 15px;
    color: #ffffff;
    font-family: Inter, sans-serif;
}

.pagination-button {
    padding: 8px 12px;
    background-color: #5670d0;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.pagination-button:hover:not(:disabled) {
    background-color: #3951a8;
}

.pagination-button:disabled {
    background-color: #3a3a3a;
    cursor: not-allowed;
}

.tasks-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.task-card {
    border: 1px solid #5670d0;
    border-radius: 8px;
    padding: 20px;
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(86, 112, 208, 0.2);
    transition: transform 0.2s;
}

.task-card:hover {
    transform: translateY(-5px);
}

.task-card h3 {
    font-family: Inter, sans-serif;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 10px;
}

.task-meta {
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
    font-size: 0.9em;
    color: #b0b0b0;
    font-family: Inter, sans-serif;
}

.deadline {
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
    font-weight: 500;
    color: #ffffff;
    font-family: Inter, sans-serif;
}

.warning {
    color: #ff6b6b;
}

.view-button {
    width: 100%;
    padding: 10px;
    background-color: #5670d0;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: Inter, sans-serif;
    font-weight: 500;
    transition: background-color 0.2s;
}

.view-button:hover {
    background-color: #3951a8;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #252424;
    padding: 30px;
    border-radius: 8px;
    max-width: 800px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid #5670d0;
    box-shadow: 0 0 15px rgba(86, 112, 208, 0.3);
}

.modal-content h2 {
    font-family: Inter, sans-serif;
    color: #ffffff;
    margin-bottom: 20px;
}

.modal-content div {
    color: #e0e0e0;
    font-family: Inter, sans-serif;
    line-height: 1.6;
}

.close {
    position: absolute;
    top: 15px;
    right: 25px;
    font-size: 28px;
    cursor: pointer;
    color: #ffffff;
    transition: color 0.2s;
}

.close:hover {
    color: #5670d0;
}

.task-body {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #3a3a3a;
}

.task-body p {
    margin-bottom: 15px;
}
</style>