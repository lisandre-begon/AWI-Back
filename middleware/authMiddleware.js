const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Accès interdit, token manquant' });
    }

    const token = authHeader.split(' ')[1]; // Extrait le token après "Bearer"
    if (!token) {
        return res.status(403).json({ message: 'Accès interdit, token invalide' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded; // Ajoute l'utilisateur dans req pour l'utiliser plus tard
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};
