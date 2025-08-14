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
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit,
  Trash2,  
  XCircle, 
  Github,
  Slack,
  Webhook,
  Users,
  Mail
} from "lucide-react";

// Integration types
const INTEGRATION_TYPES = [
  "GitHub",
  "Jenkins",
  "Slack",
  "Microsoft Teams",
  "Custom Webhook",
  "FreshDesk",
  "Email SMTP",
] as const;

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
}

const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'GitHub': return Github;
    case 'Slack': return Slack;
    case 'Microsoft Teams': return Users;
    case 'Email SMTP': return Mail;
    default: return Webhook;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'error': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const IntegrationConfigForm: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Main GitHub Repo',
      type: 'GitHub',
      status: 'active',
      lastSync: '2024-01-20 10:30:00',
      config: { repository: 'company/main-app' }
    },
    {
      id: '2',
      name: 'Dev Team Slack',
      type: 'Slack',
      status: 'active',
      lastSync: '2024-01-20 09:15:00',
      config: { channel: '#dev-alerts' }
    },
    {
      id: '3',
      name: 'Jenkins CI',
      type: 'Jenkins',
      status: 'error',
      lastSync: '2024-01-19 14:22:00',
      config: { url: 'https://jenkins.company.com' }
    },
    {
      id: '4',
      name: 'Alert Email Service',
      type: 'Email SMTP',
      status: 'active',
      lastSync: '2024-01-20 08:45:00',
      config: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUsername: 'alerts@company.com',
        smtpPassword: 'app-password-123',
        fromEmail: 'alerts@company.com',
        useTLS: 'true'
      }
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
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
        if (!formData.domain || !isValidUrl(formData.domain)) {
          errors.domain = "Invalid Domain URL";
        }
        if (!formData.apiKey || formData.apiKey.length < 10) {
          errors.apiKey = "FreshDesk API key is required";
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
      case "Email SMTP":
        if (!formData.smtpHost || formData.smtpHost.length < 3) {
          errors.smtpHost = "SMTP Host is required";
        }
        if (!formData.smtpPort || isNaN(Number(formData.smtpPort))) {
          errors.smtpPort = "Valid SMTP Port is required";
        }
        if (!formData.smtpUsername || formData.smtpUsername.length < 3) {
          errors.smtpUsername = "SMTP Username is required";
        }
        if (!formData.smtpPassword || formData.smtpPassword.length < 3) {
          errors.smtpPassword = "SMTP Password is required";
        }
        if (!formData.fromEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
          errors.fromEmail = "Valid From Email is required";
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
      if (editingIntegration) {
        // Update existing integration
        const updatedIntegration: Integration = {
          ...editingIntegration,
          name: formData.name,
          type: selectedType,
          config: formData,
          lastSync: new Date().toLocaleString()
        };
        setIntegrations(prev => prev.map(int => 
          int.id === editingIntegration.id ? updatedIntegration : int
        ));
      } else {
        // Create new integration
        const newIntegration: Integration = {
          id: Date.now().toString(),
          name: formData.name,
          type: selectedType,
          status: 'active',
          lastSync: new Date().toLocaleString(),
          config: formData
        };
        setIntegrations(prev => [...prev, newIntegration]);
      }
      closeForm();
    }
  };

  const editIntegration = (integration: Integration) => {
    setEditingIntegration(integration);
    setSelectedType(integration.type);
    setFormData({ ...integration.config, name: integration.name, type: integration.type });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIntegration(null);
    setFormData({ type: "GitHub", name: "" });
    setFormErrors({});
  };

  const deleteIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(int => int.id !== id));
  };

  const toggleIntegrationStatus = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id 
        ? { ...int, status: int.status === 'active' ? 'inactive' : 'active' as const }
        : int
    ));
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

      case "FreshDesk":
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">FreshDesk Domain</label>
              <Input
                name="domain"
                placeholder="https://yourcompany.freshdesk.com"
                value={formData.domain || ""}
                onChange={handleInputChange}
                className={formErrors.domain ? "border-red-500" : ""}
              />
              {formErrors.domain && (
                <p className="text-red-500 text-xs">{formErrors.domain}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">API Key</label>
              <Input
                type="password"
                name="apiKey"
                placeholder="FreshDesk API Key"
                value={formData.apiKey || ""}
                onChange={handleInputChange}
                className={formErrors.apiKey ? "border-red-500" : ""}
              />
              {formErrors.apiKey && (
                <p className="text-red-500 text-xs">{formErrors.apiKey}</p>
              )}
            </div>
          </>
        );

      case "Email SMTP":
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">SMTP Host</label>
              <Input
                name="smtpHost"
                placeholder="smtp.gmail.com"
                value={formData.smtpHost || ""}
                onChange={handleInputChange}
                className={formErrors.smtpHost ? "border-red-500" : ""}
              />
              {formErrors.smtpHost && (
                <p className="text-red-500 text-xs">{formErrors.smtpHost}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">SMTP Port</label>
              <Input
                name="smtpPort"
                type="number"
                placeholder="587"
                value={formData.smtpPort || ""}
                onChange={handleInputChange}
                className={formErrors.smtpPort ? "border-red-500" : ""}
              />
              {formErrors.smtpPort && (
                <p className="text-red-500 text-xs">{formErrors.smtpPort}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Username</label>
              <Input
                name="smtpUsername"
                placeholder="your-email@gmail.com"
                value={formData.smtpUsername || ""}
                onChange={handleInputChange}
                className={formErrors.smtpUsername ? "border-red-500" : ""}
              />
              {formErrors.smtpUsername && (
                <p className="text-red-500 text-xs">{formErrors.smtpUsername}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Password</label>
              <Input
                type="password"
                name="smtpPassword"
                placeholder="App Password or SMTP Password"
                value={formData.smtpPassword || ""}
                onChange={handleInputChange}
                className={formErrors.smtpPassword ? "border-red-500" : ""}
              />
              {formErrors.smtpPassword && (
                <p className="text-red-500 text-xs">{formErrors.smtpPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">From Email</label>
              <Input
                name="fromEmail"
                type="email"
                placeholder="alerts@company.com"
                value={formData.fromEmail || ""}
                onChange={handleInputChange}
                className={formErrors.fromEmail ? "border-red-500" : ""}
              />
              {formErrors.fromEmail && (
                <p className="text-red-500 text-xs">{formErrors.fromEmail}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Use TLS (Optional)</label>
              <Select
                value={formData.useTLS || "true"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, useTLS: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-gray-600">Manage your third-party integrations</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Integration
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {integrations.map((integration) => {
          const Icon = getIntegrationIcon(integration.type);
          return (
            <Card key={integration.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={20} className="text-gray-600" />
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Type: {integration.type}</p>
                  <p className="text-sm text-gray-600">Last sync: {integration.lastSync}</p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editIntegration(integration)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleIntegrationStatus(integration.id)}
                    >
                      {integration.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteIntegration(integration.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Integration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingIntegration ? 'Edit Integration' : 'Add Integration'}</CardTitle>
                <Button variant="ghost" onClick={closeForm}>
                  <XCircle size={20} />
                </Button>
              </div>
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

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingIntegration ? 'Update Integration' : 'Save Integration'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const IntegrationsPage = IntegrationConfigForm;
export default IntegrationsPage;
