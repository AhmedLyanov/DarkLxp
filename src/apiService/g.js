const axios = require('axios');

const API_URL = "https://api.newlxp.ru/graphql";
const EMAIL = "nic@magas.ithub.ru";
const PASSWORD = "password";

async function signIn() {
    const query = `
        query SignIn($input: SignInInput!) {
            signIn(input: $input) {
                user {
                    id
                    isLead
                    __typename
                }
                accessToken
                __typename
            }
        }
    `;

    const variables = {
        input: {
            email: EMAIL,
            password: PASSWORD
        }
    };

    try {
        const response = await axios.post(API_URL, {
            query,
            variables
        });

        if (response.data && response.data.data && response.data.data.signIn) {
            const token = response.data.data.signIn.accessToken;
            console.log(`Авторизация успешна. Токен: ${token}`);
            return token;
        } else {
            throw new Error('Не удалось получить токен');
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

async function getNotifications(accessToken) {
    const query = `
        query GetNotifications($input: NotificationsInput!) {
            notifications(input: $input) {
                items {
                    ...NotificationFragment
                    __typename
                }
                hasMore
                page
                perPage
                total
                totalPages
                __typename
            }
        }
        
        fragment NotificationFragment on Notification {
            isRead
            id
            title
            body
            createdAt
            __typename
        }
    `;

    const variables = {
        input: {
            filters: {},
            page: 1,
            pageSize: 10
        }
    };

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'apollographql-client-name': 'web'
    };

    try {
        const response = await axios.post(API_URL, {
            query,
            variables
        }, {
            headers
        });

        if (response.data && response.data.data && response.data.data.notifications) {
            return response.data.data.notifications.items;
        } else {
            throw new Error('Не удалось получить уведомления');
        }
    } catch (error) {
        console.error('Ошибка при получении уведомлений:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function main() {
    try {
        // Получаем токен доступа
        const accessToken = await signIn();
        
        // Получаем уведомления
        const notifications = await getNotifications(accessToken);
        
        if (notifications && notifications.length > 0) {
            console.log("\nПолученные уведомления:");
            notifications.forEach((notification, index) => {
                console.log(`\nУведомление #${index + 1}:`);
                console.log(`ID: ${notification.id}`);
                console.log(`Заголовок: ${notification.title}`);
                console.log(`Содержание: ${notification.body}`);
                console.log(`Дата создания: ${notification.createdAt}`);
                console.log(`Прочитано: ${notification.isRead ? 'Да' : 'Нет'}`);
            });
        } else {
            console.log("Нет уведомлений для отображения");
        }
    } catch (error) {
        console.error('Ошибка в main:', error.message);
    }
}

main();