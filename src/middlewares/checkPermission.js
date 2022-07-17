/* rules of users
    admin
    agent
*/
function checkPermission(req, res, next) {
    const { role } = req.user;
    // console.log(rule)
    if (role == 'admin') {
    } else {
        res.send({ message: "You can not access here" })
    }
    next()
}
function isAdmin(req, res, next) {
    const { role } = req.user;
    if (role == 'admin') {
    } else {
        res.send({ message: "You can not access here" })
    }
    next()
}
module.exports = {
    checkPermission,
    isAdmin
}