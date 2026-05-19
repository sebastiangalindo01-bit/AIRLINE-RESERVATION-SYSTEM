import jwt from 'jsonwebtoken';

const DEV_JWT_SECRET = 'dev-jwt-secret-change-me';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && String(secret).trim() !== '') {
    return secret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_JWT_SECRET;
  }

  return null;
}

function unauthorized(res, message = 'No autorizado') {
  return res.status(401).json({ ok: false, message });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token no proporcionado');
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return unauthorized(res, 'Configuración del servidor inválida');
    }

    const payload = jwt.verify(token, jwtSecret);
    req.user = payload; // { sub, email, name, role }
    return next();
  } catch (err) {
    return unauthorized(res, 'Token inválido o expirado');
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return unauthorized(res);
    const role = user.role || user.rol || null;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ ok: false, message: 'Acceso prohibido' });
    }
    next();
  };
}

export default { authenticateToken, authorizeRoles };
