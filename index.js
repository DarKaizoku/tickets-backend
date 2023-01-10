const express = require('express');
require('dotenv').config()
const { Client } = require('pg');
const fs = require('fs');

const app = express();
const port = 8000;
const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

client.connect();

app.use(express.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/' | '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();

});

app.get("/tickets", async (req, res) => {
    try {
        const data = await client.query('select * from tickets order by id');

        data.rowCount >= 1 ? res.status(200).json({ status: "SUCCESS", data: data.rows }) : res.status(200).json({ status: "NOT FOUND" ,message: "tableau vide !!"});

    }
    catch (err) {
        res.redirect()
        res.status(400).json({ status: "BAD REQUEST" });
    }
});
app.get("/tickets/:id", async (req, res) => {
    try {

        const id = req.params.id;
        console.log(id);
        const dataId = await client.query('select id from tickets order by id');
        const realId = dataId.rows.map(data => data.id);

        const sql = 'select * from tickets where id = $1';
        const data = await client.query(sql, [id]);

        if(realId.includes(parseInt(id))){

            data.rowCount === 1 ? res.status(200).json({ status: "SUCCESS", data: data.rows }) : res.status(200).json({ status: "NOT FOUND" }) }

        else {
            res.json({ status: "NOT FOUND", conseil: "vérifiez votre id dans la liste suivante", list: realId }) ;
        }


    }
    catch (err) {

        res.status(404).json({ status: "NOT FOUND" });
        res.status(400).json({ status: "BAD REQUEST" });

    }
})
app.post("/tickets", async (req, res) => {
    try {
        const newRequest = req.body.message;

        const sql = 'insert into tickets (message) values ($1) returning *';

        const data = await client.query(sql, [newRequest]);

        res.status(201).json({ status: "CREATED", data: data.rows })

    } catch (error) {
        res.status(404).json({ status: "BAD REQUEST" });
        res.status(400).json({ status: "BAD REQUEST" });
    }
})
app.put("/tickets/:id", async (req, res) => {
    try {

        const id = req.params.id;
        const message = req.body.message;
        const done = req.body.done;

        const sql = 'update tickets set (done,message) = ($3,$2) where id = $1';

        const data = await client.query(sql, [id, message, done]);

        data.rowCount === 1 ? res.status(200).json({ status: "NO CONTENT", done: "changed" }) : res.status(400).json({ status: "NO CONTENT", done: false, conseil: "vérifiez votre numéro de ticket" });

    } catch (error) {
        res.status(404).json({ status: "BAD REQUEST" });
        res.status(405).json({ status: "METHOD NOT ALLOWED" });
    }
})
app.delete("/tickets/:id", async (req, res) => {
    try {

        const id = req.params.id;

        const sql = 'delete from tickets where id = $1';
        const dataId = await client.query('select * from tickets where id = $1',[id]);

        const data = await client.query(sql, [id]);

        data.rowCount === 1 ? res.status(200).json({ status: "NO CONTENT", deleted: true ,lastSave: dataId.rows}) : res.status(400).json({ status: "NO CONTENT", deleted: false, conseil: "vérifiez votre numéro de ticket" });

    } catch (error) {
        res.status(404).json({ status: "BAD REQUEST" });
        res.status(400).json({ status: "BAD REQUEST" });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})