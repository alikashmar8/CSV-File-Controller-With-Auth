import express from 'express';
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')
const { Pool } = require("pg");
const csvParser = require('csv-parser')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const constants = require('../constants');
const app = express();
app.use(express.static('public'), fileupload(), bodyParser.urlencoded({ limit: '10mb' }))
const headers = constants.headers;
const connectionString = constants.connectionString;
const pool = new Pool({
    connectionString: connectionString
});

exports.getAll = async function (req: any, res: any) {
    if (req.token.type == 0) {
        try {
            pool.query(`SELECT * FROM csv_files`, (err: any, result: any) => {
                if (err) res.send(err);
                if (result.rows.length == 0) {
                    res.send({ message: "No Files Found!" })
                }
                else {
                    res.send(result.rows);
                }
            })
        } catch (e) {
            res.end(JSON.stringify(e));
        }
    } else {
        try {
            pool.query(`SELECT * FROM csv_files where creator_id = $1`, [req.token.id], (err: any, result: any) => {
                if (err) res.send(err);
                if (result.rows.length == 0) {
                    res.send({ message: "No Files Found!" })
                }
                else {
                    res.send(result.rows);
                }
            })
        } catch (e) {
            res.end(JSON.stringify(e));
        }
    }
}

exports.store = async function (req: any, res: any) {
    let results: any[] = [];
    await fs.createReadStream(req.files.csvFile.name).pipe(csvParser({}))
        .on('data', (data: any) => results.push(data))
        .on('end', async () => {

            let csvFile = {
                id: uuidv4(),
                name: req.files.csvFile.name,
                date: Date.now(),
                records: JSON.stringify(results),
                creator_id: req.token.id
            };

            pool.query(`INSERT INTO csv_files  (id, name, date, records, creator_id) VALUES ($1, $2, $3, $4, $5)`, [csvFile.id, csvFile.name, csvFile.date, csvFile.records, csvFile.creator_id], (err: any, results: any) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        message: "Saved Successfully!",
                        csvFile
                    });
                }
            })
        })
}

exports.findById = async function (req: any, res: any) {
    try {
        pool.query(`SELECT * FROM csv_files where id = $1`, [req.params.id], (err: any, result: any) => {
            if (err) res.send(err);
            if (result.rows.length == 0) {
                res.send({ message: "No File Found!" })
            }
            else {
                let file = result.rows[0];
                if (file.creator_id == req.token.id || req.token.type == 0) {
                    res.send(file);
                } else {
                    res.send({ message: 'Unauthorized' });
                }
            }
        })
    } catch (e) {
        res.end(JSON.stringify(e));
    }

}

exports.delete = async function (req: any, res: any) {
    try {
        pool.query(`SELECT * FROM csv_files where id = $1`, [req.params.id], (err: any, results: any)=>{
            if(err){
                res.send(err);
            }else{
                if(results.rows.length == 0){
                    res.send({ message: 'File Not Found!'});
                }else{
                    let file = results.rows[0];
                    if(file.creator_id == req.token.id || req.token.type == 0){
                        pool.query(`DELETE  FROM csv_files where id = $1`, [req.params.id], (err: any, result: any) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send('Deleted Successfully');
                            }
                        })
                    }else{
                        res.send({ message: 'Unauthorized!' });
                    }
                }
            }
        })
    } catch (e) {
        res.end(JSON.stringify(e));
    }

}