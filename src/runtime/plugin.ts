import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRuntimeConfig,
  useCookie
} from '#app'
import { ofetch } from 'ofetch'
import { ModuleOptions, Auth } from '../types'

export default defineNuxtPlugin(async () => {
  const auth = useState<Auth>('auth', () => {
    return {
      user: null,
      loggedIn: false
    }
  })
  const config: ModuleOptions = useRuntimeConfig().nuxtSanctumAuth

  addRouteMiddleware('auth', async () => {
    await getUser()

    if (auth.value.loggedIn === false) {
      return config.redirects.login
    }
  })
  addRouteMiddleware('guest', async () => {
    await getUser()

    if (auth.value.loggedIn) {
      return config.redirects.home
    }
  })

  const apiFetch = ofetch.create({
    baseURL: config.baseUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value
    } as HeadersInit
  })

  const csrf = async () => {
    await ofetch(config.endpoints.csrf, {
      baseURL: config.baseUrl,
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
  }

  const getUser = async () => {
    if (auth.value.loggedIn && auth.value.user) {
      return auth.value.user
    }

    try {
      const user = await apiFetch(config.endpoints.user)
      if (user) {
        auth.value.loggedIn = true
        auth.value.user = user
        return user
      }
    } catch (error) {
      // console.log(error)
    }
  }

  const login = async (data: any) => {
    await csrf()

    try {
      await apiFetch(config.endpoints.login, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value
        } as HeadersInit
      })

      // await getUser()
      window.location.replace(config.redirects.home)
    } catch (error: any) {
      throw error.data
    }
  }

  const logout = async () => {
    try {
      await apiFetch(config.endpoints.logout, {
        method: 'POST'
      })
    } catch (error) {
      console.log(error)
    } finally {
      auth.value.loggedIn = false
      auth.value.user = null

      window.location.replace(config.redirects.logout)
    }
  }

  return {
    provide: {
      apiFetch,
      csrf,
      sanctumAuth: {
        login,
        getUser,
        logout
      }
    }
  }
})
