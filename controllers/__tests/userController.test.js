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

describe("User Login Validation", () => {
  it("should validate a valid user login", () => {
    const validLogin = {
      email: "john.doe@gmail.com",
      password: "StrongPass123!",
    };
    const { error } = validateLoginUser(validLogin);
    expect(error).toBeUndefined();
  });
  it("should return an error for invalid email format", () => {
    const invalidEmail = {
      email: "invalid-email",
      password: "StrongPass123!",
    };
    const { error } = validateLoginUser(invalidEmail);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("email");
  });
  it("should return an error for invalid password format", () => {
    const invalidPassword = {
      email: "john.doe@gmail.com",
      password: "12",
    };
    const { error } = validateLoginUser(invalidPassword);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("password");
  });
  it("should return an error for missing email", () => {
    const missingEmail = {
      password: "StrongPass123",
    };
    const { error } = validateLoginUser(missingEmail);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("email");
  });
  it("should return an error for missing password", () => {
    const missingPassword = {
      email: "john.doe@gmail.com",
    };
    const { error } = validateLoginUser(missingPassword);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("password");
  });
});
