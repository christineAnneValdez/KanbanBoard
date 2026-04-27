import { defineNuxtPlugin } from "#app";
import { defineComponent, h } from "vue";

export default defineNuxtPlugin((nuxtApp) => {
  // SSR stub so templates that reference <QuillEditor> don't warn during server render.
  nuxtApp.vueApp.component(
    "QuillEditor",
    defineComponent({
      name: "QuillEditorServerStub",
      setup() {
        return () => h("div");
      },
    })
  );
});
