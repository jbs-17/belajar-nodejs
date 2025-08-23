import config from "../config.mjs";
import express from "express";
import User from "../models/user.mjs";
import jsonwebtoken from 'jsonwebtoken';

const { layout } = config;

const signedIn = express.Router();


const verifySignIn = async (req, res, next) => {
  const { sign_in_token } = req.cookies;
  try {
    const verify = jsonwebtoken.verify(sign_in_token, process.env.JWT_SECRET);
    const { id } = verify;
    const user = User.findById(id);
    if (!user) {
      throw new Error('User not found!');
    }
    next();
  } catch {
    req.flash('signedIn', 'Sign In to your account!');
    res.redirect('/sign-in')
  }
};

/* signedIn Router */
signedIn.get("/sign-out",verifySignIn, async (req, res) => {
  res.cookie('sign_in_token', '', { expires: 0 });
  res.render("sign-out", {
    ...layout,
    title: "Sign Out",
  });
});



signedIn.get("/dashboard",verifySignIn, async (req, res) => {
  res.render("dashboard", {
    ...layout,
    title: "Contacts",
    signedIn: req.flash('sign-in')
  });
});
signedIn.get('/contact/create',verifySignIn, (req, res) => {

});
//
signedIn.get('/contact/edit/:uuid', async (req, res) => {

});
//UPDATE edit kontak
signedIn.patch('/contact/edit/:uuid', async (req, res) => {

});
//READ lihat detail kontak
signedIn.get('/contact/:uuid', async (req, res) => {

});


export {signedIn, verifySignIn}
export default signedIn;
