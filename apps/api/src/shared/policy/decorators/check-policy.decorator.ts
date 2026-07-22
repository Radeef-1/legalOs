import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICY_KEY = 'check_policy';

export interface CheckPolicyMetadata {
  action: string;
  resourceType: string;
}

export const CheckPolicy = (action: string, resourceType: string) =>
  SetMetadata(CHECK_POLICY_KEY, { action, resourceType });
