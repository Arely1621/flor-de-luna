import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const DetalleCompra = db.define('detalle_compras', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  compraId: DataTypes.INTEGER,
  productoId: DataTypes.INTEGER,
  cantidad: DataTypes.INTEGER,
  precio: DataTypes.FLOAT
});

export { DetalleCompra };