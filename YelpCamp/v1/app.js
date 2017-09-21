var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/campground");
var Comment = require("./models/comment");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");

seedDB();

//passport configuration
app.use(require("express-session")({
    secret: "Once again Rusty wins dog",
    resave: false,
    saveUninitialized :false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   next();
});


mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// //SCHEMA SETUP
// var campgroundSchema = new mongoose.Schema({
//   name: String,
//   image: String,
//   description: String
// });

// var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create({
//     name: "Salmon Creek", 
//     image: "https://www.campsitephotos.com/photo/camp/19823/feature_Montana_De_Oro_SP-f3.jpg",
//     description: "This is a huge Salmon Creek"
    
//     }, function(err, campground){
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("Newly created campground: ");
//             console.log(campground);
//         }
//     });




//  var campgrounds = [
//       {name: "Salmon Creek", image: "https://www.campsitephotos.com/photo/camp/19823/feature_Montana_De_Oro_SP-f3.jpg"},
//       {name: "Beijing", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTookoNhWufn-TfQr_82K68kXKvk3U21RujMLYD5lmdLfGI1oqrWA"},
//       {name: "Harbin", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdFyOLBvUcFFmMQS0Y4hNwo-3q_QudTAyRvaJ0yA1j14ikn3gZ"}
//       ];
       

app.get("/", function(req, res) {
   res.render("landing"); 
});

//index 
app.get("/campgrounds", function(req, res) {
    
  // Get all campgrounds from de
  Campground.find({}, function(err, allCampgrounds){
      if (err) {
          console.log(err);
      } else {
          res.render("campgrounds/index", {campgrounds : allCampgrounds, currentUser: req.user});
      }
  });
    //res.render("campgrounds", {campgrounds : campgrounds});
});

app.post("/campgrounds", function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name,image: image, description: description};
    //create new campground and save to db
    Campground.create(newCampground, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
   //get date from form add to campgrounds array
   // redirect back to campground page
});

//show from create
app.get("/campgrounds/new", function(req, res) {
   res.render("campgrounds/new.ejs"); 
});

//show more info about one campground
app.get("/campgrounds/:id", function(req, res) {
    //find campground with provided id render to show page
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground : foundCampground});
        }
    });
});


//comment rounts
app.get("/campgrounds/:id/comment/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err); 
        } else {
            res.render("comments/new", {campground : campground});
        }
    });
  
});

app.post("/campgrounds/:id/comments", isLoggedIn,function(req, res) {
   Campground.findById(req.params.id, function(err, campground) {
       if (err) {
           console.log(err);
           res.redirect("/campgrounds");
       }else {
           Comment.create(req.body.comment, function(err, comment) {
              if (err) {
                  console.log(err);
              } else {
                  campground.comments.push(comment);
                  campground.save();
                  res.redirect("/campgrounds/" + campground._id);
              }
           });
       }
   }) 
});


// auth route
app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({username : req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        } 
        passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds"); 
        });
    });
});

//show login form
app.get("/login",function(req, res) {
   res.render("login"); 
});

//login rounte

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect:"/login"
    }),function(req, res) {
    
});

//log out

app.get("/logout", function(req, res) {
   req.logout();
   res.redirect("/campgrounds");
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}



app.listen(process.env.PORT, process.env.IP, function(){
   console.log("YelpCamp Server has started!"); 
});