const express = require('express');
const { body, validationResult, check } = require('express-validator')
const app = express();
const port = 3000;
const expressLayout = require('express-ejs-layouts');
const { loadContacts, findContact, addContact, cekDuplikat } = require('./utils/contacts.js')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
  'cookie': { 'maxAge': 6000 },
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());



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
  res.render('contact', { layout: 'layouts/main-layout.ejs', title: 'Contect Page', contacts, msg: req.flash('msg') });
});

app.get('/contact/add', (req, res) => {
  res.render('add-contact', { layout: 'layouts/main-layout.ejs', title: 'Add Contect Page', errors: undefined });
});

app.post('/contact/add',
  [
    body('email', 'email invalid').isEmail(),
    body('noHP').isMobilePhone('id-ID').withMessage('invalid Indonesia phone number'),
    body('nama').custom((value) => {
      const double = cekDuplikat(value);
      if (double) throw new Error('Contact Name alredy used! use other contact name!');
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', { layout: 'layouts/main-layout', title: 'Add Contect Page', errors: errors.array() })
    }
    addContact(req.body);
    req.flash('msg', 'Contact added!');
    res.redirect('/contact');
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
