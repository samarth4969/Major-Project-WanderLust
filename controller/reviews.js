const Review = require("../models/review.js");
const listings = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
    let listing = await listings.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");   // 🚨 Important return
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "Review added");
    return res.redirect(`/listings/${listing._id}`);   // 🚨 return
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    const listing = await listings.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");   // 🚨 Important return
    }

    await listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted");
    return res.redirect(`/listings/${id}`);   // 🚨 return
};
