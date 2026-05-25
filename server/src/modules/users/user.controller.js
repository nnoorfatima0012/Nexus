//server/src/modules/users/user.controller.js
const User = require("./user.model");

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

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: buildUserResponse(req.user),
  });
};

const updateCurrentUser = async (req, res) => {
  try {
    const allowedUpdates = [
      "name",
      "avatarUrl",
      "bio",
      "startupName",
      "pitchSummary",
      "problemStatement",
      "solution",
      "marketOpportunity",
      "competitiveAdvantage",
      "fundingNeeded",
      "valuation",
      "previousFunding",
      "currentFundingStage",
      "industry",
      "location",
      "foundedYear",
      "teamSize",
      "investmentInterests",
      "investmentStage",
      "portfolioCompanies",
      "totalInvestments",
      "minimumInvestment",
      "maximumInvestment",
      "investmentCriteria",
      "typicalInvestmentTimeline",
      "investmentFocus",
      "successfulExits",
      "averageROI",
      "preferences",
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: buildUserResponse(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

const getInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: "investor" }).select("-password");

    return res.status(200).json({
      success: true,
      count: investors.length,
      users: investors.map(buildUserResponse),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get investors",
      error: error.message,
    });
  }
};

const getEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: "entrepreneur" }).select(
      "-password",
    );

    return res.status(200).json({
      success: true,
      count: entrepreneurs.length,
      users: entrepreneurs.map(buildUserResponse),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get entrepreneurs",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
  getInvestors,
  getEntrepreneurs,
};
