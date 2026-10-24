//Checa el token y ve si se tardó en utilizarlo para que ya no funcione (IA)
import jwt from "jsonwebtoken";

//Revisa que el usuario haya iniciado sesión (IA)
export function requiereLogin(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? "").split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta el token de sesión" });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

//Revisa que el usuario tenga el rol que se necesita (IA)
export const requiereRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario?.rol)) {
    return res.status(403).json({ error: "No tienes permiso para esta acción" });
  }
  next();
};
