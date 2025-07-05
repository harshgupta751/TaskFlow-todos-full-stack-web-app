import mongoose from "mongoose";
const Schema=mongoose.Schema
const ObjectId=Schema.Types.ObjectId
import dotenv from 'dotenv'
dotenv.config()

mongoose.connect(process.env.MONGOOSE_URL)

const UserSchema= new Schema({
username: {type: String, unique:true},
password: String
})


const todoSchema = new Schema({
title:String,
deadline: String,
priority: String,
userId: ObjectId
})


export const UserModel=mongoose.model('Users',UserSchema)
export const todoModel= mongoose.model('Todos', todoSchema)

