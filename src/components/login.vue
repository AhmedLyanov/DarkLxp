<template>
    <div class="main__content_login">
      <div class="login__form_container">
        <div class="login__form">
          <form @submit.prevent="handleSubmit">
            <div class="title_form">
              <h1>{{ constants.SET_DATA_LOGIN }}</h1>
            </div>
            <div class="form-group">
              <input v-model="email" type="email" placeholder="E-mail" required>
            </div>
            <div class="form-group">
              <input v-model="password" type="password" placeholder="Пароль" required>
            </div>
            <button type="submit" class="get_api_button_login" :disabled="loading">
              {{ loading ? 'Вход...' : constants.LOGIN }}
            </button>
            <div v-if="error" class="error-message">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import constants from '../constants/constants.js'
  
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()
  
  const handleSubmit = async () => {
    try {
      loading.value = true
      error.value = null
      await authStore.login(email.value, password.value)
    } catch (err) {
      error.value = err.message || 'Ошибка входа'
    } finally {
      loading.value = false
    }
  }
  </script>
  
<style scoped>
.main__content_login{
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    padding: 90px 15px 15px 15px; 
    background-color: #333333;

}

.login__form{
    width: 100%;
    max-width: 448px;
    min-width: 448px;
    margin: 0 auto;
    padding: 32px;
    background-color: #252424;
    border-radius: 8px;
}
.error-message{
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #ff0000;
    margin-top: 5px;
    text-align: center;
}
.title_form{
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 40px;
    text-align: left;
    color: #ffffff;
    text-align: left;
}

.form-group{
    position: relative;
    width: 100%;
    padding: 10px;
    display: flex;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    color: rgb(20, 26, 39);
    background-color: rgb(247, 249, 252);
    border: 1px solid rgb(235, 238, 245);
    border-radius: 8px;
    transition: background-color 0.2s, border-color 0.2s;
}

.form-group input{
    font-family: Inter, sans-serif;
    font-style: normal;
    font-size: 16px;
    line-height: 20px;
    font-weight: 500;
    flex: 1 1 0%;
    width: 100%;
    background-color: transparent;
    outline: none;
}

.get_api_button_login{
    border: 1px solid transparent;
    position: relative;
    max-width: 100%;
    border-radius: 8px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    color: rgb(255, 255, 255);
    background-color: #5670d0;
    padding: 7px 15px;
    font-family: Inter, sans-serif;
    font-style: normal;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    width: 100%;
}


.get_api_button_login:hover{
    background-color: #3951a8;
}
.login__form form{
    display: grid;
    gap: 30px;
 
    
}
</style>