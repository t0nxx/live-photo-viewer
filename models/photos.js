const mongoose = require("mongoose");
const photos_schema = new mongoose.Schema(
  {
    path: {
      type: String
    }
  },
  { timestamps: true }
);

const Photos = mongoose.model("Photos", photos_schema);

exports.Photos = Photos;
