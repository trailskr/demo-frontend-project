/* eslint-disable import/no-duplicates, @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface */

declare interface Window {
  // extend the window
  __INITIAL_STATE__?: Record<string | symbol, any>
}

// with vite-plugin-md, markdowns can be treat as Vue components
declare module '*.md' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  // API urls
  VITE_API_URL: string
  VITE_GOOGLE_SIGN_IN_ENABLED: string
  VITE_GOOGLE_API_CLIENT_ID: string
  VITE_GOOGLE_API_KEY: string
  VITE_CLAREITY_API_CLIENT_ID: string
  VITE_BUILD_SIGNING: string
  VITE_ACCEPTED_DOCUMENT_FORMATS: string
  VITE_SMS_VERIFICATION_CODE_LENGTH: string
}
