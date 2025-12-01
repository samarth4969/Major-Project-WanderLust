const listings = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
let { listingSchema } = require("./schema.js");

// LOGIN CHECK
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to access this page");
        return res.redirect("/login");   // 🔥 must return to prevent double response
    }
    next();
};

// SAVE REDIRECT URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;  // 🔥 avoids endless redirect
    }
    next();
};

// CHECK LISTING OWNER
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let Listing = await listings.findById(id);

    if (!Listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (!Listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the Owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// CHECK REVIEW OWNER
module.exports.isReviewauthor = async (req, res, next) => {
    let { reviewId, id } = req.params;
    let review = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// JOI VALIDATION FOR LISTING
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};
