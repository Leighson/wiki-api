
// IMPORTS
require("ejs");
require("dotenv").config();
const _ = require("lodash");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");

// SET EXPRESS DEFAULTS
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// MONGODB CLIENT SETUP
const URI = "mongodb+srv://origin.howe4yr.mongodb.net";
const SERVER_USERID = process.env.ORIGIN_USERID;
const SERVER_KEY = process.env.ORIGIN_KEY;
const DATABASE = "wikiDB";

async function mongoConnect() {
    try {
        await mongoose.connect(URI, {
            user: SERVER_USERID,
            pass: SERVER_KEY,
            dbName: DATABASE
        });
    } catch (err) {
        console.log(err);
    } finally {
        console.log(`Connection to database ${_.capitalize(DATABASE)} successful.`);
    }
};

// CREATE ARTICLE COLLECTION
const ArticlesSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("Article", ArticlesSchema);

// INSERT TEST DATA
app.get("/", async (req, res) => {
    
    mongoConnect();

    await Article.findOne();

    try {
        const newArticle = new Article({
            title: "Hello World",
            content: "Testing article..."
        });
        await newArticle.save();
        res.send("Hello world!");
    } catch (err) {
        console.log(err);
        res.send("Error uploading to database.");
    }
    
});

/* DEFINE THE RESTFUL API */

// REQUEST TARGETING ALL ARTICLES
app.route("/articles")

    .get(async (req, res) => {
        mongoConnect();

        try {
            const foundArticles = await Article.find();
            res.send(foundArticles);
        } catch (err) {
            res.send(err);
        }
    })

    .post(async (req, res) => {
        mongoConnect();

        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });

        let savedArticle;

        try {
            savedArticle = await newArticle.save();
        } catch (err) {
            res.send(err);
        } finally {
            res.send(savedArticle + "\n The article above saved successfully!");
        }
    })

    .delete(async (req, res) => {
        mongoConnect();

        try {
            await Article.deleteMany();
        } catch(err) {
            res.send(err);
        } finally {
            res.send("All articles deleted successfully!");
        }
    });


// REQUEST TARGETING SPECIFIC ARTICLES
app.route("/articles/:articleTitle")

    .get(async (req, res) => {
        mongoConnect();

        let getArticle;

        try {
            getArticle = await Article.findOne({
                title: req.params.articleTitle
            });
        } catch(err) {
            res.send(err);
            console.log("Something went wrong!");
        } finally {
            if (getArticle == null) {
                res.send("No article found!");
                console.log("Article not found =(");
            } else {
                res.send(getArticle);
                console.log("Article successfully got.");
            }
        }

    })

    .put(async (req, res) => {
        mongoConnect();

        try {
            await Article.replaceOne(
                { title: req.params.articleTitle },
                { title: req.body.title, content: req.body.content}
            )
        } catch(err) {
            console.log(err);
        } finally {
            res.send("Article successfully replaced!");
        }
    })

    .patch(async (req, res) => {
        mongoConnect();

        try {
            await Article.updateOne(
                { title: req.params.articleTitle },
                { title: req.body.title, content: req.body.content }
            )
        } catch(err) {
            console.log(err);
        } finally {
            res.send("Article successfully updated!");
        }
    })

    .delete(async (req, res) => {
        mongoConnect();

        try {
            await Article.deleteOne({
                title: req.params.articleTitle
            })
        } catch(err) {
            console.log(err);
        } finally {
            res.send("Article successfully deleted!");
        }
    });

// LISTEN ON PORT PROVIDED or 3000 for LOCAL
let PORT = process.env.PORT;
if (PORT == "" || PORT == null) { PORT = 3000 }

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});