const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["entrepreneur", "investor"],
      required: [true, "Role is required"],
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    // Entrepreneur profile fields
    startupName: {
      type: String,
      default: "",
    },

    pitchSummary: {
      type: String,
      default: "",
    },

    fundingNeeded: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    foundedYear: {
      type: Number,
      default: null,
    },

    teamSize: {
      type: Number,
      default: null,
    },
    problemStatement: {
      type: String,
      default: "",
    },

    solution: {
      type: String,
      default: "",
    },

    marketOpportunity: {
      type: String,
      default: "",
    },

    competitiveAdvantage: {
      type: String,
      default: "",
    },

    valuation: {
      type: String,
      default: "",
    },

    previousFunding: {
      type: String,
      default: "",
    },

    currentFundingStage: {
      type: String,
      default: "",
    },

    // Investor profile fields
    investmentInterests: {
      type: [String],
      default: [],
    },

    investmentStage: {
      type: [String],
      default: [],
    },

    portfolioCompanies: {
      type: [String],
      default: [],
    },

    totalInvestments: {
      type: Number,
      default: 0,
    },

    minimumInvestment: {
      type: String,
      default: "",
    },

    maximumInvestment: {
      type: String,
      default: "",
    },
    investmentCriteria: {
      type: [String],
      default: [],
    },

    typicalInvestmentTimeline: {
      type: String,
      default: "",
    },

    investmentFocus: {
      type: [
        {
          label: {
            type: String,
            default: "",
          },
          percentage: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },

    successfulExits: {
      type: Number,
      default: 0,
    },

    averageROI: {
      type: String,
      default: "",
    },

    preferences: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
