import mongoose from 'mongoose';

//User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'email address already in use! use another email address'], 
    trim: true,
  },
  phone: {
    type: String,
    required: false, 
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true
  },
  data: {
    type: [{ type: Schema.Types.Mixed }],
    default: []
  }
}, {
  timestamps: true // Menambahkan createdAt dan updatedAt
});

// Membuat model
const User = mongoose.model('User', userSchema);
export default User;
