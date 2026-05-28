import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TU_CORREO@gmail.com',
    pass: 'TU_PASSWORD_APP'
  }
});
const db = new Sequelize(
  process.env.BD_BASEDATOS,
  process.env.BD_USER,
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    define: { timestamps: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

export default db;