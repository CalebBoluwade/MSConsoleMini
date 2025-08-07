import { TypeOf, z } from "zod";

export const DeployAgentRequestPayload = z.strictObject({
  environment: z.string(),
  agentVersion: z.string(),
  AgentHost: z.array(z.string()),
  AgentPort: z.number().optional(),
});

export type DeployAgentRequestPayload = TypeOf<
  typeof DeployAgentRequestPayload
>;
