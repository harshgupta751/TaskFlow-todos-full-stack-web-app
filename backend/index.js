import express from 'express';
const app= express();
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import bcrypt from 'bcrypt';
import {UserModel, todoModel} from './db.js'
import { loginSchema, signupSchema, todoStructure } from './Validators/user.js';
import { AllErrors } from './Utility/ErrorFormatterZod.js';
import dotenv from 'dotenv'
dotenv.config()
import { userAuth } from './Middlewares/userAuth.js';
import cors from 'cors'


app.use(cors({
    origin: ['http://localhost:5173','https://todoflow-todos-web-app.netlify.app/'],
    credentials: true
}))

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
            message: "SignedUp Successfull! Redirecting..."
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
let findUser={}
try{
 findUser=await UserModel.findOne({
    username
})
}catch(e){
    res.status(500).json({
        error: "Error Occured. Something wrong happened at server!"
    })
    return
}

if(!findUser){
    res.json({
        message: "Username does not exist!"
    })
    return
}

const check=await bcrypt.compare(password,findUser.password);

if(!check){
res.json({
    message: "Password is Incorrect!"
})
return
}

const token=jwt.sign({
    id: findUser._id
},process.env.JWT_SECRET)

res.json({
    token,
    username
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

try{
 await todoModel.create({
        title: req.body.title,
        deadline: req.body.deadline,
        priority: req.body.priority,
        userId: req.id
    })
    res.json({
        message: "Todo is created!"
    })
}catch(e){
    res.status(500).json({
        error: "Error Occured. Something wrong happened at server!"
    })
}

})

app.get('/getAll',async function(req,res){
let AllTodos=[]
    try{
     AllTodos=await todoModel.find({
    userId: req.id
})

res.json({
    AllTodos
})
    }catch(e){
         res.status(500).json({
        error: "Error Occured. Something wrong happened at server!"
    })
    }

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

try{
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
}catch(e){
             res.status(500).json({
        error: "Error Occured. Something wrong happened at server!"
    })
}


})

app.delete('/delete/:id',async function(req,res){
 const todoId=req.params.id

 try{
await todoModel.deleteOne({
    _id: todoId,
    userId: req.id
})

res.json({
    message: "Deleted successfully!"
})
 }catch(e){
             res.status(500).json({
        error: "Error Occured. Something wrong happened at server!"
    })
 }
    
})

app.delete('/deleteAll',async function(req,res){

    try{
await todoModel.deleteMany({
    userId: req.id
})

res.json({
    message: "Deleted All successfully!"
})
    }catch(e){
              res.status(500).json({
        error: "Error Occured. Something wrong happened at server!"
    })
    }

   
})




app.listen(process.env.PORT)
 