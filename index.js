const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on'); // <-- template inheritance
require('dotenv').config();

// create an express application
const app = express();

// set hbs
app.set('view engine', 'hbs'); // we're using hbs as the view engine
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts'); // tell wax-on where to the find the layout files
                                      // layout files are hbs files that have elements which can be shared among other hbs files

// setup form processing
app.use(express.urlencoded({
    extended: false
}))

app.get("/", function(req,res){
    res.render('home')
});

app.get('/test', function(req,res){
    res.render('test-file');
})


// start the server
app.listen(3000, function(){
    console.log("Server has started")
})

