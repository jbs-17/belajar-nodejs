import config from "./config.mjs";
import connectToDB from "./utils/db.mjs";
import express from "express";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import { body, validationResult, check, } from 'express-validator';
import rateLimit from 'express-rate-limit';
import User from './models/user.mjs';
import bcrypt from 'bcrypt';

const layout = {
  ...config,
  layout: "./layouts/layout.ejs"
};
const app = express();
const signedIn = express.Router();
const page = express.Router();


// Set view engine
app.set("view engine", "ejs");
app.set("views", "views/");

// Middleware
app.use(expressLayouts);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use(
  session({
    secret: "hanya yang membaca ini yang tau",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);
app.use(flash());
// rateLimit halaman
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 64,
  message: 'Too many requests from this IP',
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(req.headers);
    res.render("index", { title: "too-many-request", ...layout });
  }
}))


app.use('/', signedIn);
app.use('/', page);
// Routes

//GET
//halaman utama
page.use('/', (req, res, next) => {
  next();
})
page.get("/", (req, res) => {
  res.render("index", { title: "Home", ...layout });
});

//halaman sign-up atau daftar akun
page.get("/sign-up", (req, res) => {
  res.render("sign-up", {
    ...layout,
    title: "Contacts"
  });
});

//halaman sign-in atau login
page.get("/sign-in", (req, res) => {
  res.render("sign-in", {
    ...layout,
    title: "Contacts"
  });
});

//POST
// CREATE menerima data pendaftaran atau sign-in
const validateSignIn = [
  body('password', 'password required and password length mininum is 8 characters').custom((value) => {
    if (value.length < 8) {
      throw new Error('password length mininum is 8 characters');
    }
    return true;
  }).notEmpty(),
  body('email', 'email invalid').isEmail().notEmpty()
]
app.post("/sign-in", validateSignIn, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.json(req.body);
});


// READ
const validateSignUp = [
  body('email').isEmail().withMessage('email invalid'),
  body('password').notEmpty().withMessage('password is required'),
  body('password-confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('password confirmation does not match');
    }
    return true;
  })
];

app.post("/sign-up", validateSignUp, async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.send(result.array())
  }
  const { password } = req.body;
  req.body.password = bcrypt.hash()
  const user = new User(req.body);
  const save = await user.save();
  return res.send(save);
});





/* signedIn Router */
//READ lihat daftar kontak
const sortFunc = {
  'newest': async function functionName() {

  },
  'oldest': async function functionName() {

  },
  'A-Z': async function functionName() {

  },
  'Z-A': async function functionName() {

  }
};
signedIn.get("/contacts", async (req, res) => {
  let { sort } = req.query;
  if (sort) {
    sort = sortFunc[sort];
  }
  if (sort) {

  }
  res.render("contacts", {
    ...layout,
    title: "Contacts",
    contacts
  });
});
signedIn.get("/profile", async (req, res) => {
  res.render("profile", {
    ...layout,
    title: "Contacts"
  });
});
signedIn.get('/contact/create', (req, res) => {

});
//
signedIn.get('/contact/edit/:uuid', async (req, res) => {

});
//UPDATE edit kontak
signedIn.patch('/contact/edit/:uuid', async (req, res) => {

});
//READ lihat detail kontak
app.get('/contact/:uuid', async (req, res) => {

})





// 404 handler
app.use((req, res) => {
  res.status(404).render("404", {
    ...layout,
    title: "404",
    path: req.path,
    referer: req.headers.referer || '/home'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).render("error.ejs", {
    ...layout,
    title: "Server Error",
    error: err,
    stack: err.stack?.split('\n')
  });
});

const PORT = process.env.PORT || 3000;
connectToDB()
  .then(msg => {
    console.log(msg);
    app.listen(PORT, () => {
      console.log(`App running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
