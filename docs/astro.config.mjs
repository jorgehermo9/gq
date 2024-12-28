import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  base: "/docs",
  integrations: [
    tailwind({
      // Disable the default base styles
      applyBaseStyles: false,
    }),
    starlight({
      title: "GQ",
      social: {
        github: "https://github.com/jorgehermo9/gq",
      },
      editLink: {
        baseUrl: "https://github.com/jorgehermo9/gq/edit/main/docs",
      },
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Introduction",
          autogenerate: {
            directory: "introduction",
          },
        },
        {
          label: "Concepts",
          autogenerate: {
            directory: "concepts",
          },
        },
        {
          label: "Reference",
          autogenerate: {
            directory: "reference",
          },
        },
      ],
    }),
  ],
});
