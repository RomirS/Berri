function signup(req, res) {
    if (req.session.loggedin) {
        res.redirect("/profile")
    } else {
        res.render("signup", { title: "Login" })
    }
}

module.exports = signup;