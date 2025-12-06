import { MCQ } from "../models/mcq.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.js'
import { Lecture } from "../models/lacture.js";

const createMcq=asyncHandler(async(req,res)=>{

    let { lectureId, question, options, correctAns } = req.body
    
    if(!question || !options || !correctAns || !lectureId){
       throw new apiError(400,"All fields are required")
    }

    
    console.log(typeof(options))
    if (typeof options==='string') {
      try {
        const parsed=JSON.parse(options);
        options=parsed;
      } catch {
        options=options.split(',').map((o)=>o.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(options)) {
      throw new apiError(400, "Option must be an array with at least 3 items");
    }
    
    options=options
      .map((o) => {
        if (typeof o==='string') return o.trim();
        if (o && typeof o==='object') {
          
          const candidate=o.text??o.label ?? o.value ?? o.option ?? '';
          return String(candidate).trim();
        }
        return String(o).trim();
      })
      .filter((o) => o.length > 0);
    if (options.length < 3) {
      throw new apiError(400, `Option must have at least 3 non-empty items. Received: ${JSON.stringify(options)}`);
    }

    if (typeof correctAns === 'object' && correctAns !== null) {
      const candidate = correctAns.text ?? correctAns.label ?? correctAns.value ?? correctAns.option ?? '';
      correctAns = String(candidate).trim();
    } else {
      correctAns = String(correctAns).trim();
    }

    const optLower = options.map((o) => o.toLowerCase());
    const correctLower = correctAns.toLowerCase();
    if (!optLower.includes(correctLower)) {
      throw new apiError(400, `Correct answer must be one of the options. Received correctAns="${correctAns}" options=${JSON.stringify(options)}`);
    }

    const user=await User.findById(req.user._id)

    if (!user || !["instructor","admin"].includes(user.role)) {
      throw new apiError(403,"You are not allowed to create MCQ");
    }
    
    const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
       throw new apiError(404, "Lecture not found");
    }

     const mcq=await MCQ.create(
       {
          lectureId,
          question,
          options,
          correctAns
       }
    )

    const findMcq=await MCQ.findById(mcq._id)

    if(!findMcq){
      throw new apiError(200,"MCQ is not created!")
    }

    return res.status(200)
    .json(
      new apiResponse(200,mcq,"MCQ create successfully!")
    )
})



  const getLectureMcq=asyncHandler(async(req,res)=>{

    const {lectureId} = req.params;
    if (!lectureId) {
      throw new apiError(400, "lectureId is required (in params or body)");
    }

    const allmcq = await MCQ.find({lectureId });

    if (!allmcq || allmcq.length===0) {
      throw new apiError(404, "No MCQs found for this lecture");
    }

    return res.status(200).json(
      new apiResponse(200,allmcq,"All MCQs fetched successfully!")
    )
  })


export {
  createMcq,
  getLectureMcq,
}