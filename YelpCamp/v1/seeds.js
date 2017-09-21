var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
    {
        name: "Salmon Creek",
        image: "https://www.campsitephotos.com/photo/camp/19823/feature_Montana_De_Oro_SP-f3.jpg",
        description: "blah blah blah"
    },
    {
        name: "White Mountain",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdFyOLBvUcFFmMQS0Y4hNwo-3q_QudTAyRvaJ0yA1j14ikn3gZ",
        description: "blah blah blah"
    },
    {
        name: "Dest Mesa",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTookoNhWufn-TfQr_82K68kXKvk3U21RujMLYD5lmdLfGI1oqrWA",
        description: "blah blah blah"
    }
    
    ];


function seedDB(){
    Campground.remove({}, function(err) {
    if (err) {
        console.log(err);
    }
    data.forEach(function(seed) {
        Campground.create(seed, function(err, campground) {
           if (err) {
               console.log(err);
           } else {
               console.log("added a campground");
               //creat a comment
               Comment.create(
                   {
                       text : "This is great but need ineternet",
                       author: "Harry"
                   },function(err, comment){
                       if (err) {
                           console.log(err);
                       }else{
                           campground.comments.push(comment);
                           campground.save();
                           console.log("created a new comment");
                       }
                   })
           }
        });
    });;
    });
    
    //add
    

}

module.exports = seedDB;