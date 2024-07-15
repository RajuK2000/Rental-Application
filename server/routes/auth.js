const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")

const User = require("../models/User")

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,"public/uploads/") // store uploaded file in the 'uploads' folder
    },
    filename: function(req, file, cb) {
        cb(null,file.originalname)  // Original Filename
    }
})

const upload = multer({storage})

// User RegisterPage 

router.post("/register", upload.single('profileImage'), async(req, res) => {
    try{
        const {firstName, lastName, email, password} = req.body

        // the uploaded file is available as req.file
        const profileImage = req.file
       
        if(!profileImage){
           return res.status(400).send("No file Uploaded")
        }
        // path to the uploaded  profile photo
        const profileImagePath = profileImage.path

        // Check if user exist
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(409).json({message:"User already exist"})
            }

        // Hass the password
        const salt = await bcrypt.genSalt()
        const hashPassword = await bcrypt.hash(password,salt)
        
        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            profileImage: profileImagePath
        })

        //save new user
         await newUser.save()

        // send succesfull message
        res.status(200).json({message:"User created successfully", user: newUser})
    } catch(err){
         console.log(err)
         res.status(500).json({message: "Registration failed", error:err.message})
    }
})

//User Login

router.post("/login", async(req, res) => {
    // take information from form
       try{
        const {email, password} = req.body

        // Check if user exist
        const user = await User.findOne({email})
        if(!user){
            return res.status(409).json({message:"User doesn't exist"})
            }
            // Check if password is correct
            const isMatch = await bcrypt.compare(password,user.password)
            if(!isMatch){
                return res.status(400).json({message:"Invalid Credentials"})
            }
            //  Generate JWT token
            const token = jwt.sign({ id: user._id}, process.env.JWT_SCRET)
            delete user.password

            // send succesfull message
           res.status(200).json({token, user})
       } catch(err) {
        console.log(err)
        res.status(500).json({message: "Login failed", error:err.message})
       }

})

module.exports = router