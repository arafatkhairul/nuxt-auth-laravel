import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImports
} from '@nuxt/kit'
import { ModuleOptions } from './types'

const defaults: ModuleOptions = {
  token: false,
  baseUrl: 'http://localhost:8000',
  endpoints: {
    csrf: '/sanctum/csrf-cookie',
    login: '/login',
    logout: '/logout',
    user: '/user'
  },
  csrf: {
    headerKey: 'X-XSRF-TOKEN',
    cookieKey: 'XSRF-TOKEN',
    tokenCookieKey: 'nuxt-auth-laravel-token'
  },
  redirects: {
    home: '/',
    login: '/login',
    logout: '/login'
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auth-laravel',
    configKey: 'nuxtSanctumAuth'
  },
  defaults,
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.nuxtSanctumAuth = options
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))

    addImports({
      name: 'useAuth',
      as: 'useAuth',
      from: resolve('runtime/composables')
    })
  }
})
