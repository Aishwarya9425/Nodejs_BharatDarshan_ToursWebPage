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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //to not leak password, dont show it in any output - getAllUsers
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //check if password and passwordConfirm is the same
    validate: {
      // This only workss on CREATE and SAVE!!!
      // arrow func cant have access to this
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
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

//while logging in, check if given password is same as pass in db
//need to decrypt the pass
//instance method - will be available in all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//check if user/hacker changed password after getting the token
//if user changed pwd after logging in, then cant authorize to hit protected routes
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //JWTTimestamp is in milliseconds so convert passwordChangedAt also
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

//user model based on user schema
const User = mongoose.model('User', userSchema);

//export the model always not the schema
module.exports = User;
