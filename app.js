const bodyParser = require('body-parser'),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = Promise;

// app config
mongoose.connect('mongodb://localhost/restful_blog_app');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// mongoose model config
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "First Post!",
//     image: "https://images.unsplash.com/photo-1443641998979-d59cfcf800c4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
//     body: "This is my first post."
// }).then((blogPost) => {
//     console.log(`'${blogPost.title}' Posted`);
// }).catch((err) => {
//     console.log("Error: ", err);
// });

// RESTful ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

// INDEX route
app.get("/blogs", (req, res) => {
    Blog.find().then((blogPosts) => {
        res.render("index", { posts: blogPosts });
    }).catch((err) => {
        console.log("Error: ", err);
    });
});

// NEW route
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

// CREATE route
app.post("/blogs", (req, res) => {
    // sanitize then create post
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog).then((newPost) => {
        console.log(`New post '${newPost.title}' created`);
        res.redirect("/blogs");
    }).catch((err) => {
        console.log("Error: ", err);
        res.render("new");
    });
});

// SHOW route
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id).then((blogPost) => {
        res.render("show", { post: blogPost });
    }).catch((err) => {
        console.log("Error: ", err);
        res.redirect("/blogs");
    });
});

// EDIT route
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id).then((blogPost) => {
        res.render("edit", { post: blogPost });
    }).catch((err) => {
        console.log("Error: ", err);
        res.redirect("/blogs");
    })
});

// UPDATE route
app.put("/blogs/:id", (req, res) => {
    // sanitize then update post
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog)
        .then((blogPost) => {
            console.log(`updated post '${blogPost.title}'`);
            res.redirect(`/blogs/${req.params.id}`);
        }).catch((err) => {
            console.log("Error: ", err);
            res.redirect("/blogs");
        });
});

// DESTROY route
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted post '${req.params.id}'`);
            res.redirect("/blogs");
        }).catch((err) => {
            console.log("Error: ", err);
            res.redirect("/blogs");
        })
});

/**********************
 * Listener - port 3000
 **********************/
app.listen(3000, () => {
    console.clear();
    console.log("Blog App Listening on Port 3000...");
});