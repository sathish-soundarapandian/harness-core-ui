import { Editions } from '@common/constants/SubscriptionTypes'

export enum PlanType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum SupportType {
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

export enum ffUnitTypes {
  DEVELOPER = 'developer',
  MAU = 'MAU'
}

export const UnitRanges = {
  developer: ['developer', 1, 50, 1],
  mau: ['mau', 25, 1000, 25]
}

export const getSupportType = (planType: PlanType) => {
  switch (planType) {
    case PlanType.MONTHLY:
      return SupportType.STANDARD
    case PlanType.YEARLY:
      return SupportType.PREMIUM
    default:
      throw new Error(' Plan not found')
  }
}

export const editionName = (edition: Editions) => {
  switch (edition) {
    case Editions.FREE:
      return 'Free'
    case Editions.TEAM:
      return 'Team'
    case Editions.ENTERPRISE:
      return 'Enterprise'
    default:
      return 'Community'
  }
}

export const acquireCurrentPlan = (page: string): [Editions, PlanType] => {
  if (page === 'PLANS') {
    return [Editions.FREE, PlanType.MONTHLY]
  }
  return [Editions.TEAM, PlanType.MONTHLY]
}

const productCosts = {
  developer: { yearly: 180, monthly: Math.round(180 / 12 / 0.8) },
  MAU: {
    yearly: 900,
    monthly: 900 / 12 / 0.8
  }
}

export const getCostForUnits = (units: number, unitType: ffUnitTypes, edition: Editions, planType: PlanType) => {
  switch (edition) {
    case Editions.FREE:
      return 0
    case Editions.TEAM:
      return productCosts[unitType][planType] * units
    case Editions.ENTERPRISE:
      return productCosts[unitType][planType] * units
    default:
      return 0
  }
}

export const calculateCostTotal = (
  unitsInUse: number,
  costPerUnit: number,
  unitsInPlan?: number,
  surcharge?: number
) => {
  if (unitsInPlan && surcharge) {
    const surChargedUnits = Math.max(unitsInUse - unitsInPlan, 0)
    const normalCharge = Math.max(unitsInPlan, unitsInUse) * costPerUnit
    return surChargedUnits * surcharge + normalCharge
  }
  return unitsInUse * costPerUnit
}
