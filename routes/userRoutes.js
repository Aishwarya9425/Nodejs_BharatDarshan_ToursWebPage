const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

//forgotPassword will receive only email
router.post('/forgotPassword', authController.forgotPassword);
//resetPassword will receive token and new password
router.patch('/resetPassword/:token', authController.resetPassword);
//update password, user will send the current password 1st to verify
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.get('/me', userController.getMe, userController.getUser);

//update user details only name and email
router.patch('/updateMe', authController.protect, userController.updateMe);
//delet user profile - set active to false, wont actually delete doc from db
router.delete('/deleteMe', authController.protect, userController.deleteMe);

//users routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
