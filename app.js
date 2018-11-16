const express = require("express");
const app = express();
const mongoose = require("mongoose");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const { upload } = require("./middlewares/uploader");
const { Photos } = require("./models/photos");
const removeAll = require('find-remove');

require("dotenv").config();

mongoose
  .connect(
    process.env.DATA_BASE,
    { useNewUrlParser: true }
  )
  .then(() => console.log("connected to db"))
  .catch(err => console.error("error", err));

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/deleteall", async (req, res) => {
  const photos = await Photos.remove({});
  const result = removeAll('/public/uploads', { extensions: ['.png', '.jpg', '.jepg'] });
  res.send(result);
});

app.get("/", async (req, res) => {
  const photos = await Photos.aggregate([{ $sample: { size: 50 } }]);
  res.render("index", { photos: photos });
});
app.get("/upload", async (req, res) => {
  res.render("upload");
});
io.on("connection", socket => {
  console.log("socket connected", socket.id);
  app.post("/up", async (req, res) => {
    try {
      upload(req, res, async err => {
        if (err) {
          res.render("upload", {
            msg: err
          });
        } else {
          if (req.file == undefined) {
            res.render("upload", {
              msg: "Error: No File Selected!"
            });
          } else {
            res.render("upload", {
              msg: "File Uploaded!"
            });
          }
        }
        //   const uploadPath = req.file.path.replace(/\\/g, "/");
        const uploadPath = `uploads/${req.file.filename}`;
        const photo = new Photos({
          path: uploadPath
        });
        await photo.save();
        // io.sockets.emit("disphoto", uploadPath);
        socket.on('disconnect', function () {
          console.log("socket disconnect: ", socket.id);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`server runnig on port ${port}`));
