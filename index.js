const express = require('express')
const app = express()
const port = 3000
// const expresslayouts = require('express-ejs-layouts')

const fs = require('fs');
const readline = require('readline');
const http = require('http');
app.use(express.static('styles'));
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });
const mysql = require('mysql')
// var con = mysql.createConnection({
//   host: "localhost",
//   user: "yourusername",
//   password: "yourpassword"
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

//menggunakan ejs
app.set('view engine', 'ejs');
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

app.use('/', (req, res) => {
  res.status(404);
  res.send('404');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});