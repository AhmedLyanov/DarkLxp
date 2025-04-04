const axios = require("axios");
const readline = require("readline");

const API_URL = "https://api.newlxp.ru/graphql";
const EMAIL = "evloevam@magas.ithub.ru";
const PASSWORD = "password";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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
        const response = await axios.post(API_URL, { query, variables });
        return response.data.data.signIn.accessToken;
    } catch (error) {
        console.error("Ошибка авторизации:", error.response?.data?.errors?.[0]?.message || error.message);
        process.exit(1);
    }
}

async function getUserData(token) {
    const query = `
    query GetMe {
      getMe {
        id
        firstName
        lastName
        roles
        __typename
      }
    }
    `;
    const headers = { Authorization: `Bearer ${token}` };
    try {
        const response = await axios.post(API_URL, { query }, { headers });
        return response.data.data.getMe;
    } catch (error) {
        console.error("Ошибка получения данных пользователя:", error.response?.data?.errors?.[0]?.message || error.message);
        return null;
    }
}

async function getTasksPage(token, studentId, pageSize, page = 1) {
    const query = `
    query StudentAvailableTasks($input: StudentAvailableTasksInput!) {
      studentAvailableTasks(input: $input) {
        hasMore
        page
        perPage
        total
        totalPages
        items {
          ...StudentAvailableTaskFragment
          __typename
        }
        __typename
      }
    }
    
    fragment StudentAvailableTaskFragment on StudentContentBlock {
      kind
      taskDeadline
      taskCanBeAnsweredAfterDeadline
      passDate
      testScore
      task {
        id
        scoreInPercent
        answers {
          id
          __typename
        }
        __typename
      }
      testInterval {
        from
        to
        __typename
      }
      customTaskDeadline {
        deadline
        formEducation {
          id
          startedAt
          finishedAt
          form
          studentId
          comment
          __typename
        }
        __typename
      }
      customTestInterval {
        interval {
          from
          to
          __typename
        }
        formEducation {
          id
          startedAt
          finishedAt
          form
          studentId
          comment
          __typename
        }
        __typename
      }
      studentTopic {
        status
        __typename
      }
      topic {
        name
        id
        isCheckPoint
        isForPortfolio
        chapterId
        chapter {
          id
          name
          disciplineId
          discipline {
            name
            code
            suborganization {
              organization {
                id
                name
                timezoneMinutesOffset
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      contentBlock {
        ... on TaskDisciplineTopicContentBlock {
          id
          kind
          name
          maxScore
          __typename
        }
        ... on TestDisciplineTopicContentBlock {
          id
          name
          kind
          testMaxScore: maxScore
          canBePassed
          testId
          __typename
        }
        __typename
      }
      __typename
    }
    `;
    
    const variables = {
        input: {
            studentId: studentId,
            pageSize: pageSize,
            page: page,
            filters: {
                fromArchivedDiscipline: false
            }
        }
    };
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        const response = await axios.post(API_URL, { 
            operationName: "StudentAvailableTasks",
            query,
            variables 
        }, { headers });
        
        return response.data.data.studentAvailableTasks;
    } catch (error) {
        console.error("Ошибка получения заданий:", error.response?.data?.errors?.[0]?.message || error.message);
        return null;
    }
}

async function getTaskDetails(token, studentId, topicId, contentId) {
    const query = `
    query GetDisciplineTaskBlockByTopicIdAndContentId($input: GetByTopicIdAndContentIdInput!, $studentId: UUID!) {
      getDisciplineTaskBlockByTopicIdAndContentId(input: $input) {
        id
        name
        maxScore
        body
        studentCanSendAnswers(studentId: $studentId)
        studentDeadline(studentId: $studentId)
        studentCanSendAnswersAfterDeadline(studentId: $studentId)
        customStudentDeadline(studentId: $studentId) {
          deadline
          __typename
        }
        competencies {
          id
          name
          __typename
        }
        __typename
      }
    }
    `;
    
    const variables = {
        input: {
            contentId,
            topicId
        },
        studentId
    };
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        const response = await axios.post(API_URL, { 
            operationName: "GetDisciplineTaskBlockByTopicIdAndContentId",
            query,
            variables 
        }, { headers });
        
        return response.data.data.getDisciplineTaskBlockByTopicIdAndContentId;
    } catch (error) {
        console.error("Ошибка получения задания:", error.response?.data?.errors?.[0]?.message || error.message);
        return null;
    }
}

function formatTasksList(tasksData) {
    if (!tasksData || !tasksData.items || tasksData.items.length === 0) {
        return "🚫 Нет заданий для отображения";
    }

    let output = `\n📖 Задания (${tasksData.page}/${tasksData.totalPages})`;
    output += ` | Всего: ${tasksData.total} | На странице: ${tasksData.items.length}`;
    output += `\n${"━".repeat(60)}\n`;

    tasksData.items.forEach((task, index) => {
        const taskNum = index + 1;
        const taskType = task.kind === 'TASK' ? '📝 Задание' : '🧪 Тест';
        const taskName = task.contentBlock?.name || 'Без названия';
        const discipline = task.topic?.chapter?.discipline?.name || 'Неизвестно';
        const status = task.studentTopic?.status || '❓ Не начато';
        const deadline = task.taskDeadline ? new Date(task.taskDeadline).toLocaleString() : '⏳ Нет срока';

        output += `\n${taskNum}. ${taskType}: ${taskName}`;
        output += `\n   🏫 Дисциплина: ${discipline}`;
        output += `\n   📌 Статус: ${status}`;
        output += `\n   ⏰ Срок: ${deadline}`;
        output += `\n   🔗 ID задания: ${task.contentBlock?.id || 'Нет ID'}`;
        output += `\n${"─".repeat(60)}`;
    });

    output += `\n\n📜 Страницы: ${tasksData.hasMore ? 'Есть еще' : 'Последняя'}`;
    return output;
}

function formatTaskDetails(task) {
    if (!task) return "🚫 Задание не найдено";

    let output = `\n📌 ${task.name}`;
    output += `\n${"━".repeat(60)}`;
    output += `\n💯 Макс. балл: ${task.maxScore || 'Не указан'}`;
    output += `\n⏳ Срок сдачи: ${task.studentDeadline ? new Date(task.studentDeadline).toLocaleString() : 'Не указан'}`;
    output += `\n📤 Можно отправить: ${task.studentCanSendAnswers ? '✅ Да' : '❌ Нет'}`;
    
    if (task.customStudentDeadline) {
        output += `\n⏱️ Индивидуальный срок: ${new Date(task.customStudentDeadline.deadline).toLocaleString()}`;
    }

    if (task.body) {
        try {
            const bodyJson = JSON.parse(task.body);
            let cleanBody = '';
            
            bodyJson.forEach(item => {
                if (item.type === 'paragraph' && item.data?.text) {
                    cleanBody += item.data.text
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .trim() + '\n\n';
                }
            });
            
            if (cleanBody) {
                output += `\n\n📝 Описание задания:\n${"─".repeat(60)}\n${cleanBody}`;
            }
        } catch (e) {
            console.error("Ошибка парсинга тела задания:", e);
        }
    }

    if (task.competencies?.length > 0) {
        output += `\n\n🏆 Компетенции:`;
        task.competencies.forEach(comp => {
            output += `\n   • ${comp.name}`;
        });
    }

    return output;
}

async function mainMenu(token, studentId) {
    let currentPage = 1;
    let pageSize = 10;
    let tasksData = null;

    while (true) {
        console.clear();
        console.log("=== 📚 Учебные задания ===");
        
        if (!tasksData || currentPage !== tasksData?.page) {
            console.log(`\n⌛ Загружаю страницу ${currentPage}...`);
            tasksData = await getTasksPage(token, studentId, pageSize, currentPage);
        }

        if (tasksData) {
            console.log(formatTasksList(tasksData));
        } else {
            console.log("🚫 Не удалось загрузить задания");
            await askQuestion("\nНажмите Enter чтобы продолжить...");
            continue;
        }

        console.log("\n1. Выбрать страницу");
        console.log("2. Изменить количество заданий на странице");
        console.log("3. Просмотреть задание по номеру");
        console.log("4. Выход");

        const choice = await askQuestion("\nВыберите действие: ");

        switch (choice) {
            case '1':
                if (!tasksData) {
                    console.log("❌ Данные заданий не загружены!");
                    await askQuestion("Нажмите Enter чтобы продолжить...");
                    break;
                }
                const newPage = parseInt(await askQuestion(`Введите номер страницы (1-${tasksData.totalPages}): `));
                if (newPage >= 1 && newPage <= tasksData.totalPages) {
                    currentPage = newPage;
                } else {
                    console.log("❌ Некорректный номер страницы!");
                    await askQuestion("Нажмите Enter чтобы продолжить...");
                }
                break;

            case '2':
                const newSize = parseInt(await askQuestion("Количество заданий на странице (по умолчанию 10): "));
                if (newSize > 0 && newSize <= 100) {
                    pageSize = newSize;
                    currentPage = 1;
                    tasksData = null;
                } else {
                    console.log("❌ Количество должно быть от 1 до 100!");
                    await askQuestion("Нажмите Enter чтобы продолжить...");
                }
                break;

            case '3':
                if (!tasksData || tasksData.items.length === 0) {
                    console.log("❌ Нет заданий для просмотра!");
                    await askQuestion("Нажмите Enter чтобы продолжить...");
                    break;
                }

                const taskNum = parseInt(await askQuestion(`Введите номер задания (1-${tasksData.items.length}): `));
                if (taskNum >= 1 && taskNum <= tasksData.items.length) {
                    const selectedTask = tasksData.items[taskNum - 1];
                    const taskDetails = await getTaskDetails(
                        token,
                        studentId,
                        selectedTask.topic.id,
                        selectedTask.contentBlock.id
                    );
                    
                    console.clear();
                    console.log(formatTaskDetails(taskDetails));
                    await askQuestion("\nНажмите Enter чтобы вернуться...");
                } else {
                    console.log("❌ Некорректный номер задания!");
                    await askQuestion("Нажмите Enter чтобы продолжить...");
                }
                break;

            case '4':
                return;

            default:
                console.log("❌ Некорректный выбор!");
                await askQuestion("Нажмите Enter чтобы продолжить...");
                break;
        }
    }
}

(async () => {
    try {
        console.log("=== Система проверки учебных заданий ===");
        
        const token = await signIn();
        const userData = await getUserData(token);
        
        if (userData) {
            console.log(`\n👤 Добро пожаловать, ${userData.firstName} ${userData.lastName || ''}!`);
            await mainMenu(token, userData.id);
        }
    } catch (error) {
        console.error("❌ Ошибка:", error.message);
    } finally {
        rl.close();
    }
})();