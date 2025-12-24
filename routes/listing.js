const express = require("express");
const router = express.Router();

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controller/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/* INDEX (All listings + Category filter) */
router.get("/", wrapAsync(listingController.index));

/* CREATE LISTING */
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

/* NEW LISTING FORM */
router.get("/new", isLoggedIn, wrapAsync(listingController.rendernewForm));

/* SHOW / UPDATE / DELETE */
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

/* EDIT FORM */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.rendereditForm)
);

module.exports = router;
