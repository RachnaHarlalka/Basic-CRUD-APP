const express = require('express')
const app = express()
const dotenv = require("dotenv")
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const PORT = process.env.PORT ||  8000

//middleware

app.use(express.json());

//connecting to database

mongoose.connect("mongodb://localhost:27017/shop360" ,
 { useNewUrlParser : true , useUnifiedTopology: true}, 
 ()=> {
    console.log("Database connected successfully")
})

//User Schema

const userSchema = new mongoose.Schema({
    name : String,
    email : {type : String , unique : true},
    password : String,
    age: Number
}, {
    timestamps : true
})

const userModel = new mongoose.model('users', userSchema);


//category schema

const categorySchema = new mongoose.Schema({
    name: String
}, {
    timestamps : true
})

const categoryModel = new mongoose.model('categories', categorySchema)

//product schema

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description : String,
    rating : Number,
    color : String
}, {
    timestamps : true
})

const productModel = new mongoose.model('products', productSchema)

//routes

//User routes

app.get('/users',verifyToken,async (req,res)=>{
    let users = await userModel.find();;
    res.send({users : users})
})
app.post('/users/register', (req,res)  => {
    console.log("post route created")
    let user = req.body;
    const userObj = new userModel(user);
    userObj.save().then(()=>{
        res.send({message : "User created successfully"}).catch((err)=>{
            res.send({message : "Some problem occured while created the user"})
        })
    })  
})
app.post('/users/login',async (req,res)=>{

    let userDetails = req.body
    let count = await userModel.find(userDetails).countDocuments();
    if(count ===1){

        jwt.sign({user : userDetails}, "secretKeyAnything",(err,token)=>{

            if(err===null){
                res.send({token : token})
            }
            else{
                res.send({message:"Some error occured"})
            }
        })
        
    }
    else{
        res.send({message : "user not found"})
    }
})
// product routes
app.get('/products',verifyToken, async (req,res)  => {

         let products =   await productModel.find();
         res.send({products : products});

})

app.get('/products/:id',verifyToken, async (req,res)  => {

    let product =   await productModel.findById(req.params.id)
    res.send({product : product});

})

app.post('/products', verifyToken,(req,res)  => {
    let product = req.body;
    const productObj = new productModel(product);
    productObj.save().then(()=>{
        res.send({message: "product created successfully"})
    }).catch((err)=>{
        res.send({message:"Some error while creating product"})
    })
})

app.delete('/products/:id',verifyToken,(req,res)=>{

    let id = req.params.id;

    productModel.deleteOne({_id : id}).then(()=>{
        res.send({message : "Product deleted successfully"})
    }).catch((err)=>{
        res.send({message : "Some error while deleting "})
    
    })
})

app.put('/products/:id',verifyToken,(req,res)=>{

    let id = req.params.id;
    let product = req.body;

    productModel.updateOne({_id : id},{$set : product}).then(()=>{
        res.send({message: "product updated successfully"})
    }).catch((err)=>{
        res.send({message:"Some error while updating product"})
    })

    
})
//category routes

app.get('/categories', verifyToken,async (req,res) => {

    let categories =   await categoryModel.find();
         res.send({categories : categories});

   
})
app.post('/categories', verifyToken,(req,res)  => {
    let category = req.body;
    const categoryObj = new categoryModel(category);
    categoryObj.save().then(()=>{
        res.send({message: "Category created successfully"})
    }).catch((err)=>{
        res.send({message:"Some error while creating category"})
    })
})

app.delete('/categories/:id',verifyToken,async (req,res)=>{

let id = req.params.id;
categoryModel.deleteOne({_id : id}).then(()=>{
    res.send({message : "Product deleted successfully"})
}).catch((err)=>{
    res.send({message : "Some error while deleting "})

})
})

//token verification
function verifyToken(req,res,next){

    if(req.headers.authorization !== undefined){
   let token = req.headers.authorization.toString().split(" ")[1];

   jwt.verify(token,"secretKeyAnything",(err,userCredentials)=>{
       if(err===null){
           next();

       }
       else{
           res.send({message: " cannot verify the token try agian"})
       }

   })
}
else{
    res.send({message:"Please authenticate yourself first"})

}
}
 
app.listen(PORT, ()=>{

    console.log(`Listening on port ${PORT}`)
})
