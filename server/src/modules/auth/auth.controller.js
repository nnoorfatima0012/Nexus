// //server/src/modules/auth/auth.controller.js

// const bcrypt = require("bcryptjs");
// const User = require("../users/user.model");
// const generateToken = require("../../utils/generateToken");

// const buildUserResponse = (user) => {
//   return {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     avatarUrl: user.avatarUrl,
//     bio: user.bio,
//     isOnline: user.isOnline,
//     startupName: user.startupName,
//     pitchSummary: user.pitchSummary,

//     problemStatement: user.problemStatement,
//     solution: user.solution,
//     marketOpportunity: user.marketOpportunity,
//     competitiveAdvantage: user.competitiveAdvantage,
//     valuation: user.valuation,
//     previousFunding: user.previousFunding,
//     currentFundingStage: user.currentFundingStage,

//     fundingNeeded: user.fundingNeeded,
//     industry: user.industry,
//     location: user.location,
//     foundedYear: user.foundedYear,
//     teamSize: user.teamSize,

//     investmentInterests: user.investmentInterests,
//     investmentStage: user.investmentStage,
//     portfolioCompanies: user.portfolioCompanies,
//     totalInvestments: user.totalInvestments,
//     minimumInvestment: user.minimumInvestment,
//     maximumInvestment: user.maximumInvestment,
//     investmentCriteria: user.investmentCriteria,
//     typicalInvestmentTimeline: user.typicalInvestmentTimeline,
//     investmentFocus: user.investmentFocus,
//     successfulExits: user.successfulExits,
//     averageROI: user.averageROI,
//     preferences: user.preferences,
//     createdAt: user.createdAt,
//   };
// };

// const register = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       role,

//       bio,
//       startupName,
//       pitchSummary,
//       fundingNeeded,
//       industry,
//       location,
//       foundedYear,
//       teamSize,

//       investmentInterests,
//       investmentStage,
//       portfolioCompanies,
//       totalInvestments,
//       minimumInvestment,
//       maximumInvestment,
//       preferences,
//     } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, password and role are required",
//       });
//     }

//     if (!["entrepreneur", "investor"].includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: "Role must be entrepreneur or investor",
//       });
//     }

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already in use",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
//       name,
//     )}&background=random`;

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       avatarUrl,
//       bio: bio || "",

//       startupName: role === "entrepreneur" ? startupName || "" : "",
//       pitchSummary: role === "entrepreneur" ? pitchSummary || "" : "",
//       fundingNeeded: role === "entrepreneur" ? fundingNeeded || "" : "",
//       industry: role === "entrepreneur" ? industry || "" : "",
//       location: location || "",
//       foundedYear: role === "entrepreneur" ? foundedYear || null : null,
//       teamSize: role === "entrepreneur" ? teamSize || null : null,

//       investmentInterests: role === "investor" ? investmentInterests || [] : [],
//       investmentStage: role === "investor" ? investmentStage || [] : [],
//       portfolioCompanies: role === "investor" ? portfolioCompanies || [] : [],
//       totalInvestments: role === "investor" ? totalInvestments || 0 : 0,
//       minimumInvestment: role === "investor" ? minimumInvestment || "" : "",
//       maximumInvestment: role === "investor" ? maximumInvestment || "" : "",
//       preferences: preferences || {},
//     });

//     const token = generateToken(user._id, user.role);

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token,
//       user: buildUserResponse(user),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Registration failed",
//       error: error.message,
//     });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     if (!email || !password || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "Email, password and role are required",
//       });
//     }

//     const user = await User.findOne({ email, role }).select("+password");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials or role",
//       });
//     }

//     const isPasswordMatched = await bcrypt.compare(password, user.password);

//     if (!isPasswordMatched) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = generateToken(user._id, user.role);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: buildUserResponse(user),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Login failed",
//       error: error.message,
//     });
//   }
// };

// const getMe = async (req, res) => {
//   return res.status(200).json({
//     success: true,
//     user: buildUserResponse(req.user),
//   });
// };

// module.exports = {
//   register,
//   login,
//   getMe,
// };


// //server/src/modules/auth/auth.controller.js
const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const Otp = require("./otp.model");
const generateToken = require("../../utils/generateToken");
const sendEmail = require("../../config/email");

const buildUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isOnline: user.isOnline,
    twoFactorEnabled: user.twoFactorEnabled || false,

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

const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createLoginOtp = async (user) => {
  await Otp.updateMany(
    {
      user: user._id,
      purpose: "login",
      isUsed: false,
    },
    {
      isUsed: true,
    },
  );

  const otpCode = generateOtpCode();
  const otpHash = await bcrypt.hash(otpCode, 10);

  await Otp.create({
    user: user._id,
    otpHash,
    purpose: "login",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: "Your Business Nexus Login OTP",
    text: `Your Business Nexus login OTP is ${otpCode}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Business Nexus Login Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Your one-time password for login is:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this login, please ignore this email.</p>
      </div>
    `,
  });

  console.log(`2FA OTP email sent to ${user.email}`);
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
      twoFactorEnabled: false,

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

    if (user.twoFactorEnabled) {
      await createLoginOtp(user);

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        tempUserId: user._id,
        message:
          "Two-factor authentication required. OTP has been sent to your email.",
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

const verifyLoginOtp = async (req, res) => {
  try {
    const { tempUserId, otpCode } = req.body;

    if (!tempUserId || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP code are required",
      });
    }

    const user = await User.findById(tempUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpRecord = await Otp.findOne({
      user: user._id,
      purpose: "login",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    const isOtpMatched = await bcrypt.compare(otpCode, otpRecord.otpHash);

    if (!isOtpMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Two-factor verification successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { twoFactorEnabled: true },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled",
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to enable 2FA",
      error: error.message,
    });
  }
};

const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { twoFactorEnabled: false },
      { new: true },
    ).select("-password");

    await Otp.updateMany(
      {
        user: req.user._id,
        isUsed: false,
      },
      {
        isUsed: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication disabled",
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to disable 2FA",
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
  verifyLoginOtp,
  enableTwoFactor,
  disableTwoFactor,
  getMe,
};