module.exports = [
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: ["http://localhost:5173", "http://localhost:3000"],
    },
  },
  "strapi::security",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
