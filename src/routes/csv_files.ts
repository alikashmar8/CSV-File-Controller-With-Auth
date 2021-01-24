const express = require('express')  
const router = express.Router()
const authMiddleware = require('../middleware/authVerify');
const csvFileController = require('../controllers/csvFilesController');

router.get('/', authMiddleware.isAuth, csvFileController.getAll )

router.post('/store', authMiddleware.isAuth, csvFileController.store )

router.get('/:id', authMiddleware.isAuth, csvFileController.findById )

router.delete('/:id', authMiddleware.isAuth, csvFileController.delete )

module.exports = router