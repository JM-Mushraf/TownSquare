import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import  ErrorHandler  from "../utils/errorHandler.js";
import mongoose from "mongoose";
import { User } from "../models/userModel.js"



export const createPost = async (req, res) => {
  try {
    const { title, description, type, important, poll, survey } = req.body;

    // Parse poll and survey if they are JSON strings
    const parsedPoll = poll ? JSON.parse(poll) : null;
    const parsedSurvey = survey ? JSON.parse(survey) : null;

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
      if (!parsedPoll || !parsedPoll.question || !parsedPoll.options || parsedPoll.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Polls require a question and at least 2 options.",
        });
      }

      // Ensure each option has text and initialize votes to 0
      parsedPoll.options = parsedPoll.options.map((option) => ({
        text: option,
        votes: 0,
      }));

      // Validate poll deadline (only date, no time)
      if (!parsedPoll.deadline) {
        return res.status(400).json({
          success: false,
          message: "Poll deadline is required.",
        });
      }

      const deadlineDate = new Date(parsedPoll.deadline).toISOString().split('T')[0];
      const currentDate = new Date().toISOString().split('T')[0];

      if (deadlineDate < currentDate) {
        return res.status(400).json({
          success: false,
          message: "Poll deadline must be in the future.",
        });
      }

      // Automatically set poll status based on deadline
      parsedPoll.deadline = deadlineDate; // Ensure deadline only contains the date
      if (deadlineDate > currentDate) {
        parsedPoll.status = "upcoming";
      } else {
        parsedPoll.status = "active";
      }
    }

    // Validate survey fields if type is 'survey'
    if (type === "survey") {
      if (!parsedSurvey || !parsedSurvey.questions || parsedSurvey.questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Surveys require at least one question.",
        });
      }

      // Validate each question
      for (const question of parsedSurvey.questions) {
        if (!question.question || !question.type) {
          return res.status(400).json({
            success: false,
            message: "Each survey question must have a question text and type.",
          });
        }

        // Validate options for multiple-choice questions
        if (
          question.type === "multiple-choice" &&
          (!question.options || question.options.length < 2)
        ) {
          return res.status(400).json({
            success: false,
            message: "Multiple-choice questions require at least 2 options.",
          });
        }
      }

      // Validate survey deadline (only date, no time)
      if (!parsedSurvey.deadline) {
        return res.status(400).json({
          success: false,
          message: "Survey deadline is required.",
        });
      }

      const deadlineDate = new Date(parsedSurvey.deadline).toISOString().split('T')[0];
      const currentDate = new Date().toISOString().split('T')[0];
      console.log("deadlineDate:", deadlineDate);
      console.log("currentDate:", currentDate);
      if (deadlineDate < currentDate) {
        return res.status(400).json({
          success: false,
          message: "Survey deadline must be in the future.",
        });
      }

      // Automatically set survey status based on deadline
      parsedSurvey.deadline = deadlineDate; // Ensure deadline only contains the date
      if (deadlineDate > currentDate) {
        parsedSurvey.status = "upcoming";
      } else {
        parsedSurvey.status = "active";
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
            publicId: uploaded.public_id,
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
      poll: type === "poll" ? parsedPoll : undefined, // Add poll data if type is poll
      survey: type === "survey" ? parsedSurvey : undefined, // Add survey data if type is survey
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
export const getSurveyAndPollPosts = async (req, res) => {
  try {
    // Fetch posts where type is either "survey" or "poll"
    const posts = await Post.find({
      type: { $in: ["survey", "poll"] },
    })
      .populate("createdBy", "username email") // Populate the createdBy field with user details
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    // If no posts are found, return a 404 response
    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No survey or poll posts found.",
      });
    }

    // Map the posts to include the required fields
    const formattedPosts = posts.map((post) => {
      const response = {
        _id:post._id,
        title: post.title, // Include title
        description: post.description, // Include description
        type: post.type, // Include type
        createdBy: post.createdBy, // Include createdBy
        createdAt: post.createdAt, // Include createdAt
        updatedAt: post.updatedAt, // Include updatedAt
        attachments:post.attachments,
      };

      // Include survey or poll based on the post type
      if (post.type === "survey") {
        response.survey = post.survey; // Include survey details
      } else if (post.type === "poll") {
        response.poll = post.poll; // Include poll details
      }

      return response;
    });

    // Return the fetched posts
    res.status(200).json({
      success: true,
      message: "Survey and poll posts fetched successfully.",
      posts: formattedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching survey and poll posts.",
      error: error.message,
    });
  }
};
export const submitVote = async (req, res) => {
  try {
    const { postId } = req.params;
    const { option, response, rating, userId } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Handle poll voting logic
    if (post.type === "poll") {
      // Log poll options and selected option ID
      console.log("Poll Options:", post.poll.options);
      console.log("Selected Option ID:", option);

      // Find the selected option
      const pollOption = post.poll.options.find(
        (opt) => opt._id.toString() === option
      );

      if (!pollOption) {
        return res.status(400).json({
          success: false,
          message: "Invalid option",
        });
      }

      // Initialize votedBy array if it doesn't exist
      if (!pollOption.votedBy || !Array.isArray(pollOption.votedBy)) {
        pollOption.votedBy = [];
      }

      // Check if the user has already voted for this option
      const hasUserVoted = pollOption.votedBy.some(
        (vote) => vote && vote.userId && vote.userId.toString() === userId
      );

      if (hasUserVoted) {
        return res.status(400).json({
          success: false,
          message: "You have already voted for this option",
        });
      }

      // Increment the vote count and add the user to votedBy
      pollOption.votes += 1;
      pollOption.votedBy.push({ userId });
    } else if (post.type === "survey") {
      const surveyQuestion = post.survey.questions[0]; // Assuming there's only one question for simplicity

      if (surveyQuestion.type === "multiple-choice") {
        // Log survey options and selected option ID
        console.log("Survey Options:", surveyQuestion.options);
        console.log("Selected Option ID:", option);

        // Check if options is an array of strings or objects
        if (typeof surveyQuestion.options[0] === "string") {
          // If options is an array of strings, treat option as an index
          const selectedOptionIndex = parseInt(option, 10);

          if (
            isNaN(selectedOptionIndex) ||
            selectedOptionIndex < 0 ||
            selectedOptionIndex >= surveyQuestion.options.length
          ) {
            return res.status(400).json({
              success: false,
              message: "Invalid option",
            });
          }

          // Check if the user has already voted for this question
          const hasUserVoted = surveyQuestion.votes.some(
            (vote) => vote && vote.userId && vote.userId.toString() === userId
          );

          if (hasUserVoted) {
            return res.status(400).json({
              success: false,
              message: "You have already voted for this question",
            });
          }

          // Add the vote with userId
          surveyQuestion.votes.push({
            optionIndex: selectedOptionIndex,
            userId,
          });
        } else {
          // If options is an array of objects, treat option as an _id
          const surveyOption = surveyQuestion.options.find(
            (opt) => opt._id.toString() === option
          );

          if (!surveyOption) {
            return res.status(400).json({
              success: false,
              message: "Invalid option",
            });
          }

          // Check if the user has already voted for this question
          const hasUserVoted = surveyQuestion.votes.some(
            (vote) => vote && vote.userId && vote.userId.toString() === userId
          );

          if (hasUserVoted) {
            return res.status(400).json({
              success: false,
              message: "You have already voted for this question",
            });
          }

          // Add the vote with userId
          surveyQuestion.votes.push({
            optionIndex: surveyQuestion.options.indexOf(surveyOption),
            userId,
          });
        }
      } else if (surveyQuestion.type === "open-ended") {
        // Handle open-ended response logic
        if (!response) {
          return res.status(400).json({
            success: false,
            message: "Response is required for open-ended questions",
          });
        }

        // Check if the user has already responded to this question
        const hasUserResponded = surveyQuestion.responses.some(
          (resp) => resp && resp.userId && resp.userId.toString() === userId
        );

        if (hasUserResponded) {
          return res.status(400).json({
            success: false,
            message: "You have already responded to this question",
          });
        }

        // Add the response with userId
        surveyQuestion.responses.push({
          response,
          userId,
        });
      } else if (surveyQuestion.type === "rating") {
        // Handle rating logic
        if (typeof rating !== "number" || rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: "Invalid rating. Must be a number between 1 and 5",
          });
        }

        // Check if the user has already rated this question
        const hasUserRated = surveyQuestion.ratings.some(
          (rate) => rate && rate.userId && rate.userId.toString() === userId
        );

        if (hasUserRated) {
          return res.status(400).json({
            success: false,
            message: "You have already rated this question",
          });
        }

        // Add the rating with userId
        surveyQuestion.ratings.push({
          rating,
          userId,
        });
      }
    }

    // Save the updated post
    await post.save();

    res.status(200).json({
      success: true,
      message: "Vote submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting vote",
      error: error.message,
    });
  }
};

export const viewResults = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate postId
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    // Find the post with only necessary fields
    const post = await Post.findById(postId, { type: 1, poll: 1, survey: 1 }).exec();

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the post is a poll or survey
    if (post.type !== "poll" && post.type !== "survey") {
      return res.status(400).json({
        success: false,
        message: "This post is not a poll or survey",
      });
    }

    // Initialize the results object
    const results = {};

    // Handle poll results
    if (post.type === "poll" && post.poll) {
      results.poll = {
        question: post.poll.question,
        options: post.poll.options.map((option) => ({
          text: option.text,
          votes: option.votes,
          votedBy: option.votedBy,
        })),
        totalVotes: post.poll.options.reduce((acc, option) => acc + option.votes, 0),
      };
    }

    // Handle survey results
    if (post.type === "survey" && post.survey) {
      results.survey = {
        questions: await Promise.all(
          post.survey.questions.map(async (question) => {
            const questionResult = {
              question: question.question,
              type: question.type,
            };

            // Handle multiple-choice questions
            if (question.type === "multiple-choice") {
              questionResult.options = await Promise.all(
                question.options.map(async (option, index) => {
                  const votes = question.votes.filter((vote) => vote.optionIndex === index);
                  const votedByUsers = await Promise.all(
                    votes.map(async (vote) => {
                      const user = await User.findById(vote.userId, { username: 1 }).exec();
                      return user ? user.username : "Unknown User";
                    })
                  );

                  return {
                    text: option,
                    votes: votes.length,
                    votedBy: votedByUsers,
                  };
                })
              );
              questionResult.totalVotes = question.votes.length;
            }

            // Handle open-ended questions
            if (question.type === "open-ended") {
              questionResult.responses = await Promise.all(
                question.responses.map(async (response) => {
                  const user = await User.findById(response.userId, { username: 1 }).exec();
                  return {
                    response: response.response,
                    userId: response.userId,
                    username: user ? user.username : "Unknown User",
                  };
                })
              );
              questionResult.totalResponses = question.responses.length;
            }

            // Handle rating questions
            if (question.type === "rating") {
              const totalRatings = question.ratings.length;
              const averageRating =
                totalRatings > 0
                  ? question.ratings.reduce((acc, rating) => acc + rating.rating, 0) / totalRatings
                  : 0;

              questionResult.ratings = await Promise.all(
                question.ratings.map(async (rating) => {
                  const user = await User.findById(rating.userId, { username: 1 }).exec();
                  return {
                    rating: rating.rating,
                    userId: rating.userId,
                    username: user ? user.username : "Unknown User",
                  };
                })
              );
              questionResult.averageRating = averageRating;
              questionResult.totalRatings = totalRatings;
            }

            return questionResult;
          })
        ),
        totalQuestions: post.survey.questions.length,
      };
    }

    // Return the results
    return res.status(200).json({
      success: true,
      results: results,
    });
  } catch (error) {
    console.error("Error in viewResults controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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