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
import jsonwebtoken from 'jsonwebtoken';

const layout = {
  ...config,
  layout: "./layouts/layout.ejs",
  msg: {},
  script: null,
  error: []
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
  return res.render('sign-up', { ...layout, title: '', msg: {}, error: null, email: null });
});

//halaman sign-in atau login
page.get("/sign-in", (req, res) => {
  res.render("sign-in", {
    ...layout,
    title: "Sign In",
    signUp: req.flash('sign-up'),
    email: req.flash('email')
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
app.post("/sign-in", validateSignIn, async (req, res) => {
  const result = validationResult(req);
  const { email, password, remember } = req.body;
  if (!result.isEmpty()) {
    return res.render('sign-in', { signUp: '', title: 'Sign In', ...layout, msg: { false: 'Sign In failed!' }, error: result.array(), email });
  };
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not defined');
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid password');
    }

    const age = 43001;
    const cookieOptions = {
      maxAge: (1000) * age
    };
    const tokenOptions = {
      expiresIn: age
    };

    if (!remember) {
      delete cookieOptions.maxAge;
      tokenOptions.expiresIn = "12 hours";
    };
    const token = jsonwebtoken.sign({
      id: user._id,
    }, process.env.JWT_SECRET, tokenOptions);

    console.log(cookieOptions);
    res.cookie('sign_in_token', token, cookieOptions);
    req.flash('sign-in', 'Sign In succesfuly, Welcome!');
    return res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    return res.render('sign-in', { signUp: '', title: 'Sign In', ...layout, msg: { false: 'Sign In failed!' }, error: [{ path: 'email', msg: error.message }, { path: 'password', msg: '' }], email });
  }
});


// READ
const validateSignUp = [
  body('email').isEmail().withMessage('email invalid'),
  body('password').notEmpty().withMessage('password is required'),
  body('password-confirmation').custom((value, { req }) => {
    const { password } = req.body;
    if (value !== password) {
      throw new Error('password confirmation does not match');
    }
    if (password.length < 8 || value.length < 8) {
      throw new Error('password length minimun is 8');
    }
    return true;
  })
];

app.post("/sign-up", validateSignUp, async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result.array());
    return res.render('sign-up', { ...layout, title: '', msg: { false: 'Sign Up falied' }, error: result.array(), ...req.body });
  }
  const { password, email } = req.body;
  req.body.password = await bcrypt.hash(password, 10);
  const user = new User(req.body);
  try {
    const save = await user.save();
  } catch (error) {
    if (error.message?.includes('duplicate')) {
      error = [{ msg: 'email has been registered', path: 'email' }]
    }
    return res.render('sign-up', { ...layout, title: '', msg: { false: 'Sign Up falied \n' }, error, email });
  }

  req.flash('email', email);
  req.flash('sign-up', 'Sign Up success! Sign In to your account here!');
  return res.redirect('/sign-in');
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
signedIn.get("/dashboard", async (req, res) => {
  res.render("dashboard", {
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
