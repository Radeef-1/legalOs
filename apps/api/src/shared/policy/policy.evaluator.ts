import { ConditionRule, ConditionGroup, PolicyConditions, PolicyEvaluationContext } from './types';

export class PolicyEvaluator {
  static evaluate(conditions: PolicyConditions, ctx: PolicyEvaluationContext): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true; // Empty conditions evaluate to true (no constraints)
    }

    if (this.isConditionGroup(conditions)) {
      return this.evaluateGroup(conditions, ctx);
    } else if (this.isConditionRule(conditions)) {
      return this.evaluateRule(conditions, ctx);
    }

    return false;
  }

  private static isConditionGroup(cond: any): cond is ConditionGroup {
    return cond.AND !== undefined || cond.OR !== undefined || cond.NOT !== undefined;
  }

  private static isConditionRule(cond: any): cond is ConditionRule {
    return cond.field !== undefined && cond.operator !== undefined;
  }

  private static evaluateGroup(group: ConditionGroup, ctx: PolicyEvaluationContext): boolean {
    if (group.AND) {
      const andResult = group.AND.every((sub) => this.evaluate(sub, ctx));
      if (!andResult) return false;
    }

    if (group.OR) {
      const orResult = group.OR.some((sub) => this.evaluate(sub, ctx));
      if (!orResult) return false;
    }

    if (group.NOT) {
      const notResult = !this.evaluate(group.NOT, ctx);
      if (!notResult) return false;
    }

    return true;
  }

  private static evaluateRule(rule: ConditionRule, ctx: PolicyEvaluationContext): boolean {
    const leftValue = this.resolvePath(rule.field, ctx);
    const rightValue = this.resolvePath(rule.value, ctx);

    switch (rule.operator) {
      case 'EQ':
        return leftValue === rightValue;
      case 'NEQ':
        return leftValue !== rightValue;
      case 'IN':
        return Array.isArray(rightValue) ? rightValue.includes(leftValue) : false;
      case 'CONTAINS':
        return Array.isArray(leftValue) ? leftValue.includes(rightValue) : false;
      case 'GT':
        return leftValue > rightValue;
      case 'LT':
        return leftValue < rightValue;
      case 'GTE':
        return leftValue >= rightValue;
      case 'LTE':
        return leftValue <= rightValue;
      default:
        return false;
    }
  }

  private static resolvePath(expr: any, ctx: PolicyEvaluationContext): any {
    if (typeof expr !== 'string') {
      return expr;
    }

    if (expr.startsWith('subject.')) {
      const path = expr.substring(8);
      return this.getNestedProperty(ctx.subject, path);
    }

    if (expr.startsWith('resource.') && ctx.resource) {
      const path = expr.substring(9);
      return this.getNestedProperty(ctx.resource, path);
    }

    if (expr.startsWith('environment.') && ctx.environment) {
      const path = expr.substring(12);
      return this.getNestedProperty(ctx.environment, path);
    }

    return expr; // Literal value string
  }

  private static getNestedProperty(obj: any, path: string): any {
    if (!obj) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }
}
