import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://scorecard.kjaniec.dev",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  // Everything is bundled and hashed: no inline or third-party code is allowed to run.
  security: {
    csp: {
      directives: [
        "default-src 'none'",
        "img-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
    },
  },
});
