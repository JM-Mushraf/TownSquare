import express from 'express'
import { upload } from "../middlewares/multer.js";
export const postRouter=express.Router();

import { isAuthenticated } from '../middlewares/auth.js';
import { addComment, createPost, deletePost, downvotePost, getAllPosts, getPostById, upvotePost,createPoll,getAllAnnouncements,getSurveyAndPollPosts,submitVote,viewResults,getMarketplacePosts,sendMessageToSeller,getCountyPosts} from '../controllers/postController.js';

postRouter.post(
    "/create",
    isAuthenticated,
    upload.fields([{ name: "attachments", maxCount: 3 }]), 
    createPost
);
postRouter.get('/all',isAuthenticated,getAllPosts);
postRouter.delete('/:postId',isAuthenticated,deletePost)
postRouter.post('/comment',isAuthenticated,addComment)
postRouter.get("/getFeed", isAuthenticated, getCountyPosts);
postRouter.get("/survey-and-poll-posts", getSurveyAndPollPosts);
postRouter.post('/:postId/vote',isAuthenticated, submitVote);
postRouter.get('/:postId/results',isAuthenticated,viewResults);
postRouter.get("/marketplacePosts", isAuthenticated, getMarketplacePosts);
postRouter.post("/marketplacePosts/:postId/message", isAuthenticated, sendMessageToSeller);

postRouter.get('/up/:postId',isAuthenticated,upvotePost)
postRouter.get('/down/:postId',isAuthenticated,downvotePost)
postRouter.get('/:postId',isAuthenticated,getPostById);
postRouter.post('/createPoll',isAuthenticated,createPoll)
postRouter.get('/announcements/all',isAuthenticated,getAllAnnouncements)