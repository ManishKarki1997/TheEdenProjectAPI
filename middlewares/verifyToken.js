const jwt = require('jsonwebtoken');

function verifyJWTToken(req, res, next) {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null)
        return res.sendStatus(401).send({
            error: true,
            message: 'No Authorization Header Present'
        });

    jwt.verify(token, 'randomjsonwebtokenfornow999', (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })

}

module.exports = verifyJWTToken;