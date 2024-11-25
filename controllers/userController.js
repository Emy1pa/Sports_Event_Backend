const {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
} = require("../models/User");
const bcrypt = require("bcryptjs");

async function register(req, res) {
  try {
    const { error } = validateRegisterUser(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "User already registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    const { password, ...other } = user._doc;
    res.status(201).json({ ...other });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went Wrong" });
  }
}

async function login(req, res) {
  try {
    const { error } = validateLoginUser(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = user.generateAuthToken();
    const { password, _id, ...other } = user._doc;
    res.status(200).json({ ...other, token, userId: _id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went Wrong" });
  }
}
async function updateUser(req, res) {
  try {
    const { error } = validateUpdateUser(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedFields = {
      fullName: req.body.fullName,
      email: req.body.email,
    };

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      await User.findByIdAndDelete(req.params.id);
      return res
        .status(200)
        .json({ message: "User has been deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
async function logOut(req, res) {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = {
  register,
  login,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  logOut,
};
