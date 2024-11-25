const bcrypt = require("bcryptjs");
const {
  validateLoginUser,
  validateRegisterUser,
  User,
} = require("../../models/User");

describe("User Registration Validation", () => {
  it("should validate a valid user registration", () => {
    const validUser = {
      fullName: "John Doe",
      email: "john.doe@gmail.com",
      password: "StrongPass123!",
    };
    const { error } = validateRegisterUser(validUser);
    expect(error).toBeUndefined();
  });
  it("should return an error for missing email", () => {
    const invalidUser = {
      fullName: "John Doe",
      password: "StrongPass123!",
    };
    const { error } = validateRegisterUser(invalidUser);
    expect(error.details[0].message).toContain("email");
  });
  it("should return an error for missing password", () => {
    const invalidUser = {
      fullName: "John Doe",
      email: "john.doe@gmail.com",
    };
    const { error } = validateRegisterUser(invalidUser);
    expect(error.details[0].message).toContain("password");
  });
});

describe("Password Hashing", () => {
  it("should hash the password correctly", async () => {
    const password = "MyPassword123!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
