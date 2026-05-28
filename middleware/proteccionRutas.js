import jwt from 'jsonwebtoken';

export const rutaprotegida = (req, res, next) => {

  const { _mitoken } = req.cookies || {};

  if (!_mitoken) {
    return res.redirect('/login');
  }

  try {

    const data = jwt.verify(
      _mitoken,
      process.env.JWTSECRETO
    );

    req.usuario = data;

    next();

  } catch (error) {

    res.clearCookie('_mitoken');
    res.redirect('/login');
  }
};

export const soloAdmin = (req, res, next) => {

  if (
    req.usuario &&
    req.usuario.tipousuario === 'Admin'
  ) {
    return next();
  }

  return res.status(403).send('Acceso denegado');
};
