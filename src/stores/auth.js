import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const router = useRouter()

  const login = async (email, password) => {
    try {
      const response = await fetch('https://api.newlxp.ru/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SignIn($input: SignInInput!) {
              signIn(input: $input) {
                user { id isLead }
                accessToken
              }
            }
          `,
          variables: {
            input: { email, password }
          }
        })
      })

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      token.value = data.data.signIn.accessToken
      user.value = data.data.signIn.user
      router.push('/result')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    router.push('/login')
  }

  return { token, user, login, logout }
})