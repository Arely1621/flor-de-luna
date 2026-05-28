import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import bcrypt from 'bcrypt';

const Usuario = db.define('tblusuarios', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  telefono: {
    type: DataTypes.STRING
  },

  direccion: {
    type: DataTypes.STRING
  },

  ciudad: {
    type: DataTypes.STRING
  },

  codigoPostal: {
    type: DataTypes.STRING
  },

  pass: {
    type: DataTypes.STRING,
    allowNull: false
  },

  tipousuario: {
    type: DataTypes.STRING,
    defaultValue: 'User'
  }

}, {

  hooks: {

    beforeCreate: async (u) => {

      u.pass = await bcrypt.hash(
        u.pass,
        10
      );

    }
  }
});

Usuario.prototype.verificarPassword =
function(pwd){

  return bcrypt.compareSync(
    pwd,
    this.pass
  );
};

export { Usuario };