import express from "express"
import cors from "cors"
import mongoose from "mongoose";
import User from "./models/register.js"
import 'dotenv/config'
import bcrypt from "bcrypt"

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URL,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
}).then(()=>{
  console.log("DB connection Successful");
}).catch((err)=>{
  console.log(err.message);
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register',async (req, res) => {
  // const values=req.body;
  const {username,email,password}=req.body;
  const userCheck=await User.findOne({username})
  if(userCheck){
    res.json({msg:"Username already exist",status:false})
  }
  const emailCheck=await User.findOne({email})
  if(emailCheck){
    res.json({msg:"Email already used",status:false})
  }
  const hashedPassword=await bcrypt.hash(password,10)
  const user=await User.create({
    username,email,password:hashedPassword
  })
  delete user.password;
  res.json({status:true,user})
})

app.post('/login',async (req, res) => {
  const {username,password}=req.body;
  const user=await User.findOne({username})
  if(!user){
    res.json({msg:"Incorrect username or password",status:false})
  }
  const isPasswordValid=bcrypt.compare(password,user.password)
  if(!isPasswordValid){
    res.json({msg:"Incorrect username or password",status:false})
  }
  delete user.password
  res.json({status:true,user})
})

app.post("/setAvatar",async (req,res)=>{
  const userId=req.body.userID;
  const avatarImage=req.body.image;
  const userData=await User.findByIdAndUpdate(userId,{
    isAvatarImageSet:true,
    avatarImage,
  })
  res.json({isSet:userData.isAvatarImageSet,image:userData.avatarImage})
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})