import express from 'express'
import mysql from 'mysql'
import fs from 'fs'
import readline from 'readline'
import http from 'http'
import path from 'path'
// const fs = require('fs');
// const readline = require('readline');
// const http = require('http');

const app = express()
const port = 3000
// const expresslayouts = require('express-ejs-layouts')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'skripsitopik',
    connectionLimit: 10
})

//menggunakan ejs
app.set('view engine', 'ejs');
app.use(express.static('styles'));
app.use(express.static(path.resolve('public')));

const dbConnect = () => {
    return new Promise ((resolve, rejects) => {
        pool.getConnection((err, conn) => {
            if(err)
            {
                rejects(err);
            }
            else
            {
                resolve(conn);
            }
        })
    })
}

app.get('/', async (req, res) => {
    const conn = await dbConnect();
    conn.release();
    res.render('login');
})

//halaman dosen
app.get('/dosen/halaman-utama', (req, res) =>{
    res.render('halaman-utama-d');
});

app.get('/dosen/review', (req, res) =>{
    res.render('review');
});

app.get('/dosen/ajukan', (req, res) =>{
    res.render('ajukan-d');
});

//nambah data dosen
const addDosen = (conn, NIK, name , Email, Password) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`INSERT INTO dosen (NIK, name, Email, Password) VALUES
                    ('${NIK}', '${name}', '${Email}', '${Password}')` , (err, result) => {
                        if (err)
                        {
                            rejects(err);
                        }
                        else
                        {
                            resolve(result);
                        }
                    })
    });
};

app.post('/add', async (req, res) => {
    const{NIK, name, Email, Password} = req.body;
    console.log(req.body);
    const conn = await dbConnect();
    const user = await addDosen(conn, NIK, name, Email, Password);
    conn.release();
    res.redirect('pengguna');
});

//ambil data dosen
const getDosen = conn => {
    return new Promise ((resolve, rejects) => {
        conn.query(`SELECT * from dosen`, (err, result) => {
            if (err)
            {
                rejects(err);
            }
            else
            {
                resolve(result);
            }
        })
    })
}

//halaman dosen
app.get('/kelola-akun', async(req, res) => {
    const conn = await dbConnect();
    var dosenData = await getDosen(conn);
    conn.release();
    res.render('kelola-akun', {
        dosenData
    })
})
    


// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });
// const mysql = require('mysql')
// var con = mysql.createConnection({
//   host: "localhost",
//   user: "yourusername",
//   password: "yourpassword"
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });


// app.use(expresslayouts);
app.get('/', (req, res) =>{
    res.render('login');
  });

app.get('/login', (req, res) =>{
    res.render('login');
});

app.get('/signup', (req, res) =>{
    res.render('signup');
});




//halaman kaprodi
// app.get('/kaprodi/home', (req, res) =>{
//     res.render('index',{
//         layout: 'layouts/header-main',
//     });
// });

app.get('/kaprodi/login', (req, res) =>{
    res.render('login');
});

app.get('/kaprodi/halaman-utama', (req, res) =>{
    res.render('halaman-utama-k');
});

app.get('/kaprodi/ajukan', (req, res) =>{
    res.render('ajukan-k');
});

app.get('/kaprodi/review-kelola', (req, res) =>{
    res.render('review-kelola');
});

app.get('/kaprodi/kelola-akun', (req, res) =>{
    res.render('kelola-akun');
});

//halaman mahasiswa


// app.get('/home', (req, res) =>{
//     res.render('home', {
//         layout: 'layouts/main-layouts',
//     });
// });

app.get('/profil', (req, res) => {
  res.send('Nama Dosen');
});

// app.use('/', (req, res) => {
//   res.status(404);
//   res.send('404');
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});