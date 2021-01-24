import  { Request } from 'express';
const constants = require('../constants');
const { Pool } = require("pg");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const connectionString = constants.connectionString;
const pool = new Pool({
    connectionString: connectionString
});

exports.register = function (req: Request, res: any) {
    let { name, email, password } = req.body;

    let errors: { message: string; }[] = [];
    if (!name || !email || !password) {
        errors.push({ message: "Please enter all fields" });
        res.send(errors)
    }

    if (!emailIsValid(email)) {
        errors.push({ message: "Please enter a valid email address" })
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be atleast 6 characters" });
    }

    if (errors.length > 0) {
        res.send(errors);
    } else {
        pool.query(`select * from users where email = $1`, [email], (err: any, result: any) => {
            if (err) {
                throw err;
            }
            if (result.rows.length > 0) {
                errors.push({ message: "Email already registered!" });
                res.send(errors);
            } else {

                let id = uuidv4();
                bcrypt.hash(password, 10, function (err: any, hash: string) {
                    pool.query(`INSERT INTO users (id, name, email, password, type) VALUES ($1, $2, $3, $4, $5)`, [id, name, email, hash, 1], (err: any, result: any) => {
                        if (err) {
                            res.send(err)
                        } else {
                            res.send({ message: "Registration successfull!" })
                        }
                    })
                });
            }
        })
    }
}

exports.logout = function (req: Request, res: any) {
    var token = jwt.sign({}, 'secret', { expiresIn: '1s' });
    res.send({ token: token });
}

exports.login = (req: Request, res: any) => {

    let { email, password } = req.body;
    let errors: { message: string; }[] = [];
    
    if (!email || !password) {
        errors.push({ message: "Please enter all fields" });
        res.send(errors)
    }

    if (!emailIsValid(email)) {
        errors.push({ message: "Please enter a valid email address" })
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be atleast 6 characters" });
    }

    if (errors.length > 0) {
        res.send(errors);
    } else {
        pool.query(`select * from users where email = $1`, [email], (err: any, result: any) => {
            if (err) {
                res.send(err);
            }
            if (result.rows.length > 0) {
                const user = result.rows[0];
                bcrypt.compare(password, user.password, function (err: any, result: any) {
                    if (result) {

                        var token = jwt.sign(user, 'secret', { expiresIn: '1h' });
                        res.header('token', token).send({ token });

                    } else {
                        res.send({ message: "Password Incorrect" });
                    }
                });
            } else {
                errors.push({ message: "Email not found!" });
                res.send(errors);
            }
        })
    }

}

function emailIsValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


