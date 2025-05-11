const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const port=8080;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js"); 

const { wrap } = require("module");
const Review = require("./models/review.js");

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

const validateReview = (req, res, next) => {
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    } 
    else{
        next();
    }};

//Home page
app.get("/",(req,res)=>{
    res.render("listing/start.ejs");
});

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allistings = await Listing.find({});
    res.render("listing/index.ejs", { allistings });
}));

//new listing
app.get("/listings/new",wrapAsync((req,res)=>{
    res.render("listing/new.ejs");
}));

//send info from ID
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listings = await Listing.findById(id).populate("reviews");
    res.render("listing/show.ejs", { listings });
}));

//edit Listing
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listings = await Listing.findById(id);
    res.render("listing/edit.ejs",{listings});
}));

//Add Route
app.post("/listings", wrapAsync(async (req, res,next) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing!");
    }
        console.log("Request Body:", req.body); 
        let listing = new Listing(req.body.listing); 
        await listing.save();
        res.redirect("/listings");
}));

//Update the list and back to main page
app.put("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listings = await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}));

//Delete a listing
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    res.redirect("/listings");
}));

// reviews Post route
app.post("/listings/:id/reviews",validateReview ,wrapAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      console.error("Listing not found!");
      return res.status(404).send("Listing not found");
    }
    const newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview._id); 
    await listing.save();

    console.log("Review added and listing updated successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).send("Something went wrong");
  }
}));

//Delete Route for reviews
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  console.log("Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"page not found!"));
});

//to handle errors
app.use((err,req,res,next) => {
    let {statusCode=404,message="something went wrong!"} = err;
    res.status(statusCode).send(message);
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

