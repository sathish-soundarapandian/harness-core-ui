/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import SideNav from '@cf/components/SideNav/SideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'

export type OperatorOption = {
  label: string
  value: string
  single?: boolean
}

export type IsSingleValued = (operatorValue: string) => boolean

export const useOperators = (
  i18nFn: (key: StringKeys) => string,
  keyMapper: (key: string) => StringKeys = x => x as StringKeys,
  extraOperators: OperatorOption[] = []
): [OperatorOption[], IsSingleValued] => {
  const getString = i18nFn
  const base = [
    { label: getString(keyMapper('startsWith')), value: 'starts_with', single: true },
    { label: getString(keyMapper('endsWith')), value: 'ends_with', single: true },
    { label: getString(keyMapper('contains')), value: 'contains', single: false },
    { label: getString(keyMapper('equal')), value: 'equal', single: true },
    { label: getString(keyMapper('equalSensitive')), value: 'equal_sensitive', single: true },
    { label: getString(keyMapper('in')), value: 'in', single: false }
  ]

  const extra = extraOperators.map(({ label, value, single = false }) => {
    return {
      label: getString(keyMapper(label)),
      value,
      single
    }
  })

  const opList = base.concat(extra)
  const isSingleValued: IsSingleValued = (operatorValue: string) =>
    opList.find(op => op.value === operatorValue)?.single || false
  return [opList, isSingleValued]
}

const operatorStringMap: Record<string, StringKeys> = {
  and: 'cf.clause.operators.and',
  in: 'cf.clause.operators.in',
  startsWith: 'cf.clause.operators.startsWith',
  endsWith: 'cf.clause.operators.endsWith',
  match: 'cf.clause.operators.match',
  contains: 'cf.clause.operators.contains',
  equal: 'cf.clause.operators.equal',
  equalSensitive: 'cf.clause.operators.equalSensitive',
  matchSegment: 'cf.clause.operators.matchSegment'
}

export const useOperatorsFromYaml = (extraOperators: OperatorOption[] = []): [OperatorOption[], IsSingleValued] => {
  const { getString } = useStrings()
  return useOperators(getString, key => operatorStringMap[key], extraOperators)
}

export const extraOperatorReference: Record<string, Record<string, OperatorOption>> = {
  customRules: {
    matchSegment: {
      label: 'matchSegment',
      value: 'segmentMatch',
      single: false
    }
  }
}

export const extraOperators: Record<string, OperatorOption[]> = Object.entries(extraOperatorReference).reduce(
  (acc: Record<string, OperatorOption[]>, [key, value]: [string, Record<string, OperatorOption>]) => {
    acc[key] = Object.values(value)
    return acc
  },
  {} as Record<string, OperatorOption[]>
)

export const CFVariationColors = [
  '#4065A0',
  '#65DEF2',
  '#E3B14F',
  '#42AB45',
  '#D9DAE5',
  '#00ADE4',
  '#f78383',
  '#e59c0b',
  '#7c8d9f',
  '#8c78ed',
  '#ff8f3f',
  '#ed61b5'
]

export const CFVariationColorsColorRef = [
  Color.PRIMARY_8,
  Color.TEAL_400,
  Color.YELLOW_900,
  Color.GREEN_600,
  Color.GREY_200,
  Color.PRIMARY_5,
  Color.RED_400,
  Color.YELLOW_900,
  Color.GREY_400,
  Color.PURPLE_400,
  Color.ORANGE_500,
  Color.MAGENTA_50
]

export const CFSideNavProps: SidebarContext = {
  navComponent: SideNav,
  title: 'Feature Flags',
  icon: 'cf-main'
}

export const DEFAULT_FLAG_GIT_REPO_PATH = '/flags.yaml'

export const PERCENTAGE_ROLLOUT_VALUE = 'Percentage Rollout'
