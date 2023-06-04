const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide a email;'],
    unique: true,
    lowercase: true, //convert given email to lowercase
    //use npm package validator to validate email
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //check if password and passwordConfirm is the same
    validate: {
      // This only works on CREATE and SAVE!!!
      // arrow func cant have access to this
      validator: function (passConfirm) {
        return passConfirm === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

//encrpyt passwords in db, cant save it as it
//using middleware, after getting data and before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  //if no password is entered exit the func
  if (!this.isModified('password')) return next();

  console.log('Encrypting the password..');
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  console.log('encrypted password is :  ', this.password);
  //after passwords match validation we dont need this field
  // Delete passwordConfirm field, dont need to save to db
  this.passwordConfirm = undefined;
  next();
});

//user model based on user schema
const User = mongoose.model('User', userSchema);

//export the model always not the schema
module.exports = User;
