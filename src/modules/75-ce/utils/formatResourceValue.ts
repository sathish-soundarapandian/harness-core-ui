/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { QualityOfService } from '@ce/types'
import formatCost from './formatCost'

const BYTES_IN_A_GB = 1000000000
const BYTES_IN_A_MB = 1000000
const EMISSION_MULTIPLIER = 0.025

type fnNumberToString = (val: number) => string

const log10: (n: number) => number = n => Math.log(n) / Math.log(10)

export const getCPUValueInReadableForm: (val: number) => string = (val: number) => {
  if (!val) {
    return '0'
  }
  if (log10(val) < 0) {
    return `${Math.ceil(val * 1000)}m`
  }
  return val % 1 === 0 ? `${val}` : `${(val + 0.1).toFixed(1)}`
}

export const getMemValueInReadableForm: (val: number) => string = (val: number) => {
  if (!val) {
    return '0'
  }
  if (log10(val) >= 9) {
    return val % 1 === 0 ? `${val / BYTES_IN_A_GB}Gi` : `${(val / BYTES_IN_A_GB + 0.1).toFixed(1)}Gi`
  } else {
    return `${Math.ceil(val / BYTES_IN_A_MB)}Mi`
  }
}

export const getMemValueInReadableFormForChart: fnNumberToString = val => {
  if (!val) {
    return '0'
  }
  if (log10(val) >= 9) {
    return `${(val / BYTES_IN_A_GB).toFixed(2)}Gi`
  } else {
    return `${(val / BYTES_IN_A_MB).toFixed(2)}Mi`
  }
}

export const getCPUValueInmCPUs: fnNumberToString = val => {
  return `${val * 1000}`
}

export const getMemValueInGB: fnNumberToString = val => {
  return `${val / BYTES_IN_A_GB}Gi`
}

export const getRecommendationYaml: (
  cpuReqVal: string | number,
  memReqVal: string | number,
  memLimitVal?: string | number,
  qualityOfService?: QualityOfService
) => string = (cpuReqVal, memReqVal, memLimitVal, qualityOfService) => {
  const cpuLimitVal = qualityOfService === QualityOfService.GUARANTEED ? `\n  cpu: ${cpuReqVal}` : null

  return `limits:\n  memory: ${memLimitVal}${cpuLimitVal}\nrequests:\n  memory: ${memReqVal}\n  cpu: ${cpuReqVal}\n`
}

export const getMemoryValueInGBFromExpression: (val: string | number) => number = val => {
  const stringVal = `${val}`
  if (stringVal.includes('Gi')) {
    return Number(stringVal.split('Gi')[0])
  } else if (stringVal.includes('Mi')) {
    return Number(stringVal.split('Mi')[0]) / 1000
  }
  return Number(val) / BYTES_IN_A_GB
}

export const getCPUValueInCPUFromExpression: (val: string | number) => number = val => {
  const stringVal = `${val}`
  if (stringVal.includes('m')) {
    return Number(stringVal.split('m')[0]) / 1000
  }
  return Number(val)
}

export const getEmissionsValue = (cost: number) => {
  return formatCost(cost * EMISSION_MULTIPLIER, { currency: undefined, style: undefined })
}

export const getECSMemValueInReadableForm: (val: string | number) => string = val => {
  let stringVal = `${val}`

  if (!val) {
    return '0'
  }

  if (stringVal.includes('M')) {
    stringVal = stringVal.split('M')[0]
  } else if (stringVal.includes('G')) {
    stringVal = `${Number(stringVal.split('G')[0]) * 1000}`
  }

  return `${parseFloat(Number(stringVal).toFixed(3))}Mi`
}
