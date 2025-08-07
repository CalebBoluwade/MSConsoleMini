import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Integration types
const INTEGRATION_TYPES = [
  "GitHub",
  "Jenkins",
  "Slack",
  "Microsoft Teams",
  "Custom Webhook",
  "FreshDesk",
] as const;

export const IntegrationConfigForm: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("GitHub");
  const [formData, setFormData] = useState<{
    type: string;
    name: string;
    [key: string]: string;
  }>({
    type: "GitHub",
    name: "",
  });

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Common validations
    if (!formData.name || formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Type-specific validations
    switch (selectedType) {
      case "GitHub":
        if (!formData.apiKey || formData.apiKey.length < 10) {
          errors.apiKey = "GitHub API key is required";
        }
        break;
      case "FreshDesk":
        if (!formData.Domain || !isValidUrl(formData.Domain) && (!formData.apiKey || formData.apiKey.length < 10)) {
          errors.jenkinsUrl = "Invalid Domain URL";
        }
        break;
      case "Jenkins":
        if (!formData.jenkinsUrl || !isValidUrl(formData.jenkinsUrl)) {
          errors.jenkinsUrl = "Invalid Jenkins URL";
        }
        break;
      case "Slack":
      case "Microsoft Teams":
        if (!formData.webhookUrl || !isValidUrl(formData.webhookUrl)) {
          errors.webhookUrl = "Invalid Webhook URL";
        }
        break;
      case "Custom Webhook":
        if (!formData.webhookUrl || !isValidUrl(formData.webhookUrl)) {
          errors.webhookUrl = "Invalid Webhook URL";
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Integration Configuration:", formData);
      // Add your submission logic here
    }
  };

  const renderSpecificFields = () => {
    switch (selectedType) {
      case "GitHub":
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                GitHub API Key
              </label>
              <Input
                type="password"
                name="apiKey"
                required
                placeholder="Enter GitHub API Key"
                value={formData.apiKey || ""}
                onChange={handleInputChange}
                className={formErrors.apiKey ? "border-red-500" : ""}
              />
              {formErrors.apiKey && (
                <p className="text-red-500 text-xs">{formErrors.apiKey}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Repository (Optional)
              </label>
              <Input
                name="repository"
                placeholder="username/repo"
                value={formData.repository || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case "Jenkins":
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Jenkins URL</label>
              <Input
                name="jenkinsUrl"
                placeholder="https://jenkins.example.com"
                value={formData.jenkinsUrl || ""}
                onChange={handleInputChange}
                className={formErrors.jenkinsUrl ? "border-red-500" : ""}
              />
              {formErrors.jenkinsUrl && (
                <p className="text-red-500 text-xs">{formErrors.jenkinsUrl}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Username (Optional)
              </label>
              <Input
                name="username"
                placeholder="Jenkins Username"
                value={formData.username || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                API Token (Optional)
              </label>
              <Input
                type="password"
                name="apiToken"
                placeholder="Jenkins API Token"
                value={formData.apiToken || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case "Slack":
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Slack Webhook URL
              </label>
              <Input
                name="webhookUrl"
                placeholder="https://hooks.slack.com/services/..."
                value={formData.webhookUrl || ""}
                onChange={handleInputChange}
                className={formErrors.webhookUrl ? "border-red-500" : ""}
              />
              {formErrors.webhookUrl && (
                <p className="text-red-500 text-xs">{formErrors.webhookUrl}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Channel (Optional)
              </label>
              <Input
                name="channel"
                placeholder="#channel-name"
                value={formData.channel || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case "Microsoft Teams":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Microsoft Teams Webhook URL
            </label>
            <Input
              name="webhookUrl"
              placeholder="https://outlook.office.com/webhook/..."
              value={formData.webhookUrl || ""}
              onChange={handleInputChange}
              className={formErrors.webhookUrl ? "border-red-500" : ""}
            />
            {formErrors.webhookUrl && (
              <p className="text-red-500 text-xs">{formErrors.webhookUrl}</p>
            )}
          </div>
        );

      case "Custom Webhook":
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Webhook URL</label>
              <Input
                name="webhookUrl"
                placeholder="https://custom-webhook.example.com"
                value={formData.webhookUrl || ""}
                onChange={handleInputChange}
                className={formErrors.webhookUrl ? "border-red-500" : ""}
              />
              {formErrors.webhookUrl && (
                <p className="text-red-500 text-xs">{formErrors.webhookUrl}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                JSON Payload (Optional)
              </label>
              <Input
                name="jsonPayload"
                placeholder='{"key": "value"}'
                value={formData.jsonPayload || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md-- ---mx-auto">
      <CardHeader>
        <CardTitle>Integration Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Integration Type
            </label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value);
                setFormData((prev) => ({ ...prev, type: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Integration Type" />
              </SelectTrigger>
              <SelectContent>
                {INTEGRATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Integration Name
            </label>
            <Input
              name="name"
              placeholder="Enter a name for this integration"
              value={formData.name}
              onChange={handleInputChange}
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs">{formErrors.name}</p>
            )}
          </div>

          {renderSpecificFields()}

          <Button title="" type="submit" className="w-full">
            Save Integration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IntegrationConfigForm;
