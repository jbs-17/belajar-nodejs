import express from "express";
import User from '../models/user.mjs';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { body, validationResult, check, } from 'express-validator';
import config from "../config.mjs";
import signedIn from "./signed-in.mjs";

const page = express.Router();

const { layout } = config;


//GET
//halaman utama

page.get("/", (req, res) => {
  res.render("index", { ...layout, title: "Home" });
});

//halaman sign-up atau daftar akun
page.get("/sign-up", (req, res) => {
  return res.render('sign-up', { ...layout, title: 'Sign Up', msg: {}, error: null, email: null });
});

//halaman sign-in atau login
page.get("/sign-in", (req, res) => {
  res.render("sign-in", {
    ...layout,
    title: "Sign In",
    signUp: req.flash('sign-up'),
    email: req.flash('email'),
    signedIn: req.flash('signedIn')
  });
});
page.get('/sign-in/verfify', (req, res) => {
  try {
    const { sign_in_token } = req.cookies;
    const verify = jsonwebtoken.verify(sign_in_token, process.env.JWT_SECRET);
    const { id } = verify;
    const user = User.findById(id);
    if (!user) {
      throw new Error('User not found!');
    }
    res.json({status: true});
  } catch {
    res.json({status: false});
  }
})


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
];

page.post("/sign-in", validateSignIn, async (req, res) => {
  const result = validationResult(req);
  const { email, password, remember } = req.body;
  if (!result.isEmpty()) {
    return res.render('sign-in', { signedIn: '', signUp: '', title: 'Sign In', ...layout, msg: { false: 'Sign In failed!' }, error: result.array(), email });
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

    res.cookie('sign_in_token', token, cookieOptions);
    req.flash('sign-in', 'Sign In succesfuly, Welcome!');
    return res.redirect('/dashboard');
  } catch (error) {
    return res.render('sign-in', { signedIn: '', signUp: '', title: 'Sign In', ...layout, msg: { false: 'Sign In failed!' }, error: [{ path: 'email', msg: error.message }, { path: 'password', msg: '' }], email });
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

page.post("/sign-up", validateSignUp, async (req, res) => {
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



export {page}
export default page;
