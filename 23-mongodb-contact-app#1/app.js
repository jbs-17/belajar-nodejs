const express = require('express');
const { body, validationResult, check } = require('express-validator')
const app = express();
const port = 3000;
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash'); //pengirim pesan satu kali untuk render halaman berikutnya

require('./utils/db.js');
const Contact = require('./model/contact.js');
const { default: mongoose } = require('mongoose');

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


//GET /
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




//GET /about
app.get('/about', (req, res) => {
  res.render('about', { layout: 'layouts/main-layout.ejs', title: 'About Page' });
});



app.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.send('query tidak valid');
  res.send(`anda mencari ${q}`);
})



app.get('/contact', async (req, res) => {
  const contacts = await Contact.find({});
  res.render('contact', { layout: 'layouts/main-layout.ejs', title: 'Contect Page', contacts, msg: req.flash('msg') });
});

app.get('/contact/add', (req, res) => {
  res.render('add-contact', { layout: 'layouts/main-layout.ejs', title: 'Add Contact Page', errors: undefined });
});

//validator express
//haous contact 
app.post('/contact/add',
  [
    body('email', 'email invalid').isEmail(),
    body('noHP').isMobilePhone('id-ID').withMessage('invalid Indonesia phone number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('add-contact', { layout: 'layouts/main-layout', title: 'Add Contact Page', errors: errors.array() })
    }
    try {
      const contact = new Contact(req.body);
      await contact.save();

      req.flash('msg', 'Contact added!');
      res.redirect('/contact');
    } catch (errors) {
      if (errors.errorResponse){
        errors = [{ msg: 'name already used! use other name!' }];
        return res.render('add-contact', { layout: 'layouts/main-layout', title: 'Add Contact Page', errors })
      }
    }
  });


app.post('/contact/update',
  [
    body('email', 'email invalid').isEmail(),
    body('noHP').isMobilePhone('id-ID').withMessage('invalid Indonesia phone number'),
    body('nama').custom((value, { req }) => {
      const double = cekDuplikat(value);
      if (value !== req.body.oldNama && double) throw new Error('Contact Name alredy used! use other contact name!');
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('edit-contact',
        {
          layout: 'layouts/main-layout',
          title: 'Edit Contact Page',
          errors: errors.array(),
          contact: req.body
        });
    }
    updateContacts(req.body);
    req.flash('msg', 'Contact updated!');
    res.redirect('/contact');
  });



app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.fin(req.params.nama);
  if (!contact) {
    return res.status(404).redirect('/404');
  }
  res.render('edit-contact', { layout: 'layouts/main-layout.ejs', title: 'Edit Contact Page', contact, errors: undefined });
});


app.get('/contact/delete/:nama', (req, res) => {
  const { nama } = req.params;
  const contact = findContact(nama);
  if (!contact) {
    return res.status(404).redirect('/404');
  }
  deleteContact(nama);
  req.flash('msg', `contact named ${nama} deleted`);
  res.redirect('/contact');
})


app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render('detail', { layout: 'layouts/main-layout.ejs', title: 'Contact Detail Page', contact });
});




app.use((req, res, next) => {
  res.status(404).send("Maaf, halaman tidak ditemukan.");
});



app.listen(port, () => {
  console.log(`Contact App listening at port ${port}`);
});
