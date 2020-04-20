function home(req, res) {
    if (req.session.loggedin) {
        res.redirect("/profile")
    } else {
        console.log(req.session.loggedin)
        res.render("login", { title: "Home" })
    }
}

module.exports = home;