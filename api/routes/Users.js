const express = require("express")
const router = express.Router()
const User = require('../models/User') 
const Post = require('../models/Post')
const bcrypt = require('bcrypt')
const fs = require('fs')

router.put('/:id', async (req,res) => {
    if(req.body.userId === req.params.id){
        if(req.body.password){
            const saltRounds = 10
            req.body.password = await bcrypt.hash(req.body.password, saltRounds)
        }
        try{
            const user = await User.findById(req.params.id)
            const oldImg = user.profilePic
            const updatedUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            }, { new: true })
            if (oldImg !== updatedUser.profilePic) {
                fs.unlink(`public/images/${oldImg}`,(err) => {})
            }
            if (user.username !== updatedUser.username) {
                const posts = await Post.find({username: user.username}) 
                posts.map( async (post) => {
                    await Post.findByIdAndUpdate(post._id, {
                        username: updatedUser.username
                    })
                })              
            }
            res.status(200).json(updatedUser)
        }catch (err) {
            res.status(500).json(err)
        }
    }else{
        res.status(401).json("you are only allowed to edit your account!")
    }
})

router.delete('/:id', async (req,res) => {        
    if(req.body.userId === req.params.id){
        try{
            const user = await User.findById(req.params.id)
            fs.unlink(`public/images/${user.profilePic}`, (err) => {})
            const posts = await Post.find({ username: user.username })
            posts.map((post) => {
                fs.unlink(`public/images/${post.photo}`, (err) => {})
            })
            await Post.deleteMany({ username: user.username })
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("user has been deleted")
        }catch (err) {
            res.status(500).json(err)
        }
    }else{
        res.status(401).json("you are only allowed to delete your account!")
    }
})

router.get('/:id', async (req,res) => {
    try{
        const user = await User.findById(req.params.id)
        const {password, ...others} = user._doc
        res.status(200).json(others)
    }catch{
        res.status(404).json("user dont exist")
    }
})


module.exports = router