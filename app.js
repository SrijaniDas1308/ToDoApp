const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.listen(3000, () => console.log("Server running on port 3000"));

mongoose.connect("mongodb+srv://Srijani:ninja1234@cluster0.9xu32xd.mongodb.net/todolistDB");
const itemsSchema = {
    name: String
};
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "Welcome"
});
const item2 = new Item({
    name: "Type and hit the + button to add new item"
});
const item3 = new Item({
    name: "Check the box to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("list", listSchema);

app.get("/", function(req, res)
{
    Item.find({})
    .then(foundItems => {
        
        if(foundItems.length === 0)
        {
            Item.insertMany(defaultItems);
        }
        else
        {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }        
    });    
});

app.get("/:listType", function(req, res){
    const listType = _.capitalize(req.params.listType);
    List.findOne({name: listType})
    .then(foundList => {
        if(!foundList)
        {
            const list = new List({
                name: listType,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+listType);
        }
        else
        {
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    });
   
});

app.get("/about", function(req, res)
{
    res.render("about");
});

app.post("/", function(req, res)
{   
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName === "Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
});

app.post("/delete", function(req, res){
    const chechedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        Item.findByIdAndRemove(chechedItemId)
        .then(chechedItemId => {
            res.redirect("/");
        });
    }
    else
    {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: chechedItemId}}})
        .then(foundList => {
            res.redirect("/"+listName);
        });
    }
    
});