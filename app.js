
// require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

// *************  Video 1  *************
// Using moongoose to connect to local mongoDB database 
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.4158yrd.mongodb.net/todolistDB`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => { console.log("Connected") })
.catch((err) => { console.log(err)});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<---- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];

// *****************  Video 2  ******************
// Rendering Database Items in the ToDoList App  ---> Reading from the databasae


// ****************  Video 3  ******************
// Adding New Items to our ToDoList Database ---> Inserting new item into totolist database


// ****************  Video 4  ******************
// Deleting Items from our ToDoList Database


// ****************  Video 5  ******************
// Creating Custom Lists using Express Route Parameters
const listSchema = new mongoose.Schema({
    name: String,  // name of the list
    items: [itemsSchema]  // itemsSchema based item's array  ---> Array of item document
});

const List = mongoose.model("List", listSchema);


// ****************  Video 6  ******************
// Adding New Items to the Custom ToDo Lists


// ****************  Video 7  ******************
// Revisiting Lodash and Deleting Items from Custom ToDo Lists



// GET request to "/" home route
app.get("/", async function (req, res) {

    // Rendering Database Items in the ToDoList App  ---> Reading from the databasae
    try {
        const foundItems = await Item.find({});

        // foundItems.forEach(function(item){
        //     console.log(item.name);
        // });

        console.log(foundItems);

        if (foundItems.length === 0) {
            // Inserting 3 default items to the database
            await Item.insertMany(defaultItems);
            // console.log("Successfully saved default items to DB.");
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItem: foundItems
            });
        }

    } catch (err) {
        console.log(err);
    }

});


// POST request to "/" route
app.post("/", async function (req, res) {
    // console.log(req.body);
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });

    try {

        if (listName === "Today") {
            // this will save that newItem document into Items collection.
            await newItem.save()
            res.redirect("/");
        } else {
            const foundList = await List.findOne({ name: listName });

            foundList.items.push(newItem);

            await foundList.save();

            res.redirect("/" + listName);
        }

    } catch (err) {
        console.log(err)
    }

});


// POST request to "/delete" route
app.post("/delete", async function (req, res) {
    // console.log(req.body);
    // console.log(req.body.checkbox);

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    try {

        if (listName === "Today") {

            await Item.findByIdAndRemove(checkedItemId);
            res.redirect("/");
            // console.log("Successfully deleted checked item from the database");

        } else {

            await List.findOneAndUpdate(
                { name: listName },  // conditions
                { $pull: { items: { _id: checkedItemId } } }  // updates
            );

            res.redirect("/" + listName);
        }

    } catch (err) {
        console.log(err);
    }

});



// Creating Custom Lists using Express Route Parameters
// Express Route Parameters
app.get("/:customListName", async function (req, res) {

    // console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName);

    try {
        let foundList = await List.findOne({ name: customListName });

        if (!foundList) {
            // console.log("Doesn't exist!");
            const list = new List({   // Create a new list
                name: customListName,
                items: defaultItems
            });

            foundList = await list.save(); // this will save this new list document into Lists collection.

        } else {
            // console.log("Exists!");
            // Show an existing list
        }

        res.render("list", {
            listTitle: foundList.name,
            newListItem: foundList.items
        });

    } catch (err) {
        console.log(err);
    }

});


app.listen(3000, function () {
    console.log("Server started on port 3000.");
});


