import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, description, type, important, poll, survey } = req.body;
    const createdBy = req.user.id; // Assuming user ID is available via authentication middleware

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and type are required.",
      });
    }

    // Additional validation for announcements
    if (type === "announcements" && important === undefined) {
      return res.status(400).json({
        success: false,
        message: "The 'important' field is required for announcements.",
      });
    }

    // Validate poll fields if type is 'poll'
    if (type === "poll") {
      if (!poll || !poll.question || !poll.options || poll.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Polls require a question and at least 2 options.",
        });
      }

      // Ensure each option has text and initialize votes to 0
      poll.options = poll.options.map((option) => ({
        text: option.text,
        votes: 0,
      }));

      // Set default status if not provided
      if (!poll.status) {
        poll.status = "active";
      }
    }

    // Validate survey fields if type is 'survey'
    if (type === "survey") {
      if (!survey || !survey.questions || survey.questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Surveys require at least one question.",
        });
      }

      // Validate each question
      for (const question of survey.questions) {
        if (!question.question || !question.type) {
          return res.status(400).json({
            success: false,
            message: "Each survey question must have a question text and type.",
          });
        }

        // Validate options for multiple-choice questions
        if (question.type === "multiple-choice" && (!question.options || question.options.length < 2)) {
          return res.status(400).json({
            success: false,
            message: "Multiple-choice questions require at least 2 options.",
          });
        }
      }

      // Set default status if not provided
      if (!survey.status) {
        survey.status = "active";
      }
    }

    // Handle attachments (optional)
    let uploadedAttachments = [];
    const attachments_files = req.files?.attachments;

    if (attachments_files && attachments_files.length > 0) {
      // Upload attachments to Cloudinary if provided
      uploadedAttachments = await Promise.all(
        attachments_files.map(async (file) => {
          const uploaded = await uploadOnCloudinary(file.path);
          if (!uploaded) {
            throw new ErrorHandler("Error uploading attachment files", 500);
          }
          return {
            url: uploaded.url,
            fileType: file.mimetype,
          };
        })
      );
    }

    // Create the post
    const newPost = new Post({
      title,
      description,
      type,
      createdBy,
      attachments: uploadedAttachments, // Will be empty if no attachments are provided
      important: type === "announcements" ? important : false, // Set 'important' only for announcements
      poll: type === "poll" ? poll : undefined, // Add poll data if type is poll
      survey: type === "survey" ? survey : undefined, // Add survey data if type is survey
    });

    await newPost.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
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
    // Step 1: Delete all posts where createdBy is null
    // await Post.deleteMany({ createdBy: null });

    // Step 2: Fetch all remaining posts and populate createdBy with user details
    const posts = await Post.find()
      .populate("createdBy", "username email avatar avatarPublicId") // Populate user details
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    // Step 3: Return the remaining posts
    res.status(200).json({
      success: true,
      message: "Posts fetched successfully after cleaning up null createdBy posts",
      posts,
    });
  } catch (error) {
    res.status(500).json({
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


export const getAllAnnouncements = async (req, res) => {
  try {
    // Fetch all announcements and populate the createdBy field with user details
    const announcements = await Post.find({ type: "announcements" })
      .populate("createdBy", "username avatar") // Populate username and avatar
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    // If no announcements are found
    if (announcements.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No announcements found.",
        announcements: [],
      });
    }

    // Return the announcements
    res.status(200).json({
      success: true,
      message: "Announcements fetched successfully",
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};