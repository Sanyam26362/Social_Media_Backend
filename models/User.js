const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    password:{
        type: String,
        required :true,
    },
    createdAt:{
        type: Date,
        default: Date.now,

    },
    followers:[
        {
            type:Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    following: [
        {
            type:Schema.Types.ObjectId,
            ref: 'User',
        },
    ],

    
});
module.exports = mongoose.model('User',UserSchema);