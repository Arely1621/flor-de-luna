import { Usuario } from '../models/Usuario.js';
import { Producto } from '../models/Producto.js';
import { Carrito } from '../models/Carrito.js';
import { Compra } from '../models/Compra.js';
import { DetalleCompra } from '../models/DetalleCompra.js';

import PDFDocument from 'pdfkit';
import fs from 'fs';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


// ==================== EMAIL ====================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TU_CORREO@gmail.com',
    pass: 'TU_PASSWORD_DE_APLICACION'
  }
});


// ==================== PÁGINAS ====================

export const index = (req, res) => {
  res.render('index', {
    titulo: 'Inicio'
  });
};

export const ocasiones = (req, res) => {
  res.render('ocasiones', {
    titulo: 'Ocasiones'
  });
};

export const contacto = (req, res) => {
  res.render('contacto', {
    titulo: 'Contacto'
  });
};


// ==================== LOGIN ====================

export const loginView = (req, res) => {

  res.render('auth/login', {
    titulo: 'Iniciar sesión'
  });
};

export const loginPost = async (req, res) => {

  const { email, pass } = req.body;

  const usuario = await Usuario.findOne({
    where: { email }
  });

  if (!usuario || !usuario.verificarPassword(pass)) {

    return res.render('auth/login', {
      titulo: 'Iniciar sesión',
      mensaje: 'Credenciales incorrectas'
    });
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipousuario: usuario.tipousuario
    },
    process.env.JWTSECRETO,
    {
      expiresIn: '1d'
    }
  );

  res.cookie('_mitoken', token, {
    httpOnly: true
  });

  if (usuario.tipousuario === 'Admin') {
    return res.redirect('/admin/productos');
  }

  res.redirect('/catalogo');
};


// ==================== REGISTRO ====================

export const registroView = (req, res) => {

  res.render('auth/registro', {
    titulo: 'Registro'
  });
};


export const registroPost = async (req, res) => {

  const {
    nombre,
    email,
    telefono,
    direccion,
    ciudad,
    codigoPostal,
    pass
  } = req.body;

  const existe = await Usuario.findOne({
    where: { email }
  });

  if (existe) {

    return res.render('auth/registro', {
      titulo: 'Registro',
      mensaje: 'El email ya está registrado'
    });
  }

  await Usuario.create({

    nombre,
    email,
    telefono,
    direccion,
    ciudad,
    codigoPostal,
    pass,

    tipousuario: 'User'
  });

  res.render('auth/registro', {
    titulo: 'Registro',
    mensaje: 'Cuenta creada exitosamente'
  });
};
export const perfil = async (req, res) => {

  const usuario = await Usuario.findByPk(
    req.usuario.id
  );

  res.render('perfil', {
    usuario,
    titulo: 'Mi perfil'
  });
};
export const actualizarPerfil = async (req, res) => {

  await Usuario.update({

    nombre: req.body.nombre,
    telefono: req.body.telefono,
    direccion: req.body.direccion,
    ciudad: req.body.ciudad,
    codigoPostal: req.body.codigoPostal

  }, {

    where: {
      id: req.usuario.id
    }

  });

  res.redirect('/perfil');
};
// ==================== LOGOUT ====================

export const logout = (req, res) => {

  res.clearCookie('_mitoken');

  res.redirect('/');
};


// ==================== CATÁLOGO ====================

export const catalogo = async (req, res) => {

  const productos = await Producto.findAll();

  res.render('catalogo', {
    productos,
    titulo: 'Catálogo'
  });
};

export const flores = async (req, res) => {

  const productos = await Producto.findAll({
    where: {
      categoria: 'flor'
    }
  });

  res.render('catalogo', {
    productos,
    titulo: 'Flores'
  });
};

export const ramos = async (req, res) => {

  const productos = await Producto.findAll({
    where: {
      categoria: 'ramo'
    }
  });

  res.render('catalogo', {
    productos,
    titulo: 'Ramos'
  });
};


// ==================== OCASIONES ====================

export const ocasionDetalle = async (req, res) => {

  const tipo = req.params.tipo;

  const productos = await Producto.findAll({
    where: {
      ocasion: tipo
    }
  });

  res.render('catalogo', {
    productos,
    titulo: `Ocasión: ${tipo}`
  });
};


// ==================== CARRITO ====================

export const verCarrito = async (req, res) => {

  const items = await Carrito.findAll({
    where: {
      usuarioId: req.usuario.id
    },
    include: [{
      model: Producto,
      as: 'producto'
    }]
  });

  res.render('carrito', {
    items
  });
};


export const agregarCarrito = async (req, res) => {

  const { productoId } = req.body;

  const existe = await Carrito.findOne({
    where: {
      usuarioId: req.usuario.id,
      productoId
    }
  });

  if (existe) {

    existe.cantidad += 1;

    await existe.save();

  } else {

    await Carrito.create({
      usuarioId: req.usuario.id,
      productoId,
      cantidad: 1
    });
  }

  res.redirect('/carrito');
};


export const eliminarDelCarrito = async (req, res) => {

  await Carrito.destroy({
    where: {
      id: req.params.id,
      usuarioId: req.usuario.id
    }
  });

  res.redirect('/carrito');
};


export const sumarCantidad = async (req, res) => {

  const item = await Carrito.findByPk(req.params.id);

  if (item) {

    item.cantidad += 1;

    await item.save();
  }

  res.redirect('/carrito');
};


export const restarCantidad = async (req, res) => {

  const item = await Carrito.findByPk(req.params.id);

  if (item) {

    if (item.cantidad > 1) {

      item.cantidad -= 1;

      await item.save();

    } else {

      await item.destroy();
    }
  }

  res.redirect('/carrito');
};


// ==================== FACTURA ====================

export const generarFactura = async (req, res) => {
  // 1. Obtener items del carrito
  const items = await Carrito.findAll({
    where: { usuarioId: req.usuario.id },
    include: [{ model: Producto, as: 'producto' }]
  });

  if (items.length === 0) {
    return res.redirect('/carrito');
  }

  // 2. Calcular totales
  let subtotal = 0;
  items.forEach(item => {
    subtotal += item.producto.precio * item.cantidad;
  });
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // 3. Guardar la compra
  const compra = await Compra.create({
    usuarioId: req.usuario.id,
    subtotal,
    iva,
    total: total,
    fecha: new Date()
  });

  // 4. Guardar los detalles de compra
  for (const item of items) {
    await DetalleCompra.create({
      compraId: compra.id,
      productoId: item.productoId,
      cantidad: item.cantidad,
      precio: item.producto.precio
    });
  }

  // 5. Vaciar el carrito del usuario
  await Carrito.destroy({ where: { usuarioId: req.usuario.id } });

  // 6. Obtener datos completos del usuario (para mostrar en factura)
  const usuarioCompleto = await Usuario.findByPk(req.usuario.id);

  // 7. Renderizar la factura
  res.render('factura', {
    items,
    subtotal,
    iva,
    total,
    usuario: usuarioCompleto,
    compraId: compra.id
  });
};


// ==================== PDF ====================

export const generarPDF = async (req, res) => {

  // Obtener última compra del usuario
  const compra = await Compra.findOne({
    where: {
      usuarioId: req.usuario.id
    },
    order: [['createdAt', 'DESC']]
  });

  if (!compra) {
    return res.send('No existe ninguna compra');
  }

  // Obtener detalles de la compra
  const detalles = await DetalleCompra.findAll({
    where: {
      compraId: compra.id
    },
    include: [{
      model: Producto
    }]
  });

  // Obtener usuario completo
  const usuario = await Usuario.findByPk(req.usuario.id);

  const subtotal = compra.total / 1.16;
  const iva = compra.total - subtotal;
  const total = compra.total;

  const ruta = `./public/factura_${Date.now()}.pdf`;

  const doc = new PDFDocument({
    margin: 40
  });

  const stream = fs.createWriteStream(ruta);

  doc.pipe(stream);

  // HEADER
  doc
    .rect(0, 0, 700, 80)
    .fill('#d9ead3');

  doc
    .fillColor('#4d5f4c')
    .fontSize(28)
    .text('🌸 FLOR DE LUNA', 50, 25);

  doc
    .fillColor('#777')
    .fontSize(50)
    .text('FACTURA', 50, 120);

  doc
    .fillColor('#000')
    .fontSize(16)
    .text(`Factura #: ${compra.id}`, 400, 140);

  // DATOS CLIENTE
  doc
    .fontSize(18)
    .fillColor('#4d5f4c')
    .text('DATOS DEL CLIENTE', 50, 230);

  doc
    .fillColor('#000')
    .fontSize(13)
    .text(`Cliente: ${usuario.nombre}`, 50, 260)
    .text(`Correo: ${usuario.email}`, 50, 280)
    .text(`Telefono: ${usuario.telefono || ''}`, 50, 300)
    .text(`Direccion: ${usuario.direccion || ''}`, 50, 320)
    .text(`Ciudad: ${usuario.ciudad || ''}`, 50, 340)
    .text(`CP: ${usuario.codigoPostal || ''}`, 50, 360);

  // TABLA
  let y = 420;

  doc
    .rect(50, y, 500, 30)
    .fill('#d9ead3');

  doc
    .fillColor('#000')
    .fontSize(12)
    .text('Producto', 60, y + 8)
    .text('Cant.', 250, y + 8)
    .text('Precio', 330, y + 8)
    .text('Total', 450, y + 8);

  y += 40;

  detalles.forEach(item => {

    const totalProducto =
      item.precio * item.cantidad;

    doc
      .rect(50, y - 5, 500, 30)
      .stroke();

    doc
      .text(item.producto.nombre, 60, y)
      .text(item.cantidad.toString(), 260, y)
      .text(`$${item.precio}`, 330, y)
      .text(`$${totalProducto}`, 450, y);

    y += 35;

  });

  // TOTALES
  y += 30;

  doc
    .rect(320, y, 230, 100)
    .fill('#eef5ed');

  doc
    .fillColor('#000')
    .fontSize(14)
    .text(`Subtotal: $${subtotal.toFixed(2)}`, 340, y + 20)
    .text(`IVA: $${iva.toFixed(2)}`, 340, y + 45);

  doc
    .fontSize(18)
    .fillColor('#4d5f4c')
    .text(`Total: $${total.toFixed(2)}`, 340, y + 70);

  // MENSAJE
  y += 170;

  doc
    .fillColor('#7c9b7a')
    .fontSize(28)
    .text(
      'MUCHAS GRACIAS 💐',
      140,
      y,
      {
        align: 'center'
      }
    );

  doc.end();

  stream.on('finish', () => {

    res.download(ruta);

  });

};



// ==================== ADMIN ====================

export const adminProductos = async (req, res) => {

  const productos = await Producto.findAll();

  res.render('admin/productos', {
    productos,
    titulo: 'Administrar Productos'
  });
};


export const crearProducto = async (req, res) => {

  if (!req.files || !req.files.imagen) {

    return res.send(
      'Debes subir una imagen'
    );
  }

  const archivo = req.files.imagen;

  const nombreImagen =
    Date.now() + '_' +
    archivo.name.replace(/\s/g, '_');

  await archivo.mv(
    `./public/img/${nombreImagen}`
  );

  await Producto.create({
    nombre: req.body.nombre,
    precio: req.body.precio,
    descripcion: req.body.descripcion,
    imagen: nombreImagen,
    categoria: req.body.categoria,
    ocasion: req.body.ocasion
  });

  res.redirect('/admin/productos');
};


export const editarProductoView = async (req, res) => {

  const producto = await Producto.findByPk(
    req.params.id
  );

  res.render('admin/editarProducto', {
    producto,
    titulo: 'Editar Producto'
  });
};


export const editarProducto = async (req, res) => {

  const datos = {

    nombre: req.body.nombre,

    precio: req.body.precio,

    descripcion: req.body.descripcion,

    categoria: req.body.categoria,

    ocasion: req.body.ocasion
  };

  // SI SUBE NUEVA IMAGEN

  if (req.files && req.files.imagen) {

    const archivo = req.files.imagen;

    const nombreImagen =
      Date.now() + '_' +
      archivo.name.replace(/\s/g, '_');

    await archivo.mv(
      `./public/img/${nombreImagen}`
    );

    datos.imagen = nombreImagen;
  }

  await Producto.update(datos, {
    where: {
      id: req.params.id
    }
  });

  res.redirect('/admin/productos');
};


export const eliminarProducto = async (req, res) => {

  await Producto.destroy({
    where: {
      id: req.params.id
    }
  });

  res.redirect('/admin/productos');
};