/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Text, Card, TableV2, Container, Icon, PageError, NoDataCard } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetSloConsumptionBreakdownView } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  RenderSLIType,
  RenderTarget
} from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/components/AddSlos/components/SLOList.utils'
import {
  RenderMonitoredService,
  RenderSLOName,
  RenderAssignedWeightage,
  RenderActualSlo,
  RenderErrorBudgetBurned,
  RenderContributedErrorBudgetBurned,
  getDate
} from './CompositeSLOConsumption.utils'
import css from '../../DetailsPanel.module.scss'

interface CompositeSLOConsumptionProps {
  startTime: number
  endTime: number
}

const CompositeSLOConsumption = ({ startTime, endTime }: CompositeSLOConsumptionProps): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { error, loading, data, refetch } = useGetSloConsumptionBreakdownView({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      startTime,
      endTime
    }
  })

  let content = <></>
  const tabelData = defaultTo(data?.data?.content, [])
  if (loading) {
    content = (
      <Container height={200} flex={{ justifyContent: 'center' }} style={{ overflow: 'auto' }}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  } else if (error) {
    content = (
      <Container height={200} style={{ overflow: 'auto' }}>
        <PageError width={400} message={getErrorMessage(error)} onClick={() => refetch()} />
      </Container>
    )
  } else if (isEmpty(tabelData)) {
    content = (
      <Container height={200} style={{ overflow: 'auto' }}>
        <NoDataCard icon={'join-table'} message={getString('cv.slos.noData')} />
      </Container>
    )
  } else {
    content = (
      <TableV2
        sortable={true}
        data={tabelData}
        columns={[
          {
            accessor: 'sloName',
            Header: getString('cv.slos.sloName').toUpperCase(),
            width: '20%',
            Cell: RenderSLOName
          },
          {
            accessor: 'serviceName',
            Header: getString('cv.slos.monitoredService').toUpperCase(),
            width: '15%',
            Cell: RenderMonitoredService
          },
          {
            accessor: 'sliType',
            Header: getString('cv.slos.sliType'),
            width: '10%',
            Cell: RenderSLIType
          },
          {
            accessor: 'weightagePercentage',
            Header: getString('cv.CompositeSLO.Consumption.AssignedWeightage').toUpperCase(),
            width: '10%',
            Cell: RenderAssignedWeightage
          },
          {
            accessor: 'sloTargetPercentage',
            Header: getString('cv.slos.target').toUpperCase(),
            width: '10%',
            Cell: RenderTarget
          },
          {
            accessor: 'sliStatusPercentage',
            Header: getString('cv.CompositeSLO.Consumption.ActualSlo').toUpperCase(),
            width: '10%',
            Cell: RenderActualSlo
          },
          {
            accessor: 'errorBudgetBurned',
            Header: getString('cv.CompositeSLO.Consumption.ErrorBudgetBurned').toUpperCase(),
            width: '10%',
            Cell: RenderErrorBudgetBurned
          },
          {
            accessor: 'contributedErrorBudgetBurned',
            Header: getString('cv.CompositeSLO.Consumption.ContributedErrorBudgetBurned').toUpperCase(),
            width: '10%',
            Cell: RenderContributedErrorBudgetBurned
          }
        ]}
      />
    )
  }

  return (
    <Card className={css.serviceDetailsCard}>
      <Text font={{ variation: FontVariation.CARD_TITLE }} color={Color.GREY_800} padding={{ bottom: 'medium' }}>
        {getString('cv.CompositeSLO.Consumption.title')}({getDate(startTime)} - {getDate(endTime)})
      </Text>
      {content}
    </Card>
  )
}
export default CompositeSLOConsumption
