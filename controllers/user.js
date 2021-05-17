const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')


exports.getAllUsers = (req, res, next) => {
    User.find().select("name email _id password").then(data => {
        const allUsers = {totalUsers: data.length, users: data.map(user => {
            return {
                userId : user._id,
                name: user.name,
                email: user.email,
                password: user.password
            }
        })
    }
    if (data.length >= 0) {
        res.status(200).json(allUsers)
    } else {
        res.status(404).json({
            message: 'No entries found'
        })
    }
})
.catch(err => {
    res.status(500).json({
        message: 'Error occured in the database',
        error: err
    })
})
}


exports.getOneUser = (req, res, next) => {
    const id = req.params.userId
    User.findById(id).select("name email _id password").then(data => {
        if (data) {
            res.status(200).json({
                user: data
            })
        } else {
            res.status(404).json({
                message: "There is no valid userID"
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            message: 'Error occured in the database',
            error: err
        })
    })
}


exports.postSignUp = (req, res, next) => {
    User.findOne({ email: req.body.email }).then(exits => {
        if (exits) {
            return res.status(409).json({
                message: "Email already exists"
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Error hashing password',
                        error: err
                    })
                } else {
                    const user = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: hashedPassword
                    })
                    user.save().then(result => {
                        res.status(201).json({
                            message: "User created",
                            user: user
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            message: 'Error occured in the database',
                            error: err
                        })
                    })
                }
            })
        }
    })
}


exports.postSignIn = (req, res, next) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid email or password"
                })
            } if (result) {
                const token = jwt.sign({email: user.email, userId: user._id}, process.env.JWT_KEY, {expiresIn: "1h"})
                return res.status(200).json({
                    message: "User signed in successfully",
                    userId: user._id,
                    userToken: token
                })
            }
            res.status(401).json({
                message: "Error in signing user in"
            })
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Error occured in the database',
            error: err
        })
    })
}


exports.resetPassword = (req, res, next) =>{
    crypto.randomBytes(32, (err, buffer) =>{
        if(err){
            res.status(500).json({
                message: 'invalid email'
            })
        }else{
            const passResetToken = buffer.toString('hex')
            User.findOne({email: req.body.email}).then(user =>{
                if(!user){
                    res.status(500).json({
                        message: 'User does not exist'
                    })
                }
                user.resetToken = passResetToken
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save().then(result =>{
                    res.status(500).json({
                        message: ` token is ${passResetToken}`
                    })
                })
                .catch(err =>{
                    res.status(500).json({
                        message: 'could not get token'
                    })
                })
            })
            .catch(err =>{
                res.status(500).json({
                    message: 'Error occured in the database'
                })
            })
        }
    })
}


/*exports.newPassword = (req, res, next) =>{
    const newPassword = req.body.password
    const email = req.body.email
    const userPasswordToken = req.body.passToken
    let resetUser
    User.findOne({resetToken: userPasswordToken, resetTokenExpiration: {$gt: Date.now()}, email: email}).then(user =>{
        resetUser = user
        resetUser.password = req.body.password
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined
        return resetUser.save().then(result =>{
            res.status(500).json({
                message: 'Password changed successfully'
            })
        })
        .catch(err =>{
            res.status(500).json({
                message: 'Could not save password'
            })
        })
    })
    .catch(err =>{
        res.status(500).json({
            message: 'Invalid user or the token is expired'
        })
    })
}*/


exports.newPassword = async (req, res, next) =>{
    const email = req.body.email
    const userPasswordToken = req.body.passToken
    let hashed_passsword = await bcrypt.hash(req.body.password, 10)
    let resetUser
    User.findOne({resetToken: userPasswordToken, resetTokenExpiration: {$gt: Date.now()}, email: email}).then(user =>{
        resetUser = user
        resetUser.password = hashed_passsword
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined
        return resetUser.save().then(result =>{
            res.status(500).json({
                message: 'Password changed successfully'
            })
        })
        .catch(err =>{
            res.status(500).json({
                message: 'Could not save password'
            })
        })
    })
    .catch(err =>{
        res.status(500).json({
            message: 'Invalid user or the token is expired'
        })
    })
}


exports.deleteUser = (req, res, next) => {
    const id = req.params.userId
    User.findByIdAndDelete(id).then(result => {
        res.status(200).json({
            message: "User have been deleted"
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Error from the database',
            error: err
        })
    })
}