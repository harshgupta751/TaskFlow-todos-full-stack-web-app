import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export function userAuth(req,res,next){
  const authHeader= req.headers.authorization

if(!authHeader || !authHeader.startsWith("Bearer ")){
    res.status(401).json({
        message: "You are not SignedIn!"
    })
    return 
}
const token=authHeader.split(" ")[1]
try{
const decoded=jwt.verify(token,process.env.JWT_SECRET)
req.id=decoded.id
next()

}catch(e){
    res.status(401).json({
        message: "You are not SignedIn!"
    })
}

}