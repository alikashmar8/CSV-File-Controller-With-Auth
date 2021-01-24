import express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authVerify');
const usersController = require('../controllers/usersController')

router.get('/:id', authMiddleware.isAuth, usersController.findById )

router.patch('/:id', authMiddleware.isAuth, usersController.update )

module.exports = router