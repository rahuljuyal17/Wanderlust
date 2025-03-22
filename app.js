const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js")
const path=require("path");
const port=8080;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

app.set("view engine","ejs");
app.set("views",path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//connected to DB
const MONGO_URL="mongodb://127.0.0.1:27017/Wanderlust"
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

//Home page
app.get("/",(req,res)=>{
    res.render("listing/start.ejs");
});

//Index Route
app.get("/listings", async (req, res) => {
    const allistings = await Listing.find({});
    res.render("listing/index.ejs", { allistings });
});

//new listing
app.get("/listings/new",(req,res)=>{
    res.render("listing/new.ejs");
});

//send info from ID
app.get("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    const listings = await Listing.findById(id);
    res.render("listing/show.ejs", { listings });
});

//edit Listing
app.get("/listings/:id/edit", async (req,res)=>{
    let {id}=req.params;
    const listings = await Listing.findById(id);
    res.render("listing/edit.ejs",{listings});
});

//Add Route
app.post("/listings", async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging step

        let listing = new Listing(req.body.listing); // Use req.body.listing
        await listing.save();

        res.redirect("/listings");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving listing");
    }
});

//Update the list and back to main page
app.put("/listings/:id",async (req,res)=>{
    let {id}= req.params;
    const listings = await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
});

//Delete a listing
app.delete("/listings/:id",async (req,res)=>{
    let {id}= req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    res.redirect("/listings");
});

//web Server 
app.listen(port,()=>{
    console.log(`The port is listening to ${port}`);
});
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });