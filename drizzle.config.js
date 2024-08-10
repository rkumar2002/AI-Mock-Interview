/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-mock-interview_owner:KnapeyM9t4Gb@ep-empty-art-a1m2yhfo.ap-southeast-1.aws.neon.tech/ai-mock-interview?sslmode=require'
    }
  };