const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
require("dotenv").config();
 const app = express();

app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));  

const connectDB = async () => {
  try{
      const conn = await mongoose.connect(process.env.ATLAS_URI,{
          useNewUrlParser: true,
      });
      console.log(`MongoDB connected`);

  }catch(error){
      console.log(`Error: ${error.message}`);
      process.exit();
  }
};

connectDB();

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name: "Shopping"});
const item2 = new Item({name: "Buy Fruits"});
const item3 = new Item({name: "Go Outside"});

const defaultitems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

 app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultitems, function(err,){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Inserted Successfully");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle: "Today" ,newListItems: foundItems});
        }
    });
 });

 app.post("/",function(req,res){

    const itemName = req.body.newItem; 
    const listName = req.body.list;
    const item = new Item({name: itemName});

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
 });

 app.post("/delete",function(req,res){
     const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Successfully Deleted!");
                res.redirect("/");
            }
        });
    } 
    else{
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }  
 });

app.get("/:value",function(req,res){
    customListName = _.capitalize(req.params.value);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultitems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                res.render("list",{listTitle: foundList.name,newListItems: foundList.items});
            }
        }
    })
   

    
});

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

 app.listen(port,function(){
    console.log("Server started running at PORT 3000");
 });

 app.post("/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/");
});