import { Post } from "../models/postModel.js"; // Adjust the import path as necessary

export const updatePostStatus = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(now.getUTCDate() - 2);

  console.log("Current time:", now.toISOString());
  console.log("Seven days ago:", sevenDaysAgo.toISOString());

  try {
    const posts = await Post.find({
      $or: [
        { "poll.status": { $in: ["upcoming", "active"] } },
        { "survey.status": { $in: ["upcoming", "active"] } },
      ],
    });

    console.log(`Found ${posts.length} posts to update.`);

    for (const post of posts) {
      console.log(`Processing post ID: ${post._id}`);

      // Update poll status
      if (post.poll && post.poll.deadline) {
        const creationDate = post.poll.deadline;
        console.log(`Poll creation date: ${creationDate.toISOString()}`);

        if (creationDate <= sevenDaysAgo) {
          post.poll.status = "past";
          console.log("Updated poll status to 'past'");
        } else if (creationDate <= now) {
          post.poll.status = "active";
          console.log("Updated poll status to 'active'");
        } else {
          post.poll.status = "upcoming";
          console.log("Updated poll status to 'upcoming'");
        }
      }

      // Update survey status
      if (post.survey && post.survey.deadline) {
        const creationDate = post.survey.deadline;
        console.log(`Survey creation date: ${creationDate.toISOString()}`);

        if (creationDate <= sevenDaysAgo) {
          post.survey.status = "past";
          console.log("Updated survey status to 'past'");
        } else if (creationDate <= now) {
          post.survey.status = "active";
          console.log("Updated survey status to 'active'");
        } else {
          post.survey.status = "upcoming";
          console.log("Updated survey status to 'upcoming'");
        }
      }

      await post.save();
      console.log(`Post ID ${post._id} saved successfully.`);
    }

    console.log("Post statuses updated successfully.");
  } catch (error) {
    console.error("Error updating post statuses:", error);
  }
};