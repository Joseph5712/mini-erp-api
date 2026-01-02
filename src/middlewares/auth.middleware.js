const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    try {
        // 1) Leer header Authorization
        const authHeader = req.headers.authorization;

        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const err = new Error("Missing or invalid Authorization header");
            err.statusCode = 401;
            throw err;
        }

        // 2) Separar "Bearer" del token
        const token = authHeader.split(" ")[1];

        // 3) Verificar token (firma + expiración)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // 4) Guardar el usuario decodificado en req para usarlo en rutas
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return next(error);
    }
}

module.exports = { requireAuth };