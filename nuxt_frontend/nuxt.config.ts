import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
     "@nuxt/ui",
    "@nuxtjs/color-mode",
    "motion-v/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "vue-sonner/nuxt"
  ],

  components: [
    { path: '~/components' }, // your own components
    { path: 'lucide-vue-next', prefix: 'Icon' } // lucide icons
  ],

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
    classSuffix: "",
  },

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 0,
    },

    mode: "svg",
    class: "shrink-0",
    fetchTimeout: 2000,
    serverBundle: "local",
  },

  css: ["~/assets/css/tailwind.css", "~/assets/css/richtext.css"],

  

  nitro: {
  devProxy: {
    '/api': {
      target: 'http://127.0.0.1:8000', // Laravel
      changeOrigin: true,
      prependPath: true,
    },
  },
},

runtimeConfig: {
  public: {
    apiBase: '/api',
  },
},
});