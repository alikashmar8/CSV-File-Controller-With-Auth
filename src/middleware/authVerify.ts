const jwt = require('jsonwebtoken');

exports.isAuth = function(req: any, res: any, next: any){
    const token = req.header('token');
    if(!token) return res.status(401).send({ message: 'Unauthorized'});

    try{
        const verified = jwt.verify(token, 'secret');
        req.token = verified;
        next();
    }catch(err){
        res.status(400).send({ message: 'Invalid Token' });
    }
}
