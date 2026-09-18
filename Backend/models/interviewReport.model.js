import mongoose from "mongoose";
import User from "./User.js";
// Job Description  : String
// Resume text 
// self description

const technicalQuestion = new mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    intention:{
        type:String,
        required:true
    },
    answer:{
        type:String,
        required:true
    }
},{
    _id:false
})
const behaviourQuestion = new mongoose.Schema({
        question:{
        type:String,
        required:true
    },
    intention:{
        type:String,
        required:true
    },
    answer:{
        type:String,
        required:true
    }
},{
    _id:false
})
const skillGaps = new mongoose.Schema({
    skill:{
        type:String,
        required:true
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:true
    }
},{
    _id:false
})
const preparationPlan = new mongoose.Schema({
    day:{
        type:Number,
        required:true
    },
    focus:{
        type:String,
        required:true
    },
    tasks:[
        {
            type:String,
            required:true
        }
    ]
})
const interviewReportSchema = new mongoose.Schema({
    jobDescription:{
        type:String,
        required:true
    },
    resumeText:{
        type:String
    },
    selfDescription:{
        type:String       
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    technicalQuestionSchema:[technicalQuestion],
    behaviourQuestionSchema : [behaviourQuestion],
    skillGapsSchema:[skillGaps],
    preparationPlanSchema:[preparationPlan],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
        
},{
    timestamps:true
})
export default mongoose.model("InterViewReport",interviewReportSchema)