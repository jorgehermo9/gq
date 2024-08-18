import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
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
        baseUrl: "https://github.com/jorgehermo9/gq/tree/feature/docs/docs",
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
          label: "Usage",
          autogenerate: {
            directory: "usage",
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
