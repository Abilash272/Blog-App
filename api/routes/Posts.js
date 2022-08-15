const express = require("express")
const router = express.Router()
const User = require('../models/User') 
const Post = require('../models/Post')
const fs = require('fs')

router.post('/', async (req,res) => {
    const newPost = new Post(req.body)
    try{
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    }catch (err) {
        res.status(500).json(err)
    }
})

router.put('/:id', async (req,res) => {
        try{
            const post = await Post.findById(req.params.id)
            if(post){
                if(post.username === req.body.username){
                    try{
                        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
                            $set: req.body
                        }, { new: true }) 
                        if (post.photo !== updatedPost.photo) {
                            fs.unlink(`public/images/${post.photo}`, (err) => {})
                        }
                        res.status(200).json(updatedPost)
                    }catch{
                        res.status(500).json(err)
                    }
                }else{
                    res.status(401).json("you can only update your post")
                }
            }else{
                res.status(404).json("no such post exist")
            }
        }catch (err) {
            res.status(500).json(err)
        }
    })

router.delete('/:id', async (req,res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(post){
            if(post.username === req.body.username){
                try{
                    fs.unlink(`public/images/${post.photo}`, (err) => {console.log(err);})
                    await Post.findByIdAndDelete(req.params.id)
                    
                    res.status(200).json("Post has been deleted...")
                }catch{
                    res.status(500).json(err)
                }
            }else{
                res.status(401).json("you can only delete your post")
            }
        }else{
            res.status(404).json("no such post exist")
        }
    }catch (err) {
        res.status(500).json(err)
    }
})

router.get('/:id', async (req,res) => {
    try{
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    }catch(err){
        res.status(401).json("no such post exist")
    }
})

router.get('/', async (req,res) => {
    const username = req.query.user
    const catName = req.query.cat
    try{
        let Posts
        if(username) {
            Posts = await Post.find({username: username})
        }else if(catName){
            Posts = await Post.find({categories: {
                $in: [catName]
            }})
        }else{
            Posts = await Post.find()
        }
        res.status(200).json(Posts)
    }catch(err){
        res.status(500).json(err)
    }
})


module.exports = router