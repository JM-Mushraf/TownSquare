import express from 'express'
export const postRouter=express.Router();

import { isAuthenticated } from '../middlewares/auth.js';
import { addComment, createPost, deletePost, downvotePost, getAllPosts, getPostById, upvotePost,createPoll } from '../controllers/postController.js';

postRouter.post('/create',isAuthenticated,createPost);
postRouter.get('/all',isAuthenticated,getAllPosts);
postRouter.delete('/:postId',isAuthenticated,deletePost)
postRouter.post('/comment',isAuthenticated,addComment)

postRouter.get('/up/:postId',isAuthenticated,upvotePost)
postRouter.get('/down/:postId',isAuthenticated,downvotePost)
postRouter.get('/:postId',isAuthenticated,getPostById);
postRouter.post('/createPoll',isAuthenticated,createPoll)