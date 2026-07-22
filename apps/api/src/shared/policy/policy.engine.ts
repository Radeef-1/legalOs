import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Subject, Resource, PolicyEffect, PolicyConditions } from './types';
import { PolicyEvaluator } from './policy.evaluator';

@Injectable()
export class PolicyEngineService {
  private readonly logger = new Logger(PolicyEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluate(subject: Subject, action: string, resource: Resource): Promise<boolean> {
    const policies = await this.prisma.db.policy.findMany({
      where: {
        OR: [
          { organizationId: subject.organizationId },
          { organizationId: null },
        ],
        isActive: true,
      },
    });

    // Match policies targeting action and resource type
    const matchingPolicies = policies.filter((p) => {
      const actionMatches = p.action === '*' || p.action === action;
      const resourceMatches = p.resource === '*' || p.resource === resource.type;
      return actionMatches && resourceMatches;
    });

    if (matchingPolicies.length === 0) {
      this.logger.warn(`No matching ABAC policies found for action: "${action}" on resource: "${resource.type}". Defaulting to DENY.`);
      return false;
    }

    const context = {
      subject,
      resource,
      environment: {
        timestamp: new Date(),
      },
    };

    // 1. Check DENY policies first (Deny overrides)
    const denyPolicies = matchingPolicies.filter((p) => p.effect === 'DENY');
    for (const policy of denyPolicies) {
      const isMatch = PolicyEvaluator.evaluate(policy.conditions as unknown as PolicyConditions, context);
      if (isMatch) {
        this.logger.warn(`ABAC Access DENIED by Policy "${policy.name}" [ID: ${policy.id}] for User: ${subject.userId}`);
        return false;
      }
    }

    // 2. Check ALLOW policies
    const allowPolicies = matchingPolicies.filter((p) => p.effect === 'ALLOW');
    for (const policy of allowPolicies) {
      const isMatch = PolicyEvaluator.evaluate(policy.conditions as unknown as PolicyConditions, context);
      if (isMatch) {
        this.logger.log(`ABAC Access ALLOWED by Policy "${policy.name}" [ID: ${policy.id}] for User: ${subject.userId}`);
        return true;
      }
    }

    this.logger.warn(`No ALLOW policies satisfied for action: "${action}" on resource: "${resource.type}". Access DENIED.`);
    return false;
  }

  async compilePrismaFilter(subject: Subject, action: string, resourceType: string): Promise<any> {
    const policies = await this.prisma.db.policy.findMany({
      where: {
        OR: [
          { organizationId: subject.organizationId },
          { organizationId: null },
        ],
        isActive: true,
        effect: 'ALLOW',
      },
    });

    const matchingPolicies = policies.filter((p) => {
      return (p.action === '*' || p.action === action) && (p.resource === '*' || p.resource === resourceType);
    });

    if (matchingPolicies.length === 0) {
      return { id: '00000000-0000-0000-0000-000000000000' }; // Empty result filter
    }

    // Convert policy conditions to Prisma filter OR conditions
    const orConditions: any[] = [];

    for (const policy of matchingPolicies) {
      const filter = this.convertConditionToPrismaWhere(policy.conditions as any, subject);
      if (filter && Object.keys(filter).length > 0) {
        orConditions.push(filter);
      }
    }

    if (orConditions.length === 0) {
      return {};
    }

    return orConditions.length === 1 ? orConditions[0] : { OR: orConditions };
  }

  private convertConditionToPrismaWhere(conditions: any, subject: Subject): any {
    if (!conditions) return null;

    if (conditions.AND && Array.isArray(conditions.AND)) {
      const ands = conditions.AND
        .map((c: any) => this.convertConditionToPrismaWhere(c, subject))
        .filter((c) => c && Object.keys(c).length > 0);
      if (ands.length === 0) return null;
      return ands.length === 1 ? ands[0] : { AND: ands };
    }

    if (conditions.OR && Array.isArray(conditions.OR)) {
      const ors = conditions.OR
        .map((c: any) => this.convertConditionToPrismaWhere(c, subject))
        .filter((c) => c && Object.keys(c).length > 0);
      if (ors.length === 0) return null;
      return ors.length === 1 ? ors[0] : { OR: ors };
    }

    if (conditions.field && conditions.field.startsWith('resource.')) {
      const fieldName = conditions.field.substring(9);
      let value = conditions.value;

      if (typeof value === 'string' && value.startsWith('subject.')) {
        const path = value.substring(8);
        value = (subject as any)[path];
      }

      switch (conditions.operator) {
        case 'EQ':
          return { [fieldName]: value };
        case 'NEQ':
          return { [fieldName]: { not: value } };
        case 'IN':
          return { [fieldName]: { in: Array.isArray(value) ? value : [value] } };
        case 'CONTAINS':
          return { [fieldName]: { has: value } };
        case 'GT':
          return { [fieldName]: { gt: value } };
        case 'LT':
          return { [fieldName]: { lt: value } };
        default:
          return null;
      }
    }

    return null;
  }
}
