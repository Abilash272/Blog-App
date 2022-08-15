const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')

const authRouter = require('./routes/auth')
const userRouter = require('./routes/Users')
const postsRouter = require('./routes/Posts')
const categoryRouter = require('./routes/Categories')

const app = express()
dotenv.config()
app.use(express.json())
app.use("/public", express.static(path.join(__dirname, "/public")))

mongoose.connect(process.env.MONGO_URL, () => {console.log('db connected')})

const storage = multer.diskStorage({
    destination: 'public/images',
    filename: (req, file, cb) => {
        cb(null, req.body.name)
    }
})

const upload = multer({ storage: storage })
app.post("/api/upload", upload.single('file'), (req, res) => {
    res.status(200).json('file has been uploaded')
})

app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/posts", postsRouter)
app.use("/api/category", categoryRouter)

app.listen(5000, () => {
    console.log('Server running on port 5000');
})