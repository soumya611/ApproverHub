import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function CreateNewForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Company Details
    companyName: "Vakils PreMedia Solutions",
    subdomain: "vakils",
    emailId: "",
    legalName: "",
    phoneNumber: "-",
    websiteUrl: "",
    
    // Contact Person
    contactName: "Web & App Department",
    contactPhone: "Team Designing",
    contactEmail: "Team Designing",
    
    // Address & Locale
    addressLine1: "",
    addressLine2: "",
    state: "",
    postalCode: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-[#5EBDB2] hover:text-[#4a9a8f] transition-colors"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <h1 className="text-xl font-semibold text-[var(--color-primary-500)]">Create New</h1>
      </div>

      <form className="space-y-8">
        {/* Company Details Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Company Details
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Company Name */}
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            {/* Subdomain */}
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                type="text"
                id="subdomain"
                name="subdomain"
                value={formData.subdomain}
                onChange={(e) => handleChange("subdomain", e.target.value)}
                placeholder="Enter subdomain"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Domain name must be unique, lowercase, no spaces, only letters/numbers/hyphens, unique index.
              </p>
            </div>

            {/* Email Id */}
            <div>
              <Label htmlFor="emailId">Email Id</Label>
              <Input
                type="email"
                id="emailId"
                name="emailId"
                value={formData.emailId}
                onChange={(e) => handleChange("emailId", e.target.value)}
                placeholder="Enter email id"
              />
            </div>

            {/* Legal Name */}
            <div>
              <Label htmlFor="legalName">legal Name</Label>
              <Input
                type="text"
                id="legalName"
                name="legalName"
                value={formData.legalName}
                onChange={(e) => handleChange("legalName", e.target.value)}
                placeholder="Enter legal name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Website URL */}
            <div>
              <Label htmlFor="websiteUrl">Website url</Label>
              <Input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => handleChange("websiteUrl", e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </div>

        {/* Contact Person Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Contact Person
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Name */}
            <div>
              <Label htmlFor="contactName">Name</Label>
              <Input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                placeholder="Enter name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Email Id */}
            <div className="sm:col-span-2">
              <Label htmlFor="contactEmail">Email Id</Label>
              <Input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="Enter email id"
              />
            </div>
          </div>
        </div>

        {/* Address & Locale Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Address & Locale
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Address Line 1 */}
            <div>
              <Label htmlFor="addressLine1">Address_line1</Label>
              <Input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                placeholder="Enter address line 1"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <Label htmlFor="addressLine2">Address_line2</Label>
              <Input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                placeholder="Enter address line 2"
              />
            </div>

            {/* State */}
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="Enter state"
              />
            </div>

            {/* Postal Code */}
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

