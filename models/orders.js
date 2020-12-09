const mongoose = require('mongoose');
const mongodb = require('mongodb');

const orderSchema = new mongoose.Schema({
user : {
    userId : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
},
items : [
    {
        product : {
            type : Object,
            required : true
        },
        quantity : {
            type : Number,
            required : true
        }
    }
],
date : {
    type : Date,
    default : Date.now
}
})



module.exports = mongoose.model('Order' , orderSchema);