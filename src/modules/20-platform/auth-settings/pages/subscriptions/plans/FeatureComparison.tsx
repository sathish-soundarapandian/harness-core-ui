/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Accordion, Text, Icon, Container, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import type { FetchPlansQuery } from 'services/common/services'
import { useStrings } from 'framework/strings'
import css from './Plan.module.scss'

interface FeatureComparisonProps {
  module: string
  featureCaption?: NonNullable<FetchPlansQuery['pricing']>[
    | 'ciSaasFeatureCaption'
    | 'ffFeatureCaption'
    | 'cdFeatureCaption'
    | 'ccFeatureCaption']
  featureGroup?: NonNullable<FetchPlansQuery['pricing']>[
    | 'ciSaasFeatureGroup'
    | 'ffFeatureGroup'
    | 'cdFeatureGroup'
    | 'ccFeatureGroup']
}

interface PlanInfo {
  title: string
  link?: string
  freeText?: string
  freeValue?: string
  teamText?: string
  teamValue?: string
  enterpriseText?: string
  enterpriseValue?: string
  className?: string
}

const RenderColumnPlans: Renderer<CellProps<PlanInfo>> = ({ row }) => {
  const data = row.original
  const className = data.className
  if (data.link) {
    return (
      <a target="_blank" href={data.link} rel="noreferrer">
        <Text
          color={Color.PRIMARY_6}
          rightIcon="main-share"
          rightIconProps={{ color: Color.PRIMARY_6 }}
          className={css.inline}
        >
          {data.title}
        </Text>
      </a>
    )
  }
  return (
    <Text className={className} color={Color.BLACK}>
      {data.title}
    </Text>
  )
}

const RenderColumnFree: Renderer<CellProps<PlanInfo>> = ({ row }) => {
  const data = row.original
  return getCell(data.freeText, data.freeValue)
}

const RenderColumnTeam: Renderer<CellProps<PlanInfo>> = ({ row }) => {
  const data = row.original
  return getCell(data.teamText, data.teamValue)
}

const RenderColumnEnterprise: Renderer<CellProps<PlanInfo>> = ({ row }) => {
  const data = row.original
  return getCell(data.enterpriseText, data.enterpriseValue)
}

function getCell(text?: string, value?: string): React.ReactElement {
  if (text) {
    return (
      <Container flex={{ align: 'center-center' }} padding={{ left: 'small', right: 'small' }}>
        <Text className={css.centerText}>{text}</Text>
      </Container>
    )
  }
  if (value) {
    if (value.trim().toLowerCase() === 'yes') {
      return (
        <Container flex={{ align: 'center-center' }}>
          <Icon name="coverage-status-success" size={32} />
        </Container>
      )
    }
    if (value.trim().toLowerCase() === 'no') {
      return (
        <Container flex={{ align: 'center-center' }}>
          <Icon name="coverage-status-error" size={32} />
        </Container>
      )
    }
  }
  return <div></div>
}

function getHeader(
  module: string,
  index: number,
  featureCaptions?: NonNullable<FetchPlansQuery['pricing']>[
    | 'ciSaasFeatureCaption'
    | 'ffFeatureCaption'
    | 'cdFeatureCaption'
    | 'ccFeatureCaption']
): React.ReactElement {
  const moduleColorMap: Record<string, string> = {
    cd: css.cdColor,
    ce: css.ccmColor,
    cf: css.ffColor,
    ci: css.ciColor
  }
  if (featureCaptions && featureCaptions[index]) {
    return (
      <Text flex={{ align: 'center-center' }} className={moduleColorMap[module]} font={{ weight: 'semi-bold' }}>
        {(featureCaptions as any[])[index].title}
      </Text>
    )
  }
  return <div></div>
}

const FeatureTable: React.FC<FeatureComparisonProps> = ({ featureCaption = [], featureGroup = [], module }) => {
  const { getString } = useStrings()
  const columns: Column<PlanInfo>[] = useMemo(
    () => [
      {
        Header: (
          <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
            {getString('common.subscriptions.tabs.plans')}
          </Text>
        ),
        accessor: row => row.title,
        id: 'plans',
        width: '25%',
        Cell: RenderColumnPlans
      },
      {
        Header: getHeader(module, 0, featureCaption),
        accessor: row => row.freeText,
        id: 'free',
        width: '25%',
        Cell: RenderColumnFree
      },
      {
        Header: getHeader(module, 1, featureCaption),
        accessor: row => row.teamText,
        id: 'team',
        width: '25%',
        Cell: RenderColumnTeam
      },
      {
        Header: getHeader(module, 2, featureCaption),
        accessor: row => row.enterpriseText,
        id: 'enterprise',
        width: '25%',
        Cell: RenderColumnEnterprise
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [featureCaption]
  )

  const data: PlanInfo[] = useMemo(
    () =>
      (featureGroup as any[]).reduce((acc, curr) => {
        if (curr?.title) {
          acc?.push({
            title: curr?.title,
            className: css.subCaption
          })
        }
        curr?.detailedFeature?.forEach((feature: any) => {
          acc?.push(feature)
        })
        return acc
      }, [] as PlanInfo[]),
    [featureGroup]
  )

  return <TableV2<PlanInfo> columns={columns} data={data} />
}
const FeatureComparison: React.FC<FeatureComparisonProps> = ({ featureCaption, featureGroup, module }) => {
  const { getString } = useStrings()

  return (
    <Accordion className={css.accordion}>
      <Accordion.Panel
        id="feature"
        summary={
          <Text color={Color.PRIMARY_6} padding={{ left: 'small' }}>
            {getString('common.plans.featureComparison')}
          </Text>
        }
        details={<FeatureTable featureCaption={featureCaption} featureGroup={featureGroup} module={module} />}
      />
    </Accordion>
  )
}

export default FeatureComparison
