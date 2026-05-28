import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Producto = db.define('productos', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nombre: DataTypes.STRING,
  precio: DataTypes.FLOAT,
  descripcion: DataTypes.STRING,
  imagen: DataTypes.STRING,
  categoria: DataTypes.STRING,

  ocasion: DataTypes.STRING

});

export { Producto };
