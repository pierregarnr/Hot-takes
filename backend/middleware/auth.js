const jwt = require('jsonwebtoken');

const { TOKEN_SECRET } = process.env;

// Si aucun token secret n'a été enregistré ds notre .env
if (!TOKEN_SECRET) throw new Error('TOKEN_SECRET must be set in .env')

module.exports = (req, res, next) => {
    try {
        const header = req.headers.authorization;
        const token = header.split(' ')[1];
        const decodedToken = jwt.verify(token, TOKEN_SECRET);
        req.reqdata = decodedToken;
        if (req.body.userId && req.body.userId !== req.reqdata.userId) {
            throw 'Invalid user ID';
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};
