import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      profileType: user.profile_type
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
