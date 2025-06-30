import express from 'express';
const app= express();
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import bcrypt from 'bcrypt';
import {todoModel, UserModel} from './db'
import { loginSchema, signupSchema, todoStructure } from './Validators/user';
import { AllErrors } from './Utility/ErrorFormatterZod';
import { configDotenv } from 'dotenv';
import { userAuth } from './Middlewares/userAuth';





app.use(express.json())

app.post('/signup',async function(req,res){

const response=signupSchema.safeParse(req.body);
if(!response.success){
    res.status(400).json({
        errors: AllErrors(response.error.errors)
    })
    return
}

const username=req.body.username;
const password=req.body.password;
const hashedPassword=await bcrypt.hash(password,5);

     try{  
        await UserModel.create({
        username,
        password: hashedPassword
        })

        res.json({
            message: "SignedUp Successfull!"
        })
    }catch(e){
        res.json({
            message: "Username already exists!"
        })
    }

})


app.post('/signin', async function(req,res){
const response= loginSchema.safeParse(req.body);

if(!response.success){
    res.status(400).json({
     errors: AllErrors(response.error.errors)
    });
    return
}

const username=req.body.username;
const password=req.body.password;

const findUser=await UserModel.findOne({
    username
})

if(!findUser){
    res.status(401).json({
        message: "Username does not exist!"
    })
    return
}
const check=await bcrypt.compare(password,findUser.password);

if(!check){
res.status(401).json({
    message: "Password is Incorrect!"
})
return
}

const token=jwt.sign({
    id: findUser._id
},process.env.JWT_SECRET)

res.json({
    token
})

})


app.use(userAuth)

app.post('/create',async function(req,res){
    const response=todoStructure.safeParse(req.body)

if(!response.success){
    res.status(400).json({
        errors: AllErrors(response.error.errors)
    })
    return
}

 await todoModel.create({
        title: req.body.title,
        deadline: req.body.deadline,
        priority: req.body.priority,
        userId: req.id
    })
    res.json({
        message: "Todo is created!"
    })



})

app.get('getAll',async function(req,res){

const AllTodos=await todoModel.find({
    userId: req.id
})

res.json({
    AllTodos
})
})

app.put('/update',async function(req,res){
const response=todoStructure.safeParse(req.body)

if(!response.success){
    res.status(400).json({
        errors: AllErrors(response.error.errors)
    })
    return
}

const title=req.body.title
const deadline=req.body.deadline
const priority=req.body.priority
const todoId=req.body.todoId

await todoModel.updateOne({
_id: todoId,
userId: req.id

},{
    title,
    deadline,
    priority,
    userId: req.id
})

res.json({
    message: "Updated Successfully!"
})


})

app.delete('/delete',async function(req,res){
 const todoId=req.body.todoId

await todoModel.deleteOne({
    _id: todoId,
    userId: req.id
})

res.json({
    message: "Deleted successfully!"
})
    
})

app.delete('/deleteAll',async function(req,res){

await todoModel.deleteMany({
    userId: req.id
})

res.json({
    message: "Deleted All successfully!"
})

   
})




app.listen(3000)
 