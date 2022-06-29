import express from 'express'
import mysql from 'mysql'
import fs from 'fs'
import readline from 'readline'
import http from 'http'
import path from 'path'
import session from 'express-session'
import flash from 'express-flash'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

// import popupS from 'popups'
// import { redirect } from 'express/lib/response'
import cookieParser from 'cookie-parser'
// import * as url from 'url';
//     const __dirname = url.fileURLToPath(new URL ('.', import.meta.url))
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

app.use(session({
    secret: 'secret',
    cookie: {maxAge: 900000 },
    saveUninitialized : true,
    resave: true,
    cookie: { secure: true }
}))
// const popupS = require('popups');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

app.get('/', async (req, res) => {
    const conn = await dbConnect();
    conn.release();
    res.render('login', { message : req.flash('message')});
})

const genAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
};

const authToken = {};
const idxAkunD= {};
const idxAkunM= {};
const idxTopik= {};

app.use((req, res, next) => {
    const authTokens = req.cookies['AuthTokens'];
    const idxDTokens = req.cookies['idxDTokens'];
    const idxMTokens = req.cookies['idxMTokens'];
    const idxTTokens = req.cookies['idxTTokens'];
    

    req.user = authToken[authTokens];
    req.idxD= idxAkunD[idxDTokens ];
    req.idxM= idxAkunM[idxMTokens ];
    req.idxT= idxTopik[idxTTokens];
    next();
});

const getUserLogIn = (conn, email) => {
    return new Promise ((resolve, rejects) => {
        const pass= `SELECT password FROM user WHERE email LIKE '${email}'`
        conn.query(`SELECT * FROM user WHERE 
        email LIKE '${email}'`,(err, result) => {
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
app.post('/auth', async (req, res) => {
    const {email, password} = req.body;
    const conn = await dbConnect();
    const user = await getUserLogIn(conn, email);
    console.log(email)
    console.log(password)
    console.log(user)
    conn.release();
    if(user.length>0){
        bcrypt.compare(password, user[0].password).then(function(isMatch) {
            // If the passwords do not match
            if (!isMatch){
                console.log('Password salah')
                req.flash('message', 'Password yang anda masukan salah!');
                res.redirect('/')
            }else{
                console.log('Password benar');
                const authTokens = genAuthToken();
                authToken[authTokens] = user;
                res.cookie('AuthTokens', authTokens)
                if (user[0].peran === 'Dosen') 
                {
                    res.redirect('halaman-utama-d')
                }
                else if (user[0].peran === 'Kaprodi')
                {
                    res.redirect('halaman-utama-k')
                }
                else if (user[0].peran === 'Mahasiswa')
                {
                    res.redirect('halaman-utama-m')
                }
                else
                {
                    res.redirect('/');
                }
            }
        });
    }else{
        console.log('Email salah')
        req.flash('message', 'Email yang anda masukan salah!');
        res.redirect('/')
    }
});
app.set('view engine', 'ejs');
app.use(express.static('styles'));
app.use(express.static(path.resolve('public')));

const delPengguna = (conn, idPerson) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`DELETE FROM user WHERE idPerson = ${idPerson}` , (err, result) => {
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

app.get('/delete/(:idPerson)', async (req, res) => {
    const {idPerson} = req.params;
    console.log(req.body);
    const conn = await dbConnect();
    var delUser = await delPengguna(conn, idPerson);
    conn.release();
    res.redirect(req.get('referer'));
});

    


app.get('/review', (req, res) =>{
 
    const getTopik = [
        {
            id : 1,
            judul : 'Pembuatan Aplikasi Pendeteksi WebShell berdasarkan HTTP Access Log',
            name : 'Asd',
            semester : 'ganjil',
            status : 'NULL',
            jurusan : 'Computer Science',
            tahun : 2010,
            keterangan : 'Salah satu cara agar actor tetap memiliki akses terhadap server adalah dengan menanamkan webshell. Webshell digunakan agar actor dapat menjalankan command-command pada server, melalui script yang dipasang di webserver.'
        },
        {
            id : 1,
            judul : 'Pembuatan Aplikasi Pendeteksi WebShell berdasarkan HTTP Access Log',
            name : 'Asd',
            semester : 'ganjil',
            status : 'NULL',
            jurusan : 'Computer Science',
            tahun : 2010,
            keterangan : 'Salah satu cara agar actor tetap memiliki akses terhadap server adalah dengan menanamkan webshell. Webshell digunakan agar actor dapat menjalankan command-command pada server, melalui script yang dipasang di webserver.'
        }
    ]
    res.render('review', {
        getTopik,
    });
});


const addTopik = (conn, bidangPeminatan, namaT, semester, deskripsi) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`INSERT INTO topik (bidangPeminatan, namaT, semester, deskripsi) VALUES
                    ('${bidangPeminatan}', '${namaT}', '${semester}', '${deskripsi}')` , (err, result) => {
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
app.get('/ajukan-d', (req, res) =>{
    if (req.user && req.user[0].peran === "Dosen")
    {
        res.render('ajukan-d');
    }
    else
    {
        res.redirect('/');
    }
});
app.post('/addT', async (req, res) => {
    const{bidangPeminatan, namaT, semester, deskripsi} = req.body;
    console.log(req.body);
    const conn = await dbConnect();
    const user = await addTopik(conn, bidangPeminatan, namaT, semester, deskripsi);
    conn.release();
    res.redirect('/ajukan-d');
});
app.post('/addT1', async (req, res) => {
    const{bidangPeminatan, namaT, semester, deskripsi} = req.body;
    console.log(req.body);
    const conn = await dbConnect();
    const user = await addTopik(conn, bidangPeminatan, namaT, semester, deskripsi);
    conn.release();
    res.redirect('/ajukan-k');
});
//nambah data Mahasiswa
const addMahasiswa = (conn, NPM, name , email, password, peran) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`INSERT INTO user (NPM, name, email, password, peran) VALUES
                    ('${NPM}', '${name}', '${email}', '${password}', '${peran}')` , (err, result) => {
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

app.post('/addMahasiswa', async (req, res) => {
    const{NPM, name, email, password, peran} = req.body;
    console.log(req.body);
    const conn = await dbConnect();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const user = await addMahasiswa(conn, NPM, name, email, hash, peran);
    conn.release();
    res.redirect('/kelola-akun-m');
    
});

//nambah data dosen
const addDosen = (conn, NIK, name , email, password, peran) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`INSERT INTO user (NIK, name, email, password, peran) VALUES
                    ('${NIK}', '${name}', '${email}', '${password}', '${peran}')` , (err, result) => {
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

app.post('/addDosen', async (req, res) => {
    const{NIK, name, email, password, peran} = req.body;
    console.log(req.body);
    const conn = await dbConnect();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const user = await addDosen(conn, NIK, name, email, hash, peran);
    conn.release();
    res.redirect('/kelola-akun-d');
});
const getTopikM = conn => {
    return new Promise ((resolve, rejects) => {
        conn.query(`SELECT * from topik WHERE status= 'OPEN'`, (err, result) => {
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
//ambil data topik
const getTopik = conn => {
    return new Promise ((resolve, rejects) => {
        conn.query(`SELECT * from topik`, (err, result) => {
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
//halaman topik
app.get('/review-kelola', async(req, res) => {
    const conn = await dbConnect();
    var topikData = await getTopik(conn);
    conn.release();
    res.render('review-kelola', {
        topikData
    })
})

//ambil data dosen
const getDosen = conn => {
    return new Promise ((resolve, rejects) => {
        conn.query(`SELECT * from user WHERE peran LIKE 'Dosen'`, (err, result) => {
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
app.get('/kelola-akun-d', async(req, res) => {
    const conn = await dbConnect();
    var dosenData = await getDosen(conn);
    conn.release();
    res.render('kelola-akun-d', {
        dosenData
    })
})

//ambil data mahasiswa
const getMahasiswa = conn => {
    return new Promise ((resolve, rejects) => {
        conn.query(`SELECT * from user WHERE peran LIKE 'Mahasiswa'`, (err, result) => {
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

//halaman mahasiswa
app.get('/kelola-akun-m', async(req, res) => {
    const conn = await dbConnect();
    var mahasiswaData = await getMahasiswa(conn);
    conn.release();
    console.log(req.user);
    console.log(req.idxM);
    res.render('kelola-akun-m', {
        mahasiswaData
    })
})
    




// app.use(expresslayouts);
app.get('/', (req, res) =>{
    res.render('login');
  });

app.get('/login', (req, res) =>{
    res.render('login');
});

app.get('/addAkunD', (req, res) =>{
    if (req.user && req.user[0].peran === "Kaprodi")
    {
        res.render('addAkunD');
    }
    else
    {
        res.redirect('/');
    }
});
app.get('/addAkunM', (req, res) =>{
    if (req.user && req.user[0].peran === "Kaprodi")
    {
        res.render('addAkunM');
    }
    else
    {
        res.redirect('/');
    }
});

app.get('/halaman-utama-k', (req, res) =>{
    if (req.user && req.user[0].peran=== "Kaprodi")
    {
        const getProfil=[{
            nama: req.user[0].name,
            email: req.user[0].email,
            nik: req.user[0].NIK,
            peran: req.user[0].peran
        }]
        console.log(req.user[0].name);
        res.render('halaman-utama-k', {
            getProfil,
        });
    }
    else
    {
        res.redirect('/');
    }
});
app.get('/halaman-utama-d', (req, res) =>{
    if (req.user && req.user[0].peran=== "Dosen")
    {
        const getProfil=[{
            nama: req.user[0].name,
            email: req.user[0].email,
            nik: req.user[0].NIK,
            peran: req.user[0].peran
        }]
        console.log(req.user[0].name);
        res.render('halaman-utama-d', {
            getProfil,
        });
    }
    else
    {
        res.redirect('/');
    }
});

app.get('/ajukan-k', (req, res) =>{
    
    if (req.user && req.user[0].peran=== "Kaprodi")
    {
        res.render('ajukan-k');
    }
    else
    {
        res.redirect('/');
    }
});

app.get('/review-kelola', (req, res) =>{
 
        const getTopik = [
            {
                id : 1,
                judul : 'Pembuatan Aplikasi Pendeteksi WebShell berdasarkan HTTP Access Log',
                name : 'Asd',
                semester : 'ganjil',
                status : 'NULL',
                jurusan : 'Computer Science',
                tahun : 2010,
                keterangan : 'Salah satu cara agar actor tetap memiliki akses terhadap server adalah dengan menanamkan webshell. Webshell digunakan agar actor dapat menjalankan command-command pada server, melalui script yang dipasang di webserver.'
            },
            {
                id : 1,
                judul : 'Pembuatan Aplikasi Pendeteksi WebShell berdasarkan HTTP Access Log',
                name : 'Asd',
                semester : 'ganjil',
                status : 'NULL',
                jurusan : 'Computer Science',
                tahun : 2010,
                keterangan : 'Salah satu cara agar actor tetap memiliki akses terhadap server adalah dengan menanamkan webshell. Webshell digunakan agar actor dapat menjalankan command-command pada server, melalui script yang dipasang di webserver.'
            }
        ]
        res.render('review-kelola', {
            getTopik,
        });
    });

//halaman mahasiswa

app.get('/halaman-utama-m', async(req, res) => {
    
    if (req.user && req.user[0].peran=== "Mahasiswa")
    {
        const conn = await dbConnect();
        var topikData = await getTopikM(conn);
        conn.release();
        res.render('halaman-utama-m', {
            topikData
        })
    }
    else
    {
        res.redirect('/');
    }
})

//halaman mahasiswa

app.get('/halaman-topik-d', async(req, res) => {
    if (req.user && req.user[0].peran=== "Dosen")
    {
        const conn = await dbConnect();
        var topikData = await getTopik(conn);
        conn.release();
        res.render('halaman-topik-d', {
            topikData
        })
    }
    else
    {
        res.redirect('/');
    }
})
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


app.get('/halaman-utama-m', (req, res) =>{
    res.render('halaman-utama-m');
});

//edit mahasiswa
const getUserIdx = (conn, idPerson) => {
    return new Promise ((resolve, rejects) => {
        conn.query (`SELECT * FROM user WHERE idPerson = ${idPerson}`, (err, result) => {
            
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

app.get('/edit-m/(:idPerson)', async (req, res) => {
    const{idPerson} = req.params;
        console.log(req.params);
        const conn = await dbConnect();
        const idxM = await getUserIdx(conn, idPerson);
        const idx2 = genAuthToken();
        idxAkunM[idx2] = idxM;
        res.cookie('idxMTokens', idx2)
        conn.release();
        res.render('edit-m', {
        idxM
        })
})

const updatePenggunaM = (conn,npm , name, email, password,idPerson) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`UPDATE user SET NPM= '${npm}',name = '${name}', email = '${email}', password = '${password}' WHERE
                        idPerson = '${idPerson}'` , (err, result) => {
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

app.post('/editUserM', async (req, res) => {
    
        const{NPM , name, email, password,peran,idPerson} = req.body;
        console.log(req.body);
        const conn = await dbConnect();
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const idx = await updatePenggunaM(conn,NPM , name, email, hash, req.idxM[0].idPerson);
        conn.release();
        res.redirect('kelola-akun-m');
    
});
//edit dosen
app.get('/edit-d/(:idPerson)', async (req, res) => {
    const{idPerson} = req.params;
        console.log(req.params);
        const conn = await dbConnect();
        const idxD = await getUserIdx(conn, idPerson);
        const idx1 = genAuthToken();
        idxAkunD[idx1] = idxD;
        res.cookie('idxDTokens', idx1)
        conn.release();
        res.render('edit-d', {
            idxD
        })
})

const updatePenggunaD = (conn,nik , name, email, password,peran,idPerson) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`UPDATE user SET NIK= '${nik}',name = '${name}', email = '${email}', password = '${password}', 
         peran = '${peran}' WHERE
                        idPerson = '${idPerson}'` , (err, result) => {
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

app.post('/editUserD', async (req, res) => {
    
        const{NIK , name, email, password,peran,idPerson} = req.body;
        console.log(req.body);
        const conn = await dbConnect();
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const idx = await updatePenggunaD(conn,NIK , name, email, hash,peran, req.idxD[0].idPerson);
        conn.release();
        res.redirect('kelola-akun-d');
    
});

//edit topik
const getTopikIdx = (conn, idT) => {
    return new Promise ((resolve, rejects) => {
        conn.query (`SELECT * FROM topik WHERE idT = ${idT}`, (err, result) => {
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

app.get('/update/(:idT)', async (req, res) => {
    const{idT} = req.params;
        console.log(req.params);
        const conn = await dbConnect();
        var updtTopik = await getTopikIdx(conn, idT);
        conn.release();
        res.render('update', {
            updtTopik
        })
})

const editTopik = (conn, idT, namaT, bidangPeminatan, deskripsi, semester, status) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`UPDATE topik SET namaT = '${namaT}', bidangPeminatan = '${bidangPeminatan}', 
        deskripsi = '${deskripsi}', semester = '${semester}', status= '${status}' WHERE
                        idT = '${idT}'` , (err, result) => {
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

app.post('/updatingTopik', async (req, res) => {
    
        const{idT, namaT, bidangPeminatan, deskripsi, semester, status} = req.body;
        console.log(req.body);
        const conn = await dbConnect();
        const topik = await editTopik(conn,idT, namaT, bidangPeminatan, deskripsi, semester, status);
        conn.release();
        res.redirect('review-kelola');
    
    
});
const delTopik = (conn, idT) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`DELETE FROM topik WHERE idT = ${idT}` , (err, result) => {
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

app.get('/deleteTopik/(:idT)', async (req, res) => {
    const {idT} = req.params;
    console.log(req.body);
    const conn = await dbConnect();
    var delT = await delTopik(conn, idT);
    conn.release();
    res.redirect(req.get('referer'));
});

//ambil topik
app.get('/ambil/(:idT)', async (req, res) => {
    const{idT} = req.params;
        console.log(req.params);
        const conn = await dbConnect();
        const idxT = await getTopikIdx(conn, idT);
        const idx3 = genAuthToken();
        idxTopik[idx3] = idxT;
        res.cookie('idxTTokens', idx3)
        conn.release();
        res.render('ambil', {
            idxT
        })
})

const updateTopik = (conn,idPerson, idT) => {
    return new Promise ((resolve, rejects) => {
        conn.query(`UPDATE topik SET status= '${"TAKEN"}', idPerson= '${idPerson}' WHERE
                        idT = '${idT}'` , (err, result) => {
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

app.post('/sedang-mengambil-topik', async (req, res) => {
        const conn = await dbConnect();
        const idx = await updateTopik(conn,req.user[0].idPerson, req.idxT[0].idT);
        conn.release();
        res.redirect('halaman-utama-m');
    
});
