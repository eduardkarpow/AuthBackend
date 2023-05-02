const Router = require('express').Router;
const UserController = require('../controllers/user-controller.js');
const authMidlelawer = require('../middlelawer/auth-midlelawer');

const router = new Router();

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);

router.get('/users', authMidlelawer, UserController.getUsers);

module.exports = router;