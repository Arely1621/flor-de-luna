import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Carrito = db.define('carritos', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
})

export { Carrito }