const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

//jwt - 1st signin the user and then verify whenever user hits any protected route

//create token for signing up, again for logging in
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//use catchAsync to avoid try catch block
exports.signup = catchAsync(async (req, res, next) => {
  //to make sure users dont set their roles as admin
  //to make sure only these fields are saved in the db
  //creating admin can be done only by manually editing mongo compass after user is created
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //once the user is created,we need to sign in the user using jwt
  //need to give the payload -- id in this case, and the jwt secret, expires in
  console.log('Creating JWT for signing in the user...');
  //call the signToken func by passing the id
  const token = signToken(newUser._id);
  console.log('JWT is ', token);

  // send this json webtoken to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//after creating the user with jwt, login using email and password
exports.login = catchAsync(async (req, res, next) => {
  //get the email and password
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password to login!!', 400)
    );
  }

  //2. Check if user exists and password is correct
  //select password
  const user = await User.findOne({ email }).select('+password');
  //if user exists then this returns email and password

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'Either the user does not exist or entered email or password is incorrect!!',
        401
      )
    );
  }
  //3. If everything is okay, send the token to the client
  //new token created for logging in
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
