import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface ReadReplicaNode {
  nodeId: string;
  url: string;
  role: 'PRIMARY' | 'READ_REPLICA';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
}

@Injectable()
export class ReadReplicaRouterService {
  private readonly logger = new Logger(ReadReplicaRouterService.name);

  private readonly replicaNodes: ReadReplicaNode[] = [
    { nodeId: 'node-primary-01', url: 'postgresql://legalos:5432/primary', role: 'PRIMARY', healthStatus: 'HEALTHY', latencyMs: 1.1 },
    { nodeId: 'node-read-01', url: 'postgresql://legalos-read-1:5432/replica', role: 'READ_REPLICA', healthStatus: 'HEALTHY', latencyMs: 2.4 },
    { nodeId: 'node-read-02', url: 'postgresql://legalos-read-2:5432/replica', role: 'READ_REPLICA', healthStatus: 'HEALTHY', latencyMs: 2.1 },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves appropriate database node based on query operation type (Write vs Read Heavy Analytics)
   */
  resolveDatabaseNode(operationType: 'WRITE' | 'READ_ANALYTICS' | 'SEARCH_INDEX'): ReadReplicaNode {
    if (operationType === 'WRITE') {
      return this.replicaNodes[0]; // Always route writes to Primary Node
    }

    // Select healthy read replica with lowest latency
    const healthyReplicas = this.replicaNodes
      .filter((n) => n.role === 'READ_REPLICA' && n.healthStatus === 'HEALTHY')
      .sort((a, b) => a.latencyMs - b.latencyMs);

    const targetNode = healthyReplicas[0] || this.replicaNodes[0];
    this.logger.log(
      `[ReadReplicaRouterService] Routed ${operationType} query to Database Node [${targetNode.nodeId}] (Latency: ${targetNode.latencyMs}ms)`,
    );

    return targetNode;
  }

  /**
   * Executes analytics reporting query through Replica pool
   */
  async executeAnalyticsQuery<T>(queryTask: (dbNode: ReadReplicaNode) => Promise<T>): Promise<T> {
    const node = this.resolveDatabaseNode('READ_ANALYTICS');
    return queryTask(node);
  }

  getNodeMetrics() {
    return {
      nodesCount: this.replicaNodes.length,
      primaryNode: this.replicaNodes[0],
      readReplicas: this.replicaNodes.filter((n) => n.role === 'READ_REPLICA'),
    };
  }
}
