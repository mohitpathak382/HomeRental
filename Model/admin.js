const mongoose = require("mongoose");
const {schema}=mongoose;
const AdminSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        require:true
    },
    email:{
        type:String,
        trim:true,
        require:true
    },
    password:{
        type:String,
        require:true
    },
})
const admin=mongoose.model('Admin',AdminSchema);
module.exports= admin;