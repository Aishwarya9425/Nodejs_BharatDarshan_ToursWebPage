const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

//get only allowed fields from the given obj
//user is allowed to update only  name and email
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//currently logged in user can change his/her user data
//only name and email is allowed to be updated
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  //if user tries to update password - error
  console.log('inside updateMe');
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword to update current password.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  //only name and email is allowed to be updated

  const filteredBody = filterObj(req.body, 'name', 'email');

  //cant use save because few fields are required
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true, //run validators only for the filtered body fields
  });
  console.log('updatedUser', updatedUser);
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//when user wants the profile to be deleted
// we dont delete the document from db
//just set the user doc to active: false
exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log('Inside  deleteMe');
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//get all users
exports.getAllUsers = catchAsync(async (req, res) => {
  //this res does not show password cuz select is false
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};
