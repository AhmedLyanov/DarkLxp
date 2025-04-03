const axios = require('axios');
const fs = require('fs');

// Конфигурация
const API_URL = "https://api.newlxp.ru/graphql";
const AUTH_DATA = {
  email: "Nic@magas.ithub.ru",
  password: "Password!"
};

// 1. Функция авторизации
async function login() {
  console.log('🔐 Отправка запроса авторизации...');
  
  const authQuery = `
  query SignIn($input: SignInInput!) {
    signIn(input: $input) {
      user { id isLead __typename }
      accessToken
      __typename
    }
  }`;

  try {
    const response = await axios.post(API_URL, {
      operationName: "SignIn",
      query: authQuery,
      variables: {
        input: AUTH_DATA
      }
    }, {
      headers: {
        "Content-Type": "application/json",
        "apollographql-client-name": "web"
      }
    });

    console.log('✅ Авторизация успешна');
    return response.data.data.signIn;

  } catch (error) {
    console.error('❌ Ошибка авторизации:', error.response?.data?.errors?.[0]?.message || error.message);
    process.exit(1);
  }
}

// 2. Функция получения дневника
async function getDiary(token, studentId) {
  console.log('\n📖 Загрузка данных дневника...');

  const diaryQuery = `
  query DiaryQuery($studentId: UUID!) {
    searchStudentDisciplines(input: { studentId: $studentId }) {
      discipline {
        name
        code
        teachers {
          user {
            lastName
            firstName
            middleName
          }
        }
      }
      disciplineGrade
      maxScoreForAnsweredTasks
      scoreForAnsweredTasks
      disciplineAttendance {
        percent
        total
        visited
      }
    }
  }`;

  try {
    const response = await axios.post(API_URL, {
      operationName: "DiaryQuery",
      query: diaryQuery,
      variables: { studentId }
    }, {
      headers: {
        "Content-Type": "application/json",
        "apollographql-client-name": "web",
        "authorization": `Bearer ${token}`
      }
    });

    return response.data.data.searchStudentDisciplines;

  } catch (error) {
    console.error('❌ Ошибка загрузки дневника:', error.response?.data?.errors?.[0]?.message || error.message);
    process.exit(1);
  }
}

// 3. Функция форматирования вывода
function formatTeachers(teachers) {
  return teachers.map(teacher => 
    `${teacher.user.lastName} ${teacher.user.firstName} ${teacher.user.middleName}`
  ).join(', ');
}

// 4. Главный процесс
async function main() {
  // Авторизация
  const { accessToken: token, user } = await login();
  console.log(`👤 Студент ID: ${user.id}`);

  // Получение дневника
  const diary = await getDiary(token, user.id);
  
  // Сохранение полных данных
  fs.writeFileSync('diary_full.json', JSON.stringify(diary, null, 2));

  // Красивый вывод
  console.log('\n=== УСПЕВАЕМОСТЬ ===\n');
  diary.forEach(item => {
    console.log(`📚 ${item.discipline.name} (${item.discipline.code})`);
    console.log(`👨‍🏫 Преподаватели: ${formatTeachers(item.discipline.teachers)}`);
    console.log(`⭐ Оценка: ${item.disciplineGrade || 'нет'} (${item.scoreForAnsweredTasks}/${item.maxScoreForAnsweredTasks} баллов)`);
    console.log(`📊 Посещаемость: ${item.disciplineAttendance.visited}/${item.disciplineAttendance.total} (${item.disciplineAttendance.percent}%)`);
    console.log('----------------------------------');
  });

  console.log(`\n💾 Полные данные сохранены в diary_full.json`);
}

// Запуск
main().catch(console.error);
