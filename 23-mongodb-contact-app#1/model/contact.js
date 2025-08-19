const { default: mongoose } = require("mongoose");

//otomatis buat collection Contacts dijadikan plural atau jamak
const Contact = mongoose.model('Contact', {
  nama: {
    'type': String,
    required: true,
    unique: true,
  },
  noHP: {
    'type': String,
    unique: true,
    required: true
  },
  email: {
    'type': String,
    unique: true,
    required: true
  },
});

module.exports = Contact;