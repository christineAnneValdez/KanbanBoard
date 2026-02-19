import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  experimental: {
    inlineSSRStyles: true,
  },
  app: {
    head: {
      htmlAttrs: {
        class: "nuxt-preload",
      },
      style: [
        {
          children:
            "html,body{background:#f9fafb;}@media (prefers-color-scheme: dark){html,body{background:#030712;}}html.nuxt-preload #__nuxt{opacity:0;visibility:hidden;}html.nuxt-ready #__nuxt{opacity:1;visibility:visible;transition:opacity .15s ease;}",
        },
      ],
      script: [
        {
          children:
            "(function(){function r(){var d=document.documentElement;d.classList.remove('nuxt-preload');d.classList.add('nuxt-ready')}if(document.readyState==='complete'){r()}else{window.addEventListener('load',r,{once:true});setTimeout(r,4000)}})();",
        },
      ],
    },
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
    preference: "system",
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

  css: [ "~/assets/css/tailwind.css",
  "~/assets/css/richtext.css"],

  

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
