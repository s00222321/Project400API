const jwt = require('jsonwebtoken');

// middleware to authenticate incoming requests using jwt
const authenticateToken = (req, res, next) => {
    // extract token from authorization header (format: 'Bearer <token>')
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    // verify token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
