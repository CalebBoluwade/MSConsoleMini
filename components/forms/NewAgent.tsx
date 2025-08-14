import React, { useState } from "react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Network,
  Server,
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  useCreateAndDeployAgentMutation,
  useValidateSSHConnectionMutation,
} from "@/lib/helpers/api/AgentService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { DeployAgentRequestPayload } from "@/lib/helpers/schema/agent";
import Divider from "../Divider";
import { toast } from "sonner";

type FormData = z.infer<typeof DeployAgentRequestPayload>;

const DeployNewAgent = ({ IP }: { IP: string }) => {
  const [isValidatingSSH, setIsValidatingSSH] = useState(false);
  const [sshValidated, setSSHValidated] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{
    success?: boolean;
    message?: string;
    output?: string;
    error?: string;
  } | null>(null);

  const [createAndDeployAgent, { isLoading: isDeploying }] =
    useCreateAndDeployAgentMutation();
  const [validateSSH] = useValidateSSHConnectionMutation();

  const agentCreateForm = useForm<FormData>({
    shouldFocusError: true,
    resolver: zodResolver(DeployAgentRequestPayload),
    defaultValues: {
      environment: "production",
      agentVersion: (usePathname().split("/").at(-1) as string) || "latest",
      AgentHost: IP,
      AgentPort: 30025,
      sshUsername: "",
      sshPassword: "",
    },
  });

  const validateSSHConnection = async () => {
    const formData = agentCreateForm.getValues();
    if (!formData.AgentHost || !formData.sshUsername || !formData.sshPassword) {
      toast.error("Please fill in all SSH connection details");
      return;
    }

    setIsValidatingSSH(true);
    try {
      const result = await validateSSH({
        host: formData.AgentHost,
        port: formData.AgentPort,
        username: formData.sshUsername,
        password: formData.sshPassword,
      }).unwrap();

      if (result.success) {
        setSSHValidated(true);
        toast.success("SSH connection validated successfully!");
      } else {
        toast.error(result.message || "SSH validation failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "SSH validation failed";
      toast.error(errorMessage);
    } finally {
      setIsValidatingSSH(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!sshValidated) {
      toast.error("Please validate SSH connection first");
      return;
    }

    setDeploymentStatus(null);
    try {
      const result = await createAndDeployAgent(data).unwrap();
      setDeploymentStatus(result);

      if (result.success) {
        toast.success("Agent deployed successfully!");
        agentCreateForm.reset();
        setSSHValidated(false);
      } else {
        toast.error(result.message || "Deployment failed");
      }
    } catch (error: unknown) {
      const errorMsg =
        (error as { data?: { message?: string } })?.data?.message ||
        "Deployment failed";
      setDeploymentStatus({
        success: false,
        message: errorMsg,
        error: errorMsg,
      });
      toast.error(errorMsg);
    }
  };

  return (
    <FormProvider {...agentCreateForm}>
      <form
        className="my-2 px-3"
        onSubmit={agentCreateForm.handleSubmit(onSubmit)}
      >
        <Divider
          title="Deploy New Agent"
          subTitle="Configure and deploy monitoring agent"
        />

        <div className="space-y-6">
          {/* Host Configuration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={agentCreateForm.control}
              name="AgentHost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Server size={16} /> Agent Host
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="192.168.1.100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={agentCreateForm.control}
              name="AgentPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Network size={16} /> Agent Port
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30025"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 30025)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SSH Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Lock size={16} /> SSH Credentials
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={agentCreateForm.control}
                name="sshUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User size={16} /> SSH Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="root" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={agentCreateForm.control}
                name="sshPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock size={16} /> SSH Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SSH Validation */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={validateSSHConnection}
                disabled={isValidatingSSH}
                className="flex items-center gap-2"
              >
                {isValidatingSSH ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : sshValidated ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <AlertCircle size={16} />
                )}
                {isValidatingSSH
                  ? "Validating..."
                  : sshValidated
                  ? "SSH Validated"
                  : "Validate SSH"}
              </Button>

              {sshValidated && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Connection verified
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Agent Version */}
            <FormField
              control={agentCreateForm.control}
              name="agentVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Version</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select agent version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="v2.1.0">v2.1.0</SelectItem>
                      <SelectItem value="v2.0.5">v2.0.5</SelectItem>
                      <SelectItem value="v2.0.0">v2.0.0</SelectItem>
                      <SelectItem value="v1.9.8">v1.9.8</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Environment */}
            <FormField
              control={agentCreateForm.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment</FormLabel>
                  <FormControl>
                    <Input placeholder="production" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Deploy Button */}
          <Button
            type="submit"
            disabled={isDeploying || !sshValidated}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            {isDeploying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deploying Agent...
              </>
            ) : (
              "Deploy Agent"
            )}
          </Button>

          {/* Status Messages */}
          {deploymentStatus && (
            <Alert
              className={
                deploymentStatus.success ? "border-green-500" : "border-red-500"
              }
            >
              {deploymentStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {deploymentStatus.success
                      ? "Success!"
                      : "Deployment Failed"}
                  </p>
                  <p>{deploymentStatus.message}</p>

                  {deploymentStatus.output && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        View Output
                      </summary>
                      <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded mt-2 overflow-auto max-h-40">
                        {deploymentStatus.output}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Help Link */}
          <div className="text-center text-sm text-gray-600">
            Need help? Check our{" "}
            <Link
              href="/docs/installation#Agents"
              className="text-blue-600 hover:underline"
            >
              installation documentation
            </Link>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default DeployNewAgent;
