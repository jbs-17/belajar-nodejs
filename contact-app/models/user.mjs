import mongoose, { Schema } from 'mongoose';


const ContactSchema = new Schema({
  name: {
    type: String,
  },
  favorite: {
    type: Boolean
  },
  priority: {
    type: Number,
    min: 0,
    max: 100
  }
}, { strict: false, timestamps: true });

const SettingsSchema = new Schema({
  theme: {
    type: String,
    enum: ['default', 'dark'],
    default: 'default',
  }
}, {
  _id: false,
  strict: false,
});

// UserSchema utama
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      trim: true
    },
    contacts: {
      type: [ContactSchema],
      default: []
    },
    settings: {
      type: SettingsSchema,
      default: () => ({}) // default ambil dari SettingsSchema
    }
  },
  { timestamps: true }
);

UserSchema.methods.toggleTheme = async function () {
  this.settings.theme = this.settings.theme === 'default' ? 'dark' : 'default';
  return this.save();
};

UserSchema.methods.addContact = async function (newContact) {
  this.contacts.forEach(contact => {
    if (contact.name === newContact.name) {
      throw new Error(`contact name alredy used by other contact! use new another name for the contact!`);
    }
  });
  this.contacts.push(newContact);
  return await this.save();
};
UserSchema.methods.findContactByName = async function (name) {
  for (const contact of this.contacts) {
    if (contact.name === name) {
      return contact.toJSON()
    }
  }
  return null
};
UserSchema.methods.toggleFavorite = async function (name) {
  for (const contact of this.contacts) {
    if (contact.name === name) {
      contact.favorite = contact.favorite ? false : true;
      return this.save();
    }
  }
  return null
};


UserSchema.methods.sortContactsBy = function (criteria = 'newest') {
  const contacts = [...this.contacts];
  switch (criteria) {
    case 'newest':
      return contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return contacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'name-asc':
      return contacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name-desc':
      return contacts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case 'updated-newest':
      return contacts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    case 'updated-oldest':
      return contacts.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    case 'favorite-first':
      return contacts.sort((a, b) => (b.favorite === true) - (a.favorite === true));
    case 'priority-high':
      return contacts.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    case 'priority-low':
      return contacts.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    default:
      return contacts;
  }
};



const User = mongoose.model('User', UserSchema);
export default User;
