import express from 'express';
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')
const { Pool } = require("pg");
const constants = require('../constants');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.static('public'), fileupload(), bodyParser.urlencoded({ limit: '10mb' }))
const headers = constants.headers;
const connectionString = constants.connectionString;

const pool = new Pool({
    connectionString: connectionString
});


exports.findById = async function (req: any, res: any) {
    try {
        pool.query(`SELECT * FROM users where id = $1`, [req.params.id], (err: any, result: any) => {
            if (err) res.send(err);
            if (result.rows.length == 0) {
                res.send({ message: "No User Found!" })
            }
            else {
                let user = result.rows[0];
                res.send(user);
            }
        }
        )
    } catch (e) {
        res.writeHead(500, headers);
        res.end(JSON.stringify(e));
    }
}

exports.update = async function (req: any, res: any) {
    if (req.token.id == req.params.id) {
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
            try {
                pool.query(`select * from users where email = $1`, [email], (err: any, result: any) => {
                    if (err) {
                        res.send(err);
                    }
                    if (result.rows.length == 0) {
                        bcrypt.hash(password, 10, function (err: any, hash: string) {
                            pool.query(`UPDATE users SET name=$1, email=$2, password=$3  where id = $4   RETURNING *;`, [name, email, hash, req.params.id], (err: any, result: any) => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    let user = result.rows[0];
                                    res.send({ message: "User Updated!", user })
                                }
                            }
                            )
                        });
                    } else {
                        res.send({ message: 'Email Already In Use!' });
                    }
                });
            } catch (e) {
                res.end(JSON.stringify(e));
            }
        }
    } else {
        res.send({ message: "Unauthorized!" })
    }
}

function emailIsValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}