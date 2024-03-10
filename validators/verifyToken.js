import jwt from "jsonwebtoken";
const { verify } = jwt;

export default function verifyToken(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied!");

  try {
    const verified = verify(token, process.env.SECREAT_TOKEN);
    req.tokendata = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token!");
  }
}
