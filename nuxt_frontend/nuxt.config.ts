import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  future: { compatibilityVersion: 4 },
  experimental: {
    inlineSSRStyles: true,
  },

  modules: [
     "@nuxt/ui",
    "@nuxtjs/color-mode",
    "motion-v/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "vue-sonner/nuxt",
  ],

  components: [
    { path: '~/components' }, // your own components
    { path: 'lucide-vue-next', prefix: 'Icon' } // lucide icons
  ],

  vite: {
    server: {
      hmr: {
        // Avoid default 24678 clashes when tests/dev run in parallel.
        port: Number(process.env.NUXT_HMR_PORT || 24679),
      },
    },
  },

  imports: {
    imports: [{
      from: "tailwind-variants",
      name: "tv",
    }, {
      from: "tailwind-variants",
      name: "VariantProps",
      type: true,
    }, {
      from: "vue-sonner",
      name: "toast",
      as: "useSonner",
    }],
  },

  colorMode: {
    storageKey: "nuxt_frontend-color-mode",
    storage: "cookie",
    fallback: "light",
    preference: "light",
    classSuffix: "",
  },

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 0,
    },

    mode: "svg",
    class: "shrink-0",
    fetchTimeout: 10000,
    serverBundle: "local",
  },

  css: [ "~/assets/css/tailwind.css",
  "~/assets/css/richtext.css"],

  
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
  },
},
});
