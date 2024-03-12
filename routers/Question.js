const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const QuestionDB = require("../models/Question");


router.post("/", async (req, res) => {
  const questionData = new QuestionDB({
    title: req.body.title,
    body: req.body.body,
    tags: req.body.tag,
    user: req.body.user,
  });

  await questionData
    .save()
    .then((doc) => {
      res.status(201).send(doc);
    })
    .catch((err) => {
      res.status(400).send({
        message: "Question not added successfully",
      });
    });
});



router.get("/:id", async (req, res) => {
  try {
    // console.log("Requested question ID:", req.params.id);
    const questionDetails = await QuestionDB.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
      },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                user: 1,
                answer: 1,
                question_id: 1,
                created_at: 1,
              },
            },
          ],
          as: "answerDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                question_id: 1,
                user: 1,
                comment: 1,
                created_at: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]).exec();

    res.status(200).send(questionDetails);
  } catch (err) {
    console.error("Error:", err);
    res.status(400).send({
      message: "Error fetching question details",
      error: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  const error = {
    message: "Error in retrieving questions",
    error: "Bad request",
  };

  QuestionDB.aggregate([
    {
      $lookup: {
        from: "comments",
        let: { question_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$question_id", "$$question_id"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              // user_id: 1,
              comment: 1,
              created_at: 1,
              // question_id: 1,
            },
          },
        ],
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "answers",
        let: { question_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$question_id", "$$question_id"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              // user_id: 1,
              // answer: 1,
              // created_at: 1,
              // question_id: 1,
              // created_at: 1,
            },
          },
        ],
        as: "answerDetails",
      },
    },
    // {
    //   $unwind: {
    //     path: "$answerDetails",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    {
      $project: {
        __v: 0,
        // _id: "$_id",
        // answerDetails: { $first: "$answerDetails" },
      },
    },
  ])
    .exec()
    .then((questionDetails) => {
      res.status(200).send(questionDetails);
    })
    .catch((e) => {
      console.log("Error: ", e);
      res.status(400).send(error);
    });
});


// Upvote a question
// router.post('/:questionId/upvote', async (req, res) => {
//   try {
//     // Extract the ID token from the Authorization header
//     const idToken = req.headers.authorization.split('Bearer ')[1];

//     // Verify the ID token from the client
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     // Now you have the decoded token, and you can access user information
//     const userId = decodedToken.uid;
//     const questionId = req.params.questionId;

//     // Retrieve the question from the database
//     const question = await QuestionDB.findById(questionId);

//     // Check if the question is found
//     if (!question) {
//       return res.status(404).json({ success: false, message: 'Question not found' });
//     }

//     // Check if the user has already voted
//     if (question.votedBy && question.votedBy.includes(userId)) {
//       return res.status(400).json({ success: false, message: 'User has already upvoted' });
//     }

//     // Increment the vote count
//     question.votes += 1;

//     // Log the values for debugging
//     console.log('req.user:', req.user);
//     console.log('userId:', userId);

//     // Check if userId is defined before further processing
//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'User ID not available' });
//     }

//     // Ensure votedBy is an array (initialize if undefined)
//     question.votedBy = question.votedBy || [];

//     // Push the user ID into the array
//     question.votedBy.push(userId);

//     // Save the updated question
//     await question.save();

//     res.status(200).json({ success: true, votes: question.votes });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });


// Downvote a question
// router.post('/:questionId/downvote', async (req, res) => {
//   try {
//     const questionId = req.params.questionId;

//     // Retrieve the question from the database
//     const question = await QuestionDB.findById(questionId);

//     // Check if the question is found
//     if (!question) {
//       return res.status(404).json({ success: false, message: 'Question not found' });
//     }

//     // Check if the user has already downvoted
//     if (question.downvotedBy.includes(req.user.id)) {
//       return res.status(400).json({ success: false, message: 'User has already downvoted' });
//     }

//     // Decrement the vote count for downvote
//     question.votes -= 1;

//     // Add the user to the downvotedBy array to track that the user has downvoted
//     question.downvotedBy.push(req.user.id);

//     // Save the updated question
//     await question.save();

//     res.status(200).json({ success: true, votes: question.votes });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

// router.post("/:id/view", async (req, res) => {
//   try {
//     const questionId = req.params.id;

//     // Fetch the question from the database using questionId
//     const question = await QuestionDB.findById(questionId);

//     // Increment the view count
//     question.views += 1;

//     // Save the updated question
//     await question.save();

//     res.status(200).json({ success: true, views: question.views });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

// View a question
// router.get('/questions/:questionId/view', async (req, res) => {
//   try {
//     const questionId = req.params.questionId;
//     console.log('Received view request for question ID:', questionId);
//     const userId = req.user.id; // Assuming you have user information in the request

//     // Fetch the question from the database using questionId
//     const question = await QuestionDB.findById(questionId);

//     // Check if the question exists
//     if (!question) {
//       return res.status(404).json({ success: false, error: 'Question not found' });
//     }

//     // Check if the user has already viewed the question
//     if (!question.viewedBy.includes(userId)) {
//       // Increment the views
//       question.views += 1;

//       // Add the user's ID to the viewedBy array
//       question.viewedBy.push(userId);

//       // Save the updated question
//       await question.save();

//       res.status(200).json({ success: true, message: 'View count updated' });
//     } else {
//       res.status(200).json({ success: false, message: 'User has already viewed the question' });
//     }
//   } catch (error) {
//     console.error('Error updating view count:', error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

// router.post('/:questionId/increment-views', async (req, res) => {
//   try {
//     const questionId = req.params.questionId;
//     console.log('Received POST request for view increment for question ID:', questionId);

//     // Fetch and update the question using findByIdAndUpdate
//     const question = await QuestionDB.findByIdAndUpdate(
//       questionId,
//       { $inc: { views: 1 } },
//       { new: true } // Returns the updated document
//     );

//     console.log('Updated question:', question);

//     if (!question) {
//       return res.status(404).json({ success: false, error: 'Question not found' });
//     }

//     res.status(200).json({ success: true, message: 'View count updated', viewCount: question.views });
//   } catch (error) {
//     console.error('Error updating view count:', error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

// router.post('/:questionId/increment-views', async (req, res) => {
//   try {
//     const questionId = req.params.questionId;
//     console.log('Received POST request for view increment for question ID:', questionId);

//     // User information is available in req.user after the middleware verification
//     const userId = req.user.uid;

//     // Fetch and update the question using findByIdAndUpdate
//     const question = await QuestionDB.findByIdAndUpdate(
//       questionId,
//       { $inc: { views: 1 } },
//       { new: true } // Returns the updated document
//     );

//     console.log('Updated question:', question);

//     if (!question) {
//       return res.status(404).json({ success: false, error: 'Question not found' });
//     }

//     // You can associate the user ID with the question for more personalized analytics
//     console.log('User ID:', userId);

//     res.status(200).json({ success: true, message: 'View count updated', viewCount: question.views });
//   } catch (error) {
//     console.error('Error updating view count:', error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });


module.exports = router;