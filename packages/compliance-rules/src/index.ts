// Compliance rules engine
export class ComplianceEngine {
  static readonly DEFAULT_RULES = {
    AGE_RESTRICTION: 18,
    MAX_STAKE_AMOUNT: null, // No limit by default
    MAX_BUY_IN: null,
  };

  private rules: Map<string, any> = new Map();

  constructor(initialRules: Record<string, any> = {}) {
    this.rules.set('*', { ...ComplianceEngine.DEFAULT_RULES, ...initialRules });
  }

  addJurisdictionRules(jurisdiction: string, rules: Record<string, any>): void {
    this.rules.set(jurisdiction, { ...ComplianceEngine.DEFAULT_RULES, ...rules });
  }

  getRules(jurisdiction: string): Record<string, any> {
    return this.rules.get(jurisdiction) || this.rules.get('*')!;
  }

  isUserEligible(jurisdiction: string, userAge: number): boolean {
    const rules = this.getRules(jurisdiction);
    return userAge >= rules.AGE_RESTRICTION;
  }

  isValidStake(jurisdiction: string, stakeAmount: number): boolean {
    const rules = this.getRules(jurisdiction);
    if (rules.MAX_STAKE_AMOUNT === null) return true;
    return stakeAmount <= rules.MAX_STAKE_AMOUNT;
  }

  isValidBuyIn(jurisdiction: string, buyIn: number): boolean {
    const rules = this.getRules(jurisdiction);
    if (rules.MAX_BUY_IN === null) return true;
    return buyIn <= rules.MAX_BUY_IN;
  }
}

export default ComplianceEngine;
