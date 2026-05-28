import express from 'express';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import db from './config/db.js';
import { Usuario } from './models/Usuario.js';
import { Producto } from './models/Producto.js';
import { Carrito } from './models/Carrito.js';
import { Compra } from './models/Compra.js';
import { DetalleCompra } from './models/DetalleCompra.js';
import rutas from './routes/rutaRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(fileUpload({
  useTempFiles: false,
  createParentPath: true
}));

// Motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware para usuario en cada request
app.use((req, res, next) => {
  const token = req.cookies._mitoken;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.JWTSECRETO);
      req.usuario = data;
      res.locals.usuario = data;
    } catch (error) {
      res.locals.usuario = null;
    }
  } else {
    res.locals.usuario = null;
  }
  next();
});

// Rutas
app.use('/', rutas);

// ==================== ASOCIACIONES ====================
// Usuario - Carrito
Usuario.hasMany(Carrito, { foreignKey: 'usuarioId' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Producto - Carrito
Producto.hasMany(Carrito, { foreignKey: 'productoId' });
Carrito.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Compra - DetalleCompra
Compra.hasMany(DetalleCompra, { foreignKey: 'compraId' });
DetalleCompra.belongsTo(Compra, { foreignKey: 'compraId' });

// Producto - DetalleCompra
Producto.hasMany(DetalleCompra, { foreignKey: 'productoId' });
DetalleCompra.belongsTo(Producto, { foreignKey: 'productoId' });

// Usuario - Compra (opcional, para consultas)
Usuario.hasMany(Compra, { foreignKey: 'usuarioId' });
Compra.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// ==================== CONEXIÓN A BD ====================
try {
  await db.authenticate();
  await db.sync({ alter: true });  // alter: true agrega columnas nuevas sin borrar datos
  console.log('✅ Base de datos conectada y sincronizada');
} catch (error) {
  console.error('❌ Error de conexión:', error);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en puerto ${PORT}`);
});