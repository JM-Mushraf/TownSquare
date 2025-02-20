import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, description, type, attachments } = req.body;
    // console.log(req.user);
    // {
    //     _id: new ObjectId('67a0cf338b5eb8780062916c'),
    //     username: 'himanshu',
    //     email: 'himpreetak@gmail.com',
    //     avatar: 'http://res.cloudinary.com/dqlcy9wmd/image/upload/v1738592051/lupv6il21g7ckwxiejq0.png',
    //     avatarPublicId: 'lupv6il21g7ckwxiejq0',
    //     createdAt: 2025-02-03T14:14:11.928Z,
    //     updatedAt: 2025-02-03T14:14:11.928Z,
    //     __v: 0
    //   }
    
    const createdBy = req.user._id; // Assuming user ID is available via authentication middleware

    // Validate required fields
    if (!title || !description || !type) {
      return res
        .status(400)
        .json({ message: "Title, description, and type are required." });
    }

    const newPost = new Post({
      title,
      description,
      type,
      createdBy,
      attachments,
    });

    await newPost.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Post created successfully",
        post: newPost,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating post",
        error: error.message,
      });
  }
};

// Delete a post (Only the creator can delete)
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id; // Assuming user ID is available via authentication middleware

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting post",
        error: error.message,
      });
  }
};

// Get all posts (Feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching posts",
        error: error.message,
      });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate(
      "createdBy",
      "name email"
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching post",
        error: error.message,
      });
  }
};


// Upvote a post (User can only upvote once)
export const upvotePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming authentication middleware is used

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Check if the user has already voted
        const existingVote = post.votedUsers.find(vote => vote.userId.toString() === userId.toString());

        if (existingVote) {
            if (existingVote.voteType === "upvote") {
                return res.status(400).json({ success: false, message: "You have already upvoted this post" });
            } else {
                // User previously downvoted, switch to upvote
                post.downVotes -= 1;
                existingVote.voteType = "upvote";
                post.upVotes += 1;
            }
        } else {
            // New upvote
            post.upVotes += 1;
            post.votedUsers.push({ userId, voteType: "upvote" });
        }

        await post.save();
        res.status(200).json({ success: true, message: "Post upvoted successfully", upVotes: post.upVotes });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error upvoting post", error: error.message });
    }
};

// Downvote a post (User can only downvote once)
export const downvotePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming authentication middleware is used

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Check if the user has already voted
        const existingVote = post.votedUsers.find(vote => vote.userId.toString() === userId.toString());

        if (existingVote) {
            if (existingVote.voteType === "downvote") {
                return res.status(400).json({ success: false, message: "You have already downvoted this post" });
            } else {
                // User previously upvoted, switch to downvote
                post.upVotes -= 1;
                existingVote.voteType = "downvote";
                post.downVotes += 1;
            }
        } else {
            // New downvote
            post.downVotes += 1;
            post.votedUsers.push({ userId, voteType: "downvote" });
        }

        await post.save();
        res.status(200).json({ success: true, message: "Post downvoted successfully", downVotes: post.downVotes });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error downvoting post", error: error.message });
    }
};


// COMMENT
export const addComment = async (req, res) => {
    try {
        const { postId, message } = req.body;
        const userId = req.user.id; // Assuming user is authenticated

        // Create a new comment
        const comment = new Comment({ postId, userId, message });
        await comment.save();

        // Add comment reference to the post
        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

        res.status(201).json({ success: true, message: "Comment added", comment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//poll
export const createPoll = async (req, res) => {
  try {
    const { title, solutions } = req.body;
    const createdBy = req.user._id;

    // Validate required fields
    if (!title || !solutions || !Array.isArray(solutions) || solutions.length < 2 || solutions.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Title and 2 to 5 solutions are required.",
      });
    }

    // Format solutions with initial votes
    const formattedSolutions = solutions.map((solution) => ({
      text: solution,
      votes: 0,
    }));

    const newPoll = new Post({
      title,
      type: "poll",
      createdBy,
      solutions: formattedSolutions,
    });

    await newPoll.save();
    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: newPoll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating poll",
      error: error.message,
    });
  }
};
