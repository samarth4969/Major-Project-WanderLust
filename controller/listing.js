const listings = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { category } = req.query;

  let allListing;

  if (category) {
    allListing = await listings.find({ category });
  } else {
    allListing = await listings.find({});
  }

  res.render("listings/index.ejs", {
    allListing,
    selectedCategory: category,
  });
};

module.exports.rendernewForm = async (req, res) => {
  res.render("listings/form.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await listings
    .findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  return res.render("listings/show.ejs", { listing });
};

module.exports.rendereditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await listings.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_150,h_100"
  );
  return res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await listings.findByIdAndUpdate(id, { ...req.body.listing });

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }

  req.flash("success", "Listing updated successfully");
  return res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await listings.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully");
  return res.redirect("/listings");
};

module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  let listing = new listings(req.body.listing);
  listing.owner = req.user._id;
  listing.image = { url, filename };
  listing.geometry = response.body.features[0].geometry;

  let savedListing = await listing.save();

  req.flash("success", "New listing successfully created");
  return res.redirect(`/listings/${savedListing._id}`); // <-- FINAL FIX
};
