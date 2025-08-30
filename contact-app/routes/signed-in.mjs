import config from "../config.mjs";
import express from "express";
import User from "../models/user.mjs";
import jsonwebtoken from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';



const contactsPerPage = 10;
const { layout } = config;

const signedIn = express.Router();


const verifySignIn = async (req, res, next) => {
  if (req.user !== null && req.user !== undefined) {
    return next();
  }
  const { sign_in_token } = req.cookies;
  try {
    const verify = jsonwebtoken.verify(sign_in_token, process.env.JWT_SECRET);
    const { id } = verify;
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found!');
    }
    req.user = user;
    req.userData = user.toJSON();
    req.theme = user.settings.theme;
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
    theme: req.theme,
    title: "Sign Out",
  });
});



signedIn.get("/dashboard", verifySignIn, async (req, res) => {
  res.render("dashboard", {
    ...layout,
    title: "Dashboard",
    signedIn: req.flash('sign-in'),
    theme: req.theme
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
    ...req.userData,
    theme: req.theme,
  });
});






//
signedIn.get('/contact/add', verifySignIn, async (req, res) => {
  let formData = req.flash('formData')[0] || '';
  const info = req.flash('info');
  const error = req.flash('error');
  if (formData) {
    try {
      formData = JSON.parse(formData);
    } catch (error) {
      formData = '';
    }
  };
  res.render("add", {
    ...layout,
    title: "Contacts",
    signedIn: req.flash('sign-in'),
    ...req.userData,
    info,
    error,
    formData,
    theme: req.theme,
  });
});


const validateFormData = [
  verifySignIn,
  body('name', 'name invalid!').trim().notEmpty(),
  body('priority', 'invalid priority number! allowed 0-100').custom(value => {
    value = parseInt(value);
    return !isNaN(value) && value <= 100 && value >= 0;
  })
]

signedIn.post('/contact/add', validateFormData, async (req, res, formData) => {
  const contact = createContact(req.body);
  try {
    console.log(req.body);
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new Error('input invalid!')
    };
    let { name } = req.body;
    formData = req.body;
    await req.user.addContact(contact);
    req.flash('info', `Contact named ${name} added!`);
    res.redirect(`/contact/${name}`);
  } catch (error) {
    if (error.message && error.message?.includes('name')) {
      req.flash('error', 'error: ' + error.message);
      req.flash('formData', JSON.stringify(formData));
    } else {
      req.flash('error', 'Error to add contact! please input valid form!');
    }
    res.redirect('/contact/add');
  }
});







//READ lihat detail kontak
signedIn.get('/contact/:nameId', verifySignIn, async (req, res, namex) => {
  const info = req.flash('info')[0] || '';
  const { favorite: f } = req.query;
  const { nameId } = req.params;
  namex = nameId;
  try {
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
      title: name,
      ...data,
      info,
      theme: req.theme,
    });

  } catch (error) {
    res.render("detail-404", {
      ...layout,
      title: namex,
      namex,
      theme: req.theme,
    });
  }
});

signedIn.delete('/contact/:nameId', verifySignIn, async (req, res, namex) => {
  const { nameId } = req.params;
  try {
    const result = await req.user.deleteContactByName(nameId);
    if (result === true) {
      req.flash('info', `Succes delete contact ${nameId}!`)
      return res.redirect('/contacts');
    }
    throw new Error('Failed to delete contact!');
  } catch (error) {
    req.flash('error', 'Failed to delete contact!')
    res.redirect(req.path);
  }
});




//READ lihat detail kontak
signedIn.get('/contact/:nameId', verifySignIn, async (req, res, namex) => {
  const info = req.flash('info')[0] || '';
  const { favorite: f } = req.query;
  const { nameId } = req.params;
  namex = nameId;
  try {
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
      title: name,
      ...data,
      info,
      theme: req.theme,
    });

  } catch (error) {
    res.render("detail-404", {
      ...layout,
      title: namex + " Not Found",
      namex,
      theme: req.theme,
    });
  }
});



//UPDATE edit kontak
signedIn.route('/contact/edit/:nameId')
  .get(verifySignIn, async (req, res, namex) => {
    const { nameId } = req.params;
    namex = nameId;
    try {
      let { _id, favorite, priority, createdAt, updatedAt, name, ...fields } = await req.user.findContactByName(nameId);
      fields = Object.entries(fields);
      const data = {
        _id, favorite, priority, createdAt: new Date(createdAt).toUTCString(), updatedAt: new Date(updatedAt).toUTCString(), name, fields
      };
      res.render("edit", {
        ...layout,
        title: `Edit ${name}`,
        ...data,
        info: '',
        theme: req.theme,
      });
    } catch (error) {
      res.redirect('/contacts');
    }
  })
  .patch(verifySignIn, async (req, res) => {
    const formData = createContact(req.body);
    const { _id, name } = req.body;
    try {
      const result = await req.user.patchContact(_id, formData);
      req.flash('info', 'Contact edited')
      res.redirect(`/contact/${result.name}`);
    } catch (error) {
      res.redirect(`/contact/${req.params.nameId}`);
    }
  })





//PATCH edit satu kontak
signedIn.get('/contacts', verifySignIn, async (req, res) => {
  let { sort, filter, page } = req.query;
  try {
    //cek page int valid bukan
    page = parseInt(page);
    if (page !== 0 && isNaN(page)) {
      return res.redirect('/contacts?page=0');
    };

    //tentukan page yang tersedia 
    let contacts = req.user.sortContactsBy(sort);
    const contactLength = contacts.length;
    let totalPage = parseInt((contactLength - 1) / contactsPerPage);
    if (contacts.length < 10) {
      totalPage = 0;
    };
    const result = pageContact(page, contacts);


    res.render("contacts", {
      ...layout,
      title: "Contact List",
      totalPage,
      page,
      theme: req.theme,
      result,
      sort
    });
  } catch (error) {
    res.json(error);
  }
});


const isStringIncludes = (what = '') => string => `${string}`.toLowerCase().includes(what.toLowerCase());
const excecptedField = ['_id', 'favorite', 'priority', 'updatedAt', 'createdAt'];
signedIn.get('/search', (req, res, next) => {
  let { q, page } = req.query;
  try {
    if (page === undefined) {
      page = 0
    }
    page = parseInt(page);
    if (page !== 0 && isNaN(page)) {
      return res.redirect('/search?q=&page=0');
    };
    const contacts = req.user.toJSON().contacts;
    const result = contacts.filter(contact => {

      return Object.keys(contact).filter(key => !excecptedField.includes(key)).some(isStringIncludes(q)) || Object.values(contact).some(isStringIncludes(q));
    });
    let resultLength = result.length;
    let totalPage = parseInt((resultLength - 1) / contactsPerPage);
    res.render("search", {
      ...layout,
      q,
      title: "Contact List",
      totalPage,
      page,
      theme: req.theme,
      result,
    });
  } catch (error) {
    next(error)
  }
});


signedIn.route('/password')
.get(verifySignIn, (req, res)=>{
  res.render("password", {
    ...layout,
    title: "Password",
  });
})
.patch(verifySignIn, (req,res)=>{

});


signedIn.route('/email')
.get((req,res)=>{
  res.render("email", {
    ...layout,
    title: "Email",

  });
})
.patch((req,res)=>{

})


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



function pageContact(page = 0, contacts) {
  return contacts.slice(page * contactsPerPage, page * contactsPerPage + contactsPerPage);
};