const jwt = require("jsonwebtoken");
function verifyToken(req, res, next) {
  const token = req.headers.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    return res
      .status(401)
      .json({ error: "Access denied, no token was provided" });
  }
}
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    const userIdFromParams = req.params.id;
    const userIdFromToken = req.user.id;
    if (
      userIdFromToken.toString() === userIdFromParams ||
      req.user.role === "Organisateur"
    ) {
      console.log("Authorization passed");
      next();
    } else {
      return res.status(403).json({
        message: "You are not allowed to perform this action",
      });
    }
  });
}
function verifyOrganizerToken(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role === "Organisateur") {
      next();
    } else {
      return res.status(403).json({ message: "Only admin can access to this" });
    }
  });
}
module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyOrganizerToken,
};
