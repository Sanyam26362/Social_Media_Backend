const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    content:{
        type:String,
        required:true,
        maxlength:280,
    },
    likes:[
        {
            types:Schema.types.ObjectId,
            ref:'User',
        },

    ],
    createdAt:{
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model('Post',PostSchema);