const mongoose=require("mongoose");
const {Schema}=mongoose;
const customerSchema =new mongoose.Schema({
    username:{
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
    contact :{
        type:Number,
        trim:true,
        require:true 
    },
    gender:{
        type:String,
        trim:true,
        require:true
    },
    address:{
        type:String,
        trim:true,
        require:true
    },
    feedback:{
        type:Number
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'House',default: [], }], 
})
const user=mongoose.model('Customer',customerSchema);
module.exports=user;
