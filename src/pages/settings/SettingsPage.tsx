import React, { useState } from "react";
import { User, Lock, Bell, Globe, Palette, CreditCard } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";

export const SettingsPage: React.FC = () => {
  const {
    user,
    updateProfile,
    enableTwoFactor,
    disableTwoFactor,
    changePassword,
  } = useAuth();

  const [isSaving, setIsSaving] = useState(false);

  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: (user as any)?.location || "",

    // Entrepreneur fields
    startupName: (user as any)?.startupName || "",
    pitchSummary: (user as any)?.pitchSummary || "",

    problemStatement: (user as any)?.problemStatement || "",
    solution: (user as any)?.solution || "",
    marketOpportunity: (user as any)?.marketOpportunity || "",
    competitiveAdvantage: (user as any)?.competitiveAdvantage || "",

    fundingNeeded: (user as any)?.fundingNeeded || "",
    valuation: (user as any)?.valuation || "",
    previousFunding: (user as any)?.previousFunding || "",
    currentFundingStage: (user as any)?.currentFundingStage || "",

    industry: (user as any)?.industry || "",
    foundedYear: (user as any)?.foundedYear || "",
    teamSize: (user as any)?.teamSize || "",

    // Investor fields
    investmentInterests: ((user as any)?.investmentInterests || []).join(", "),
    investmentStage: ((user as any)?.investmentStage || []).join(", "),
    portfolioCompanies: ((user as any)?.portfolioCompanies || []).join(", "),
    totalInvestments: (user as any)?.totalInvestments || 0,
    minimumInvestment: (user as any)?.minimumInvestment || "",
    maximumInvestment: (user as any)?.maximumInvestment || "",

    investmentCriteria: ((user as any)?.investmentCriteria || []).join(", "),
    typicalInvestmentTimeline: (user as any)?.typicalInvestmentTimeline || "",
    investmentFocus: ((user as any)?.investmentFocus || [])
      .map((item: any) => `${item.label}:${item.percentage}`)
      .join(", "),
    successfulExits: (user as any)?.successfulExits || 0,
    averageROI: (user as any)?.averageROI || "",
  });

  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      const updates: any = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
      };

      if (user.role === "entrepreneur") {
        updates.startupName = formData.startupName;
        updates.pitchSummary = formData.pitchSummary;

        updates.problemStatement = formData.problemStatement;
        updates.solution = formData.solution;
        updates.marketOpportunity = formData.marketOpportunity;
        updates.competitiveAdvantage = formData.competitiveAdvantage;

        updates.fundingNeeded = formData.fundingNeeded;
        updates.valuation = formData.valuation;
        updates.previousFunding = formData.previousFunding;
        updates.currentFundingStage = formData.currentFundingStage;

        updates.industry = formData.industry;
        updates.foundedYear = formData.foundedYear
          ? Number(formData.foundedYear)
          : null;
        updates.teamSize = formData.teamSize ? Number(formData.teamSize) : null;
      }

      if (user.role === "investor") {
        updates.investmentInterests = formData.investmentInterests
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);

        updates.investmentStage = formData.investmentStage
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);

        updates.portfolioCompanies = formData.portfolioCompanies
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);

        updates.totalInvestments = Number(formData.totalInvestments) || 0;
        updates.minimumInvestment = formData.minimumInvestment;
        updates.maximumInvestment = formData.maximumInvestment;

        updates.investmentCriteria = formData.investmentCriteria
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);

        updates.typicalInvestmentTimeline = formData.typicalInvestmentTimeline;

        updates.investmentFocus = formData.investmentFocus
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
          .map((item: string) => {
            const [label, percentage] = item.split(":");

            return {
              label: label?.trim() || "",
              percentage: Number(percentage) || 0,
            };
          })
          .filter((item: { label: string; percentage: number }) => item.label);

        updates.successfulExits = Number(formData.successfulExits) || 0;
        updates.averageROI = formData.averageROI;
      }

      await updateProfile(user.id, updates);
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    setIsUpdating2FA(true);

    try {
      if (user.twoFactorEnabled) {
        await disableTwoFactor();
      } else {
        await enableTwoFactor();
      }
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and profile information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                <User size={18} className="mr-3" />
                Profile
              </button>

              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Lock size={18} className="mr-3" />
                Security
              </button>

              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Bell size={18} className="mr-3" />
                Notifications
              </button>

              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Globe size={18} className="mr-3" />
                Language
              </button>

              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Palette size={18} className="mr-3" />
                Appearance
              </button>

              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <CreditCard size={18} className="mr-3" />
                Billing
              </button>
            </nav>
          </CardBody>
        </Card>

        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Profile Settings
              </h2>
            </CardHeader>

            <CardBody className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar src={user.avatarUrl} alt={user.name} size="xl" />

                <div>
                  <Button variant="outline" size="sm" type="button">
                    Change Photo
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />

                <Input label="Role" value={user.role} disabled />

                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Example: Lahore, Pakistan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write short bio..."
                />
              </div>
            </CardBody>
          </Card>

          {/* Entrepreneur Fields */}
          {user.role === "entrepreneur" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Entrepreneur / Startup Profile
                </h2>
              </CardHeader>

              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Startup Name"
                    name="startupName"
                    value={formData.startupName}
                    onChange={handleChange}
                    placeholder="Example: TechWave AI"
                  />

                  <Input
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Example: FinTech"
                  />

                  <Input
                    label="Funding Needed"
                    name="fundingNeeded"
                    value={formData.fundingNeeded}
                    onChange={handleChange}
                    placeholder="Example: $1.5M"
                  />

                  <Input
                    label="Valuation"
                    name="valuation"
                    value={formData.valuation}
                    onChange={handleChange}
                    placeholder="Example: $8M - $12M"
                  />

                  <Input
                    label="Previous Funding"
                    name="previousFunding"
                    value={formData.previousFunding}
                    onChange={handleChange}
                    placeholder="Example: $750K Seed"
                  />

                  <Input
                    label="Current Funding Stage"
                    name="currentFundingStage"
                    value={formData.currentFundingStage}
                    onChange={handleChange}
                    placeholder="Example: Series A"
                  />

                  <Input
                    label="Founded Year"
                    name="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    placeholder="Example: 2021"
                  />

                  <Input
                    label="Team Size"
                    name="teamSize"
                    type="number"
                    value={formData.teamSize}
                    onChange={handleChange}
                    placeholder="Example: 12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pitch Summary
                  </label>
                  <textarea
                    name="pitchSummary"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                    value={formData.pitchSummary}
                    onChange={handleChange}
                    placeholder="Short overview of your startup..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    name="problemStatement"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    value={formData.problemStatement}
                    onChange={handleChange}
                    placeholder="What problem does your startup solve?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solution
                  </label>
                  <textarea
                    name="solution"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    value={formData.solution}
                    onChange={handleChange}
                    placeholder="Describe your solution."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Market Opportunity
                  </label>
                  <textarea
                    name="marketOpportunity"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    value={formData.marketOpportunity}
                    onChange={handleChange}
                    placeholder="Describe the market size, demand, or opportunity."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competitive Advantage
                  </label>
                  <textarea
                    name="competitiveAdvantage"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    value={formData.competitiveAdvantage}
                    onChange={handleChange}
                    placeholder="What makes your startup different?"
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {/* Investor Fields */}
          {user.role === "investor" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Investor Profile
                </h2>
              </CardHeader>

              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Investment Interests"
                    name="investmentInterests"
                    value={formData.investmentInterests}
                    onChange={handleChange}
                    placeholder="FinTech, SaaS, AI/ML"
                  />

                  <Input
                    label="Investment Stage"
                    name="investmentStage"
                    value={formData.investmentStage}
                    onChange={handleChange}
                    placeholder="Seed, Series A"
                  />

                  <Input
                    label="Portfolio Companies"
                    name="portfolioCompanies"
                    value={formData.portfolioCompanies}
                    onChange={handleChange}
                    placeholder="PayStream, DataSense"
                  />

                  <Input
                    label="Total Investments"
                    name="totalInvestments"
                    type="number"
                    value={formData.totalInvestments}
                    onChange={handleChange}
                  />

                  <Input
                    label="Minimum Investment"
                    name="minimumInvestment"
                    value={formData.minimumInvestment}
                    onChange={handleChange}
                    placeholder="$250K"
                  />

                  <Input
                    label="Maximum Investment"
                    name="maximumInvestment"
                    value={formData.maximumInvestment}
                    onChange={handleChange}
                    placeholder="$1.5M"
                  />

                  <Input
                    label="Typical Investment Timeline"
                    name="typicalInvestmentTimeline"
                    value={formData.typicalInvestmentTimeline}
                    onChange={handleChange}
                    placeholder="Example: 3-5 years"
                  />

                  <Input
                    label="Successful Exits"
                    name="successfulExits"
                    type="number"
                    value={formData.successfulExits}
                    onChange={handleChange}
                    placeholder="Example: 4"
                  />

                  <Input
                    label="Average ROI"
                    name="averageROI"
                    value={formData.averageROI}
                    onChange={handleChange}
                    placeholder="Example: 3.2x"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Criteria
                  </label>
                  <textarea
                    name="investmentCriteria"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    value={formData.investmentCriteria}
                    onChange={handleChange}
                    placeholder="Strong founding team, Clear market opportunity, Scalable business model"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple criteria with commas.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Focus
                  </label>
                  <textarea
                    name="investmentFocus"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    value={formData.investmentFocus}
                    onChange={handleChange}
                    placeholder="SaaS & B2B:75, FinTech:60, HealthTech:40"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: Focus Area:Percentage, for example SaaS & B2B:75,
                    FinTech:60
                  </p>
                </div>

                <p className="text-sm text-gray-500">
                  For multiple values, separate items with commas. For
                  investment focus, use this format: Focus Area:Percentage.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button">
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSaveChanges}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Security Settings
              </h2>
            </CardHeader>

            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Two-Factor Authentication
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                    {/* <Badge variant="error" className="mt-1">
                      Not Enabled
                    </Badge> */}
                    <Badge
                      variant={user.twoFactorEnabled ? "success" : "error"}
                      className="mt-1"
                    >
                      {user.twoFactorEnabled ? "Enabled" : "Not Enabled"}
                    </Badge>
                  </div>

                  {/* <Button variant="outline">Enable</Button> */}
                  <Button
                    variant={user.twoFactorEnabled ? "error" : "outline"}
                    onClick={handleToggleTwoFactor}
                    isLoading={isUpdating2FA}
                  >
                    {user.twoFactorEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Change Password
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={
                      passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword
                        ? "Passwords do not match"
                        : undefined
                    }
                  />

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleChangePassword}
                      isLoading={isChangingPassword}
                      disabled={
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !==
                          passwordData.confirmPassword
                      }
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
