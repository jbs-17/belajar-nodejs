import config from "../config.mjs";
import express from "express";
import User from "../models/user.mjs";
import jsonwebtoken from 'jsonwebtoken';
import ejs from 'ejs';



const { layout } = config;

const signedIn = express.Router();


const verifySignIn = async (req, res, next) => {
  const { sign_in_token } = req.cookies;
  try {
    const verify = jsonwebtoken.verify(sign_in_token, process.env.JWT_SECRET);
    const { id } = verify;
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found!');
    }
    req.user = user
    req.userData = user.toJSON();
    next();
  } catch {
    req.flash('signedIn', 'Sign In to your account!');
    res.redirect('/sign-in')
  }
};

/* signedIn Router */
signedIn.get("/sign-out", verifySignIn, async (req, res) => {
  res.cookie('sign_in_token', '', { expires: 0 });
  res.render("sign-out", {
    ...layout,
    title: "Sign Out",
  });
});



signedIn.get("/dashboard", verifySignIn, async (req, res) => {
  res.render("dashboard", {
    ...layout,
    title: "Dashboard",
    signedIn: req.flash('sign-in')
  });
});
signedIn.get('/settings', verifySignIn, async (req, res) => {
  let { theme } = req.query;
  let info = req.flash('info') || '';
  if (theme) {
    await req.user.toggleTheme();
    info = `Changed to ${theme === 'default' ? 'Default' : 'Dark'} Theme`;
    req.flash('info', info);
    return res.redirect('/settings');
  }
  res.render("settings", {
    ...layout,
    title: "Setting",
    info,
    ...req.userData
  });
});

//
signedIn.get('/contact/add', verifySignIn, async (req, res) => {
  const info = req.flash('info')[0] || '';
  const error = info.includes(':') ? info : '';
  res.render("add", {
    ...layout,
    title: "Contacts",
    signedIn: req.flash('sign-in'),
    ...req.userData,
    info,
    error
  });
});
signedIn.post('/contact/add', verifySignIn, async (req, res) => {
  const contact = createContact(req.body);
  try {
    const { name } = req.body;
    await req.user.addContact(contact);
    req.flash('info', `Contact named ${name} added!`);
    res.redirect(`/contact/${name}`);
  } catch (error) {
    if (error.message && error.message?.includes('name')) {
      req.flash('info', 'error: ' + error.message);
    } else {
      req.flash('info', 'Error to add contact! pleasesa input valid form!');
    }
    res.redirect('/contact/add');
  }
});


signedIn.get('/contact/:nameId/download', verifySignIn, async (req, res, namex) => {
  const info = req.flash('info')[0] || '';
  const { format } = req.query;
  const { nameId } = req.params;
  namex = nameId;
  try {
    let { _id, favorite, priority, createdAt, updatedAt, name, ...fields } = await req.user.findContactByName(nameId);
    fields = Object.entries(fields);
    const data = {
      _id, favorite, priority, createdAt: new Date(createdAt).toUTCString(), updatedAt: new Date(updatedAt).toUTCString(), name, fields
    };

    const puppeteer = import('puppeteer-core');
    const browser = await (await puppeteer).launch({
      'executablePath': "C:/Program Files/Google/Chrome/Application/chrome.exe"
    });
    const page = await browser.newPage();
    return ejs.renderFile('./views/template/detail.ejs', {
      ...layout,
      title: name + "Detail",
      ...data
    }, async (error, html) => {
      if (error) { console.log(error);; return res.json(data); }
      const filePath = `./public/${_id}.pdf`
      await page.setContent(html);
      await page.pdf({ 'path': filePath });
      await browser.close();
      res.attachment(`${name}.pdf`);  
      return res.download(filePath, (error) => {
      })
    });
    res.json(data)

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});





//READ lihat detail kontak
signedIn.get('/contact/:nameId', verifySignIn, async (req, res, namex) => {
  const info = req.flash('info')[0] || '';
  const { favorite: f } = req.query;
  const { nameId } = req.params;
  namex = nameId;
  try {
    console.log({ f });
    if (f) {
      return req.user.toggleFavorite(nameId);
    }
    let { _id, favorite, priority, createdAt, updatedAt, name, ...fields } = await req.user.findContactByName(nameId);
    fields = Object.entries(fields);
    const data = {
      _id, favorite, priority, createdAt: new Date(createdAt).toUTCString(), updatedAt: new Date(updatedAt).toUTCString(), name, fields
    };

    res.render("detail", {
      ...layout,
      title: name + "Detail",
      ...data,
      info
    });

  } catch (error) {
    console.log(error);
    res.render("detail-404", {
      ...layout,
      title: namex + "Detail",
      namex
    });
  }
});


//UPDATE edit kontak
signedIn.get('/contact/edit/:nameId', verifySignIn, async (req, res, namex) => {
  const { nameId } = req.params;
  namex = nameId;
  try {
    let { _id, favorite, priority, createdAt, updatedAt, name, ...fields } = await req.user.findContactByName(nameId);
    fields = Object.entries(fields);
    const data = {
      _id, favorite, priority, createdAt: new Date(createdAt).toUTCString(), updatedAt: new Date(updatedAt).toUTCString(), name, fields
    };

    res.render("detail", {
      ...layout,
      title: name + "Detail",
      ...data
    });

  } catch (error) {
    res.render("detail-404", {
      ...layout,
      title: namex + "Detail",
      namex
    });
  }
});













export { signedIn, verifySignIn }
export default signedIn;


const formData = {
  "name": "papua",
  "priority": "23",
  "favorite": "yes",
  "field-0": "halo",
  "value-0": "hai",
  // "field-1": "israel",
  "value-1": "babi",
  "field-2": "field",
  // "value-2": "value"
}
function createContact({ name, priority = 0, favorite = "", ...fields }) {
  favorite = Boolean(favorite.length);
  const contact = {
    name, priority, favorite,
  };
  fields = Object.entries(fields);
  const fieldNames = [];
  const fieldValues = [];
  fields.forEach(([key, value]) => {
    if (!key.length || !value.length) {
      return
    };
    if (!includeNumber(key)) {
      return
    }
    const num = key.split('-')[1];
    if (key.includes('field-')) {
      return fieldNames.push([num, value]);
    }
    return fieldValues.push([num, value]);
  });

  for (const [num, fieldName] of fieldNames) {
    for (const [valueNum, fieldValue] of fieldValues) {
      if (valueNum.includes(num)) {
        contact[fieldName] = fieldValue;
      }
    }
  }
  return contact;
};


signedIn.get('/papua', (req, res) => {
})

function includeNumber(str = '') {
  for (const number of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) {
    if (str.includes(number)) {
      return true
    }
  }
  return false
}
// console.log(createContact(formData));

