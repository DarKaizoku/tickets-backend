// imports
const express = require('express');
require('dotenv').config() // permet de cacher les donnée dans un autrs fichier .env
const { Client } = require('pg');
const fs = require('fs');

// declarations
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

        data.rowCount >= 1 ? res.status(200).json({ status: "SUCCESS", data: data.rows }) : res.status(200).json({ status: "NOT FOUND" });

    }
    catch (err) {

        res.status(400).json({ status: "BAD REQUEST" });
        console.log("!!! ERREUR !!!");
    }
});
app.get("/tickets/:id", async (req, res) => {
    try {
        
        const id = req.params.id;

        const sql = 'select * from tickets where id = $1';

        const data = await client.query(sql, [id]);

        data.rowCount === 1 ? res.status(200).json({ status: "SUCCESS", data: data.rows }) : res.status(200).json({ status: "NOT FOUND" });

        //res.status(200).json(data.rows[0]);

    }
    catch (err) {
        res.status(500).json({ status: "!!! ERREUR !!!" });
        /* res.status(404).json({status:"NOT FOUND"});
        res.status(400).json({status:"BAD REQUEST"});
        console.log("!!! ERREUR !!!"); */
    }
})
app.post("/tickets", async (req, res) => {
    try {
        const newRequest = req.body.message;

        const sql = 'insert into tickets (message) values ($1)';

        const data = await client.query(sql, [newRequest]);

        res.status(201).json({ status: "CREATED", data: req.body })

    } catch (error) {
        res.status(404).json({ status: "BAD REQUEST" });
        res.status(400).json({ status: "BAD REQUEST" });
        console.log("!!! ERREUR !!!");
    }
})
app.put("/tickets/:id", async (req, res) => {
    try {

        const id = req.params.id;
        const message = req.body.message;
        const done = req.body.done;

        const sql = 'update tickets set (done,message) = ($3,$2) where id = $1';

        const data = await client.query(sql, [id,message,done]);

        data.rowCount === 1 ? res.status(200).json({ status: "NO CONTENT", done: "changed" }) : res.status(400).json({ status: "NO CONTENT", done: false ,conseil:"vérifiez votre numéro de ticket"});

    } catch (error) {
        res.status(404).json({ status: "BAD REQUEST" });
        res.status(405).json({ status: "METHOD NOT ALLOWED" });
        console.log("!!! ERREUR !!!");
    }
})
app.delete("/tickets/:id", async (req, res) => {
    try {

        const id = req.params.id;

        const sql = 'delete from tickets where id = $1';

        const data = await client.query(sql, [id]);

        data.rowCount === 1 ? res.status(200).json({ status: "NO CONTENT", deleted: true }) : res.status(400).json({ status: "NO CONTENT", deleted: false ,conseil:"vérifiez votre numéro de ticket"});

    } catch (error) {
        res.status(404).json({ status: "BAD REQUEST" });
        res.status(400).json({ status: "BAD REQUEST" });
        console.log("!!! ERREUR !!!");
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})