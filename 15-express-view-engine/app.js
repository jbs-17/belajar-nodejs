const express = require('express');
const app = express();
const port = 3000;
const expressLayout = require('express-ejs-layouts')

app.set('view engine', 'ejs');
app.use(expressLayout);
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log([req.url, Date.now() - start, 'ms'].join(' '));
  });
  next();
})

app.get('/', (req, res) => {
  let mahasiswa = [
    {
      name: 'Jati B. S.',
      email: 'jbs@email.com'
    },
    {
      name: 'Radtya Ahnaf M',
      email: 'radit.ar@email.com'
    },
    {
      name: 'Novanto Rokim',
      email: 'nova.ro@email.com'
    },
  ]
  res.render('index', { layout: 'layouts/main-layout.ejs', nama: 'Express Web Server', title: 'Home Page', mahasiswa });
});
app.get('/contact', (req, res) => {
  res.render('contact', { layout: 'layouts/main-layout.ejs', title: 'Contect Page' });
});

app.get('/about', (req, res) => {
  res.render('about', { layout: 'layouts/main-layout.ejs', title: 'About Page' });
});

const mahasiswa = require('./mahasiswa.json');

app.get('/mahasiswa/:id', (req, res) => {
  const id = Number(req.params.id);
  const search = mahasiswa.find(m => m.id === id);
  if(!search){
    return res.redirect('/404');
  }
  res.render('mahasiswa', { layout: 'layouts/main-layout.ejs', title: search.nama, search });
});

app.use((req, res, next) => {
  res.status(404).send("Maaf, halaman tidak ditemukan.");
});

app.use('/json', express.json()); //akan stuck terus karena EVENT req on data dan on end sudah dipakai

app.post('/json', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  console.log({ json: req.body });
  console.log("body", req.body);
  res.json({})
})
  .get('/json', (req, res) => {
    res.end('apal')
  })
  .options('/json', (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    res.end();
  })




app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
