const express = require('express')
const router = express.Router()

const authCtrl = require('../controllers/user')
const userAuth = require('../middleware/user-auth')

router.get('/', authCtrl.getAllUsers)
router.get('/:userId', authCtrl.getOneUser)
router.post('/signin', authCtrl.postSignIn)
router.post('/signup', authCtrl.postSignUp)
router.put('/resetpassword', authCtrl.resetPassword)
router.put('/newpassword', authCtrl.newPassword)
router.delete("/:userId", userAuth, authCtrl.deleteUser)

module.exports = router