import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Compra = db.define('compras', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuarioId: DataTypes.INTEGER,
  subtotal: DataTypes.FLOAT,
  iva: DataTypes.FLOAT,
  total: DataTypes.FLOAT
});

export { Compra };