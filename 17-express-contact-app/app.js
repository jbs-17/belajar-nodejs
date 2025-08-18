const express = require('express');
const app = express();
const port = 3000;
const expressLayout = require('express-ejs-layouts');
const { loadContacts, findContact } = require('./utils/contacts.js')


app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(express.static('public'))


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
  const contacts = loadContacts();
  res.render('contact', { layout: 'layouts/main-layout.ejs', title: 'Contect Page', contacts });
});

app.get('/contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama);
  res.render('detail', { layout: 'layouts/main-layout.ejs', title: 'Contact Detail Page', contact });
});



app.get('/about', (req, res) => {
  res.render('about', { layout: 'layouts/main-layout.ejs', title: 'About Page' });
});



app.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.send('query tidak valid');
  res.send(`anda mencari ${q}`);
})


app.use((req, res, next) => {
  res.status(404).send("Maaf, halaman tidak ditemukan.");
});



app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
