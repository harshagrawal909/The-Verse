import mongoose from "mongoose"

const ratingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
}, { _id: false });

const replySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

const commentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    replies: [replySchema]
},{ _id: true });



const storySchema = new mongoose.Schema({
    isSeries:{
        type:Boolean,
        default:false
    },
    seriesName:{
        type:String,
        required : function() {
            return this.isSeries;
        }
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    category:{ 
        type:String,
        required:true 
    },
    isFeatured:{ 
        type:Boolean,
        default:false
    },
    coverImage:{
        type:String,
        required:true
    },
    author:{
        type:String,
        default:"Harsh Agrawal"
    },
    tags:[String],
    isPublished:{
        type:Boolean,
        default:false
    },
    ratings:[ratingSchema],
    averageRating: {         
        type: Number,
        default: 0,
    },
    ratingCount: {            
        type: Number,
        default: 0,
    },
    comments: [commentSchema]
},{timestamps:true})

const Story= mongoose.models.story || mongoose.model("story", storySchema);
export default Story