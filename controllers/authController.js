const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const { promisify } = require('util');
const crypto = require('crypto');
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
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
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

//authenticate user before they hit protected routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check it exists
  let token;
  //the way jwt is sent as header is Authorization Bearer  token
  //user wil have jwt only if logged in
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Bearer token
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('token is ', token);
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  //get the token from step1 and check if it is valid
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //decoded has id of the user
  console.log('decoded token', decoded);
  //{ id: '647c88021b5e76617cab9386', iat: 1686148326, exp: 1686155526 }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  //iat - jwt issued at datetime stamp
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  console.log('req.user', req.user);
  res.locals.user = currentUser;
  next();
});

//before this, protect middleware runs which gets the current user details
// restrict users, only admin and lead guide can delete tours
// middleware, add this to the routes and pass the roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    //get the current user role
    //why include because we can specify more than one role in this middleware
    console.log('req.user.role', req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      ); //403 forbidden
    }
    next();
  };
};

//password reset
//gets only email from user
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  console.log('Inside forgotPassword middleware');
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'There is no user with the given email address. Please try again!!',
        404
      )
    );
  }

  // 2) Generate the random reset token
  //not jwt token, just like otp to verify
  //random string - unencrypted
  const resetToken = user.createPasswordResetToken();
  //but some fields are required, but this reset requires only email
  //so disable other validation
  await user.save({ validateBeforeSave: false });

  // 3) Send the reset token to user's email using nodemailer
  //req.protocol - http or https
  //req.get(host) - dev pr prod url
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  console.log('resetURL', resetURL);

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you did not request for a password reset, please ignore this email!`;

  try {
    //sendEmail func imported
    await sendEmail({
      email: user.email,
      subject: 'BharatDarshanTours -- You requested for a password reset',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Reset mail send to user with token',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  //get the token from the req.params
  console.log('inside resetPassword');
  console.log('req.params.token', req.params.token);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // see if this encrypted token exists in db
  //get the token only if expiration datetime is greater than now
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //passwordResetExpires -- 2023-06-08T13:47:11.253+00:00

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //the user will set new password and passwordConfirm via patch reset req
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  //new token created for logging in
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
