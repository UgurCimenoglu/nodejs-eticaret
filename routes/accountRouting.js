const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account');

const csrf = require('../middleware/csrfToken');


router.get('/login' , csrf , accountController.getLogin);
router.post('/login' , csrf , accountController.postLogin);

router.get('/register' , csrf , accountController.getRegister);
router.post('/register' , csrf , accountController.postRegister);

router.get('/logout' , csrf , accountController.logout);

router.get('/reset-password' , csrf , accountController.getResetPass);
router.post('/reset-password' , csrf , accountController.postResetPass);

router.get('/reset-password/:token' , csrf , accountController.getNewPass);
router.post('/new-password' , csrf , accountController.postNewPass);


module.exports = router;