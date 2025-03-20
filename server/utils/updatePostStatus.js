import { Post } from "../models/postModel.js";
export const updatePostStatus = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  try {
    // Find posts that need to be updated
    const postsToUpdate = await Post.find({
      $or: [
        // For polls
        {
          "poll.status": { $in: ["active", "upcoming"] },
          $or: [
            { "poll.deadline": { $lte: sevenDaysAgo } }, // Past deadline
            { "poll.deadline": { $lte: now } }, // Deadline matches current date
          ],
        },
        // For surveys
        {
          "survey.status": { $in: ["active", "upcoming"] },
          $or: [
            { "survey.deadline": { $lte: sevenDaysAgo } }, // Past deadline
            { "survey.deadline": { $lte: now } }, // Deadline matches current date
          ],
        },
      ],
    });

    // Update their status
    for (const post of postsToUpdate) {
      if (post.poll) {
        if (post.poll.deadline <= sevenDaysAgo) {
          post.poll.status = "past";
        } else if (post.poll.status === "upcoming" && post.poll.deadline <= now) {
          post.poll.status = "active";
        }
      }
      if (post.survey) {
        if (post.survey.deadline <= sevenDaysAgo) {
          post.survey.status = "past";
        } else if (post.survey.status === "upcoming" && post.survey.deadline <= now) {
          post.survey.status = "active";
        }
      }
      await post.save();
    }

    console.log(`Updated ${postsToUpdate.length} posts.`);
  } catch (error) {
    console.error("Error updating post statuses:", error);
  }
};