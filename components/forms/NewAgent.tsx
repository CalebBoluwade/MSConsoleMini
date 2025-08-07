import React, { useState } from "react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Network, Server } from "lucide-react";
// import { useCreateAndDeployAgentMutation } from "@/lib/Context/API/Services.Context";
import { Input } from "../ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { DeployAgentRequestPayload } from "@/lib/helpers/schema/agent";
import Divider from "../Divider";

const DeployNewAgent = ({ IP, Port }: { IP: string; Port: number }) => {
  const [status, setStatus] = useState("idle");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{
    success?: boolean;
    message?: string;
    output?: string;
    error?: string;
  } | null>(null);

  // const [CreateAndDeployAgent] = useCreateAndDeployAgentMutation();

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStatus(null);
    try {
      // CreateAndDeployAgent()
      //   .unwrap()
      //   .then((res) => {
      //      setDeploymentStatus(res.Data);
      //   })
      //   .catch((err) => {
      //     throw new Error(err.message || "Deployment failed");
      //   });
    } catch (error) {
      console.error("Deployment failed:", error);
      setStatus("failed");
    }
  };

  const agentCreateForm = useForm<z.infer<typeof DeployAgentRequestPayload>>({
    shouldFocusError: true,
    resolver: zodResolver(DeployAgentRequestPayload),
    defaultValues: {
      agentVersion: usePathname().split("/").at(-1) as string,
      AgentHost: [...IP],
      // type: false,
    },
  });

  // const [CreateAgent, {}] = useCreateLicenseMutation();

  const onSubmit = async (data: z.infer<typeof DeployAgentRequestPayload>) => {
    // z.infer<typeof formSchema>
    try {
      console.log(data);

      // const payload = { ...data };

      // CreateAgent(payload)
      //   .unwrap()
      //   .then((res) => {
      //     console.log(res);
      //   })
      //   .catch((e) => console.error(e));
    } catch (error) {
      console.error("Validation error:", error);
    }
  };
  return (
    <FormProvider {...agentCreateForm}>
      <form
        className="my-2 py-5 min-w-[500px]"
        onSubmit={agentCreateForm.handleSubmit((data) => onSubmit(data))}
      >
        <Divider title="Configure Agent" subTitle="" />
        <div className="grid grid-cols-1 gap-4 gap-y-5 sm:grid-cols-2">
          <FormField
            control={agentCreateForm.control}
            name="AgentHost"
            render={() => (
              <FormItem>
                <FormLabel>
                  <Server size={20} strokeWidth={1.5} /> Agent Host
                </FormLabel>
                <FormControl>
                  <Input
                    value={Port}
                    placeholder="e.g 192.168.x.x"
                    // {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={agentCreateForm.control}
            name="AgentPort"
            render={() => (
              <FormItem>
                <FormLabel>
                  <Network size={20} strokeWidth={1.5} /> Agent Port
                </FormLabel>
                <FormControl>
                  <Input
                    value={Port}
                    placeholder="Default Port: 30025"
                    // {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 gap-6">
          <button
            type="submit"
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`inline-block w-full rounded-lg px-5 py-3 font-medium text-white ${
              isDeploying ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isDeploying ? "Deploying..." : "Deploy Agent"}
          </button>
        </div>

        {deploymentStatus && (
          <div
            className={`p-4 rounded ${
              deploymentStatus.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <h3 className="font-bold">
              {deploymentStatus.success ? "Success!" : "Error"}
            </h3>
            <p>{deploymentStatus.message}</p>

            {deploymentStatus.output && (
              <details className="mt-2">
                <summary>Output</summary>
                <pre className="text-xs bg-black text-white p-2 rounded mt-1 overflow-auto">
                  {deploymentStatus.output}
                </pre>
              </details>
            )}
          </div>
        )}

        {status === "failed" && (
          <p className="mt-2 text-red-500">
            Deployment failed. Please try again.
          </p>
        )}

        <p className="mt-4 text-center">
          Having Issues configuring our Agent? View Documentation{" "}
          <Link href={"/docs/installation#Agents"}>Here</Link>
        </p>
      </form>
    </FormProvider>
  );
};

export default DeployNewAgent;
