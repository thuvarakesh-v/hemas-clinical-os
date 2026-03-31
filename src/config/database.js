const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hospital_db',
  process.env.DB_USER || 'hospital_user',
  process.env.DB_PASSWORD || 'hospital_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: true, timestamps: true },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    // Models are loaded by app.js before connectDB is called
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
