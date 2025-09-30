export default {
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
  security: {
    secret: process.env.DIRECTUS_SECRET,
  },
  roles: {
    instructor: {
      // app_access: false,
      admin_access: false,
    },
    admin: {
      app_access: false,
      admin_access: true,
    },
  },
};
