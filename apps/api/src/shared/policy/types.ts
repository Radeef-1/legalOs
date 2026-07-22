export type PolicyEffect = 'ALLOW' | 'DENY';

export interface Subject {
  userId: string;
  role: string;
  organizationId: string;
  branchId?: string | null;
  departmentId?: string | null;
  teamIds?: string[];
}

export interface Resource {
  type: string;
  id?: string;
  [key: string]: any;
}

export type ComparisonOperator = 'EQ' | 'NEQ' | 'IN' | 'CONTAINS' | 'GT' | 'LT' | 'GTE' | 'LTE';

export interface ConditionRule {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

export interface ConditionGroup {
  AND?: Array<ConditionRule | ConditionGroup>;
  OR?: Array<ConditionRule | ConditionGroup>;
  NOT?: ConditionRule | ConditionGroup;
}

export type PolicyConditions = ConditionRule | ConditionGroup;

export interface PolicyEvaluationContext {
  subject: Subject;
  resource?: Record<string, any>;
  environment?: Record<string, any>;
}
