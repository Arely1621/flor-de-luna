import express from 'express';
import * as ctrl from '../controllers/vistasController.js';
import { rutaprotegida, soloAdmin } from '../middleware/proteccionRutas.js';
import { Usuario } from '../models/Usuario.js';
import { Compra } from '../models/Compra.js';

import { DetalleCompra } from '../models/DetalleCompra.js';

import { Carrito } from '../models/Carrito.js';

import { Producto } from '../models/Producto.js';
const router = express.Router();

// Públicas
router.get('/', ctrl.index);
router.get('/ocasiones', ctrl.ocasiones);
router.get('/contacto', ctrl.contacto);
router.get('/flores', ctrl.flores);
router.get('/ramos', ctrl.ramos);

// Autenticación
router.get('/login', ctrl.loginView);
router.post('/login', ctrl.loginPost);
router.get('/registro', ctrl.registroView);
router.post('/registro', ctrl.registroPost);
router.get('/logout', ctrl.logout);
router.get(
  '/perfil',
  rutaprotegida,
  ctrl.perfil
);
router.get('/perfil/editar', async (req, res) => {

    if(!req.usuario){
        return res.redirect('/login');
    }

    const usuario = await Usuario.findByPk(req.usuario.id);

    res.render('editarPerfil', {
        usuario
    });

});
router.post('/perfil/editar', async (req, res) => {

    if(!req.usuario){
        return res.redirect('/login');
    }

    const usuario = await Usuario.findByPk(req.usuario.id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    usuario.telefono = req.body.telefono;
    usuario.direccion = req.body.direccion;
    usuario.ciudad = req.body.ciudad;
    usuario.codigoPostal = req.body.codigoPostal;

    await usuario.save();

    res.redirect('/perfil');

});
// Catálogo (protegido)
router.get('/catalogo', rutaprotegida, ctrl.catalogo);
router.get('/ocasiones/:tipo', rutaprotegida, ctrl.ocasionDetalle)

// Carrito (protegido)
router.get('/carrito', rutaprotegida, ctrl.verCarrito);
router.post('/agregar-carrito', rutaprotegida, ctrl.agregarCarrito);
router.get('/eliminar-carrito/:id', rutaprotegida, ctrl.eliminarDelCarrito);

//factura
router.post('/factura', rutaprotegida, ctrl.generarFactura);
router.post('/sumar/:id', rutaprotegida, ctrl.sumarCantidad);
router.post('/restar/:id', rutaprotegida, ctrl.restarCantidad);
router.get('/factura/pdf', rutaprotegida, ctrl.generarPDF);

// Admin (protegido + soloAdmin)
router.get('/admin/productos', rutaprotegida, soloAdmin, ctrl.adminProductos);
router.post('/admin/crear-producto', rutaprotegida, soloAdmin, ctrl.crearProducto);
router.get('/admin/editar-producto/:id', rutaprotegida, soloAdmin, ctrl.editarProductoView);
router.post('/admin/editar-producto/:id', rutaprotegida, soloAdmin, ctrl.editarProducto);
router.get('/admin/eliminar-producto/:id', rutaprotegida, soloAdmin, ctrl.eliminarProducto);



export default router;