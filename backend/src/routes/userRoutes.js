const express = require('express');
const router = express.Router();
const { getUserData, updateUser, updatePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress, getAllUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserData);
router.get('/all', admin, getAllUsers);
router.put('/:id', admin, require('../controllers/userController').updateUserByAdmin); // Admin update user route
router.post('/', admin, require('../controllers/userController').createUserByAdmin); // Admin create user route
router.delete('/:id', admin, require('../controllers/userController').deleteUser); // Admin delete user route
router.put('/profile', updateUser);
router.put('/password', updatePassword);
router.post('/address', addAddress);
router.put('/address', updateAddress);
router.put('/address/default', setDefaultAddress);
router.delete('/address', deleteAddress);

module.exports = router;