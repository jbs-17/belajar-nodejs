const express = require('express');
const { body, validationResult, check } = require('express-validator')
const app = express();
const port = 3000;
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash'); //pengirim pesan satu kali untuk render halaman berikutnya
const methodOverride = require('method-override');

require('./utils/db.js');
const Contact = require('./model/contact.js');
const { default: mongoose } = require('mongoose');

//setup var methodOverride = require('method-override')
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))


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



app.get('/search', async (req, res) => {
  let { q } = req.query;
  if (!q) q = '';
  // Buat regular expression dari query string.
  // 'i' flag membuatnya case-insensitive (tidak peduli huruf besar/kecil).
  const searchRegExp = new RegExp(q, 'i');

  // Gunakan operator $or untuk mencari di beberapa field
  // Masing-masing objek di dalam array $or adalah kondisi pencarian
  const search = await Contact.find({
    $or: [
      { nama: { $regex: searchRegExp } },
      { noHP: { $regex: searchRegExp } },
      { email: { $regex: searchRegExp } },
    ]
  });
  res.render('search', { layout: 'layouts/main-layout.ejs', title: 'Search Page', q, search })
})



app.get('/contact', async (req, res) => {
  const contacts = await Contact.find({});
  res.render('contact', { layout: 'layouts/main-layout.ejs', title: 'Contect Page', contacts, msg: req.flash('msg') });
});

app.get('/contact/add', (req, res) => {
  res.render('add-contact', { layout: 'layouts/main-layout.ejs', title: 'Add Contact Page', errors: undefined, contact: {} });
});

//validator express
//haous contact 
app.post('/contact/add',
  [
    body('email', 'email invalid').isEmail(),
    body('noHP').isMobilePhone('id-ID').withMessage('invalid Indonesia phone number'),
  ],
  async (req, res, newContact) => {
    newContact = req.body;
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
      throw errors.array();
    }
      const contact = new Contact(req.body);
      await contact.save();

      req.flash('msg', 'Contact added!');
      res.redirect('/contact');
    } catch (errors) {
      if (errors.errorResponse) {
        let msg = errors.errmsg;
        if (msg?.includes('noHP')) {
          msg = 'phone number already used!';
        }
        else if (msg?.includes('nama')) {
          msg = 'name already used!';
        } else {
          msg = 'email already used!';
        }
        errors = [{ msg }];
      }
      return res.render('add-contact', { layout: 'layouts/main-layout', title: 'Add Contact Page', errors, contact: newContact });
    }
  });


app.put('/contact',
  [
    body('email', 'email invalid').isEmail(),
    body('noHP').isMobilePhone('id-ID').withMessage('invalid Indonesia phone number')
  ],
  async (req, res, newContact) => {
    const errors = validationResult(req);
    try {
      newContact = req.body;
      if (!errors.isEmpty()) { throw errors.array(); }
      const { oldNama } = req.body;
      delete req.body.oldNama;
      const contact = await Contact.updateOne({ nama: oldNama }, { $set: req.body });
      req.flash('msg', 'Contact updated!');
      res.redirect('/contact');
    } catch (errors) {
      if (errors.errorResponse) {
        errors = [{ msg: 'name already used! use other name!' }];
      }
      return res.render('edit-contact', { layout: 'layouts/main-layout', title: 'Add Contact Page', errors, contact: newContact });
    }
  });



app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  if (!contact) {
    return res.status(404).redirect('/404');
  }
  res.render('edit-contact', { layout: 'layouts/main-layout.ejs', title: 'Edit Contact Page', contact, errors: undefined });
});


// app.get('/contact/delete/:nama', async(req, res) => {
//   const { nama } = req.params;
//   const contact = await Contact.deleteOne({nama});
//   console.log(contact);
//   if (contact.deletedCount === 0) {
//     return res.status(404).redirect('/404');
//   }
//   req.flash('msg', `contact named ${nama} deleted`);
//   res.redirect('/contact');
// });

app.delete('/contact', async (req, res) => {
  const { nama } = req.body;
  const contact = await Contact.deleteOne({ nama });
  if (contact.deletedCount === 0) {
    return res.status(404).redirect('/404');
  }
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









async function db() {
  mongoose.set('debug', true)
  try {
    console.log('memulai...');
    await mongoose.connect('mongodb://akuntamulaptophp:1248@ac-zfjbd1q-shard-00-00.5bgwgkd.mongodb.net:27017,ac-zfjbd1q-shard-00-01.5bgwgkd.mongodb.net:27017,ac-zfjbd1q-shard-00-02.5bgwgkd.mongodb.net:27017/?ssl=true&replicaSet=atlas-11rwqo-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
      dbName: 'contact_app',
      serverSelectionTimeoutMS: 3000, // Increase timeout to 30 seconds
      bufferTimeoutMS: 3000,
    });
    console.log('Berhasil terkoneksi dengan database!');

    app.listen(port, () => {
      console.log(`Contact App listening at port ${port}`);
    });
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

db();