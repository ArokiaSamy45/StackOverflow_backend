const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: String,
  body: String,
  tags: [],
  created_at: {
    type: Date,
    default: Date.now(),
  },
  user: Object,
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comments",
  },
  votes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  viewedBy: [String],
});

module.exports = mongoose.model("Questions", questionSchema);
