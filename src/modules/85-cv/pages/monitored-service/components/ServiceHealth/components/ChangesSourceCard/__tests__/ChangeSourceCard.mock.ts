/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const changeSummary = {
  categoryCountMap: {
    Deployment: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 },
    Infrastructure: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 },
    FeatureFlag: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 },
    Alert: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 }
  },
  total: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 }
}

export const changeSummaryWithPositiveChange = {
  categoryCountMap: {
    Deployment: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 },
    Infrastructure: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 },
    FeatureFlag: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 },
    Alert: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 }
  },
  total: { count: 60, countInPrecedingWindow: 40, percentageChange: 50 }
}

export const changeSummaryWithAbove100PositiveChange = {
  categoryCountMap: {
    Deployment: { count: 15000, countInPrecedingWindow: 10, percentageChange: 15000 },
    Infrastructure: { count: 15000, countInPrecedingWindow: 10, percentageChange: 15000 },
    FeatureFlag: { count: 15000, countInPrecedingWindow: 10, percentageChange: 15000 },
    Alert: { count: 15000, countInPrecedingWindow: 10, percentageChange: 15000 }
  },
  total: {
    count: 60000,
    countInPrecedingWindow: 40,
    percentageChange: 15000
  }
}

export const changeSummaryWithNegativeChange = {
  categoryCountMap: {
    Deployment: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 },
    Infrastructure: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 },
    FeatureFlag: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 },
    Alert: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 }
  },
  total: { count: 40, countInPrecedingWindow: 60, percentageChange: -33.3 }
}

export const changeSourceCardData = [
  {
    count: 0,
    id: 'Changes',
    label: 'changes',
    percentage: 0
  },
  {
    count: 0,
    id: 'Deployment',
    label: 'deploymentsText',
    percentage: 0
  },
  {
    count: 0,
    id: 'Infrastructure',
    label: 'infrastructureText',
    percentage: 0
  },
  {
    count: 0,
    id: 'FeatureFlag',
    label: 'common.purpose.cf.continuous',
    percentage: 0
  },
  {
    count: 0,
    id: 'Alert',
    label: 'cv.changeSource.tooltip.incidents',
    percentage: 0
  }
]

export const changeSourceCardDataWithPositiveGrowth = [
  {
    count: 60,
    id: 'Changes',
    label: 'changes',
    percentage: 50
  },
  {
    count: 15,
    id: 'Deployment',
    label: 'deploymentsText',
    percentage: 50
  },
  {
    count: 15,
    id: 'Infrastructure',
    label: 'infrastructureText',
    percentage: 50
  },
  {
    count: 15,
    id: 'FeatureFlag',
    label: 'common.purpose.cf.continuous',
    percentage: 50
  },
  {
    count: 15,
    id: 'Alert',
    label: 'cv.changeSource.tooltip.incidents',
    percentage: 50
  }
]

export const expectedPositiveTextContent = [
  'changes50%',
  'deploymentsText50%',
  'infrastructureText50%',
  'common.purpose.cf.continuous50%',
  'cv.changeSource.tooltip.incidents50%'
]

export const expectedNegativeTextContent = [
  'changes33.3%',
  'deploymentsText33.3%',
  'infrastructureText33.3%',
  'common.purpose.cf.continuous33.3%',
  'cv.changeSource.tooltip.incidents33.3%'
]

export const expectedAbove100PositiveTextContent = [
  'changes100+ %',
  'deploymentsText100+ %',
  'infrastructureText100+ %',
  'common.purpose.cf.continuous100+ %',
  'cv.changeSource.tooltip.incidents100+ %'
]
