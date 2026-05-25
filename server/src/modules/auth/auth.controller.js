//server/src/modules/auth/auth.controller.js

const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const generateToken = require("../../utils/generateToken");

const buildUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isOnline: user.isOnline,
    startupName: user.startupName,
    pitchSummary: user.pitchSummary,

    problemStatement: user.problemStatement,
    solution: user.solution,
    marketOpportunity: user.marketOpportunity,
    competitiveAdvantage: user.competitiveAdvantage,
    valuation: user.valuation,
    previousFunding: user.previousFunding,
    currentFundingStage: user.currentFundingStage,

    fundingNeeded: user.fundingNeeded,
    industry: user.industry,
    location: user.location,
    foundedYear: user.foundedYear,
    teamSize: user.teamSize,

    investmentInterests: user.investmentInterests,
    investmentStage: user.investmentStage,
    portfolioCompanies: user.portfolioCompanies,
    totalInvestments: user.totalInvestments,
    minimumInvestment: user.minimumInvestment,
    maximumInvestment: user.maximumInvestment,
    investmentCriteria: user.investmentCriteria,
    typicalInvestmentTimeline: user.typicalInvestmentTimeline,
    investmentFocus: user.investmentFocus,
    successfulExits: user.successfulExits,
    averageROI: user.averageROI,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      bio,
      startupName,
      pitchSummary,
      fundingNeeded,
      industry,
      location,
      foundedYear,
      teamSize,

      investmentInterests,
      investmentStage,
      portfolioCompanies,
      totalInvestments,
      minimumInvestment,
      maximumInvestment,
      preferences,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    if (!["entrepreneur", "investor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be entrepreneur or investor",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=random`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      avatarUrl,
      bio: bio || "",

      startupName: role === "entrepreneur" ? startupName || "" : "",
      pitchSummary: role === "entrepreneur" ? pitchSummary || "" : "",
      fundingNeeded: role === "entrepreneur" ? fundingNeeded || "" : "",
      industry: role === "entrepreneur" ? industry || "" : "",
      location: location || "",
      foundedYear: role === "entrepreneur" ? foundedYear || null : null,
      teamSize: role === "entrepreneur" ? teamSize || null : null,

      investmentInterests: role === "investor" ? investmentInterests || [] : [],
      investmentStage: role === "investor" ? investmentStage || [] : [],
      portfolioCompanies: role === "investor" ? portfolioCompanies || [] : [],
      totalInvestments: role === "investor" ? totalInvestments || 0 : 0,
      minimumInvestment: role === "investor" ? minimumInvestment || "" : "",
      maximumInvestment: role === "investor" ? maximumInvestment || "" : "",
      preferences: preferences || {},
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    const user = await User.findOne({ email, role }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or role",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: buildUserResponse(req.user),
  });
};

module.exports = {
  register,
  login,
  getMe,
};
