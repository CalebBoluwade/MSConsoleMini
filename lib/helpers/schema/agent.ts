import { TypeOf, z } from "zod";

export const DeployAgentRequestPayload = z.strictObject({
  environment: z.string().min(1, "Environment is required"),
  agentVersion: z.string().min(1, "Agent version is required"),
  AgentHost: z.string().ip("Invalid IP address format"),
  AgentPort: z.number().min(1, "Port must be greater than 0").max(65535, "Port must be less than 65536"),
  sshUsername: z.string().min(1, "SSH username is required"),
  sshPassword: z.string().min(1, "SSH password is required"),
});

export type DeployAgentRequestPayload = TypeOf<
  typeof DeployAgentRequestPayload
>;
