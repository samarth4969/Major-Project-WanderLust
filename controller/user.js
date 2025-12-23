const User = require("../models/user");

// ====================== SIGN UP FORM ======================
module.exports.rendersignUpForm = (req, res) => {
  res.render("user/signup.ejs", { showSearch: false });
};

// ====================== SIGN UP SUBMIT ======================
module.exports.signUpUser = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    // Check if username or email already exists
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      // If user already exists, log them in
      req.login(existingUser, function (err) {
        if (err) return next(err);
        req.flash("success", "Welcome back to Wanderlust!");
        return res.redirect("/listings");
      });
    } else {
      // Create new user
      let newUser = new User({ username, email });
      await User.register(newUser, password);

      // Log the newly registered user in
      req.login(newUser, function (err) {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        return res.redirect("/listings");
      });
    }
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

// ====================== LOGIN FORM ======================
module.exports.renderloginForm = (req, res) => {
  res.render("user/login.ejs", { showSearch: false });
};

// ====================== LOGIN SUBMIT ======================
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");

  // Redirect to the protected URL OR listings page
  const redirectUrl = res.locals.redirectUrl || "/listings";
  return res.redirect(redirectUrl);
};

// ====================== LOGOUT ======================
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logout Successfully");
    return res.redirect("/listings");
  });
};
