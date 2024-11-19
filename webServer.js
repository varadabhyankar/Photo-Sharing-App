/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");

// const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));
app.use(session({
  secret: "secretKey", 
  resave: false, 
  saveUninitialized: false,
  cookie:{
    maxAge: 60000 * 60
  }
}));
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", isAuthenticated, async function (request, response) {
  try {
    const users_list = await User.find({}, "_id first_name last_name").exec();
    const users_to_return = users_list.map((user) => ({
      _id : user._id,
      first_name : user.first_name,
      last_name : user.last_name,
    }));
    return response.status(200).json(users_to_return);
  } catch (err) {
    return response.status(500).send("Error fetching user list: " + err.message);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", isAuthenticated, async function (request, response) {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid ID");
  }
  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation").exec();
    if (!user) {
      return response.status(400).send("User not found");
    }
    return response.status(200).json(user);
  } catch (err) {
    return response.status(500).send("Error: " + err.message);
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", isAuthenticated, async function (request, response) {

  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid ID");
  }

  try {
    const photos = await Photo.find({ user_id: id }, "_id user_id comments file_name date_time")
      .exec();

    if (photos.length === 0) {
      return response.status(400).send("Photos not found");
    }

    const users = await User.find({}, "_id first_name last_name").exec();

    const photos_to_return = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((comment) => {
        var commentUser = users.filter((user) => {return user._id.toString() === comment.user_id.toString();})[0];
        return ({
          comment: comment.comment,
          date_time: comment.date_time,
          _id: comment._id,
          user: {
            _id: commentUser._id,
            first_name: commentUser.first_name,
            last_name: commentUser.last_name
          }
        });
      }) 
    }));

    return response.status(200).json(photos_to_return);
  } catch (err) {
    return response.status(500).send("Error: " + err.message);
  }
});

app.post("/commentsOfPhoto/:photo_id", isAuthenticated, async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).send({ error: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photo_id).exec();
    if (!photo) {
      return res.status(404).send({ error: "Photo not found" });
    }
    const commentUser = await User.findById(req.session.user._id).exec();
    const newComment = {
      comment: comment,
      user_id: req.session.user._id
    };
    const returnComment = {
      comment: comment,
      user: {
        _id: commentUser._id,
        first_name: commentUser.first_name,
        last_name: commentUser.last_name
      }
    };
    photo.comments.push(newComment)
    await photo.save();
    return res.status(200).send(returnComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).send({ error: "Server error" });
  }
});

app.post("/photos/new", isAuthenticated, processFormBody, async (req, res) => {
  try{
    //Validation
    if(!req.file){
      return res.status(400).send({ error: "No file selected" });
    }
    else if(!req.file.mimetype.startsWith("image/")){
      return res.status(400).send({ error: "Invalid file type" });
    }
    //Save photo
    else{
      const timestamp = new Date().valueOf();;
      const filename = 'U' +  String(timestamp) + req.file.originalname;
      fs.writeFile("./images/" + filename, req.file.buffer, async function (err) {
        // XXX - Once you have the file written into your images directory under the
        // name filename you can create the Photo object in the database
        try{
          const result = await Photo.create({
            file_name: filename,
            user_id: req.session.user._id, //Add the logged in user
          });
          await result.save();
          return res.status(200).send("Photo added successfully");
        }
        catch(error){
          console.error("Error uploading photo:", error);
          return res.status(500).send({ error: error.message });
        }
      });
    }
  }
  catch (error){
    console.error("Error uploading photo:", error);
    return res.status(500).send({ error: error.message });
  }
});

app.post("/admin/login", async (req, res, next) => {
  console.log("Session ID:", req.sessionID);

  const { login_name, password } = req.body;

  try {
    const user = await User.findOne({ login_name: login_name, password }).exec();

    if (user) {
      req.session.regenerate((err) => {
        if (err) return next(err);

        req.session.user = user;

        req.session.save((err) => {
          if (err) return next(err);

          // Return success response to the client
          return res.status(200).json({_id: user._id});
        });
      });
    } else {
      return res.status(400).json({ msg: "Bad credentials" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

app.post('/admin/logout', (req, res) => {
  if(req.session.user){
    req.session.destroy((err) => {
      if(err) return res.status(400).json('Could not logout')
      else return res.status(200).json({msg: "logged out"})
    })
  } else{
    return res.redirect('/admin/login')
  }
});

app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send({ error: "All required fields must be filled in." });
  }
  try {
    const existingUser = await User.findOne({ login_name: login_name }).exec();
    if (existingUser) {
      return res.status(400).send({ error: "Username already exists." });
    }
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });
    await newUser.save();
    return res.status(200).send({ msg: "User successfully registered.", login_name: login_name });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

app.get("/check-session", (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ _id: req.session.user._id, first_name: req.session.user.first_name });
  } else {
    return res.status(401).json({ msg: "Not authenticated" });
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});