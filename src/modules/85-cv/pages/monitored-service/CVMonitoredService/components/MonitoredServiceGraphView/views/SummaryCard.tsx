/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Container, Icon, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useGetMonitoredServiceDetailsWithServiceId } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SummaryCardContent from '../../GraphSummaryCard/GraphSummaryCard'
import type { SummaryCardProps } from '../ServiceDependencyGraph.types'
import css from '../ServiceDependencyGraph.module.scss'

export const SummaryCard: React.FC<SummaryCardProps> = ({ point, ...rest }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { data, loading, refetch, error } = useGetMonitoredServiceDetailsWithServiceId({
    monitoredServiceIdentifier: point?.monitoredServiceIdentifier ?? '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} width={300} />
  }

  if (!data) {
    return null
  }

  return <SummaryCardContent {...rest} monitoredService={data} />
}

const SummaryCardWrapper: React.FC<SummaryCardProps> = ({ point, ...rest }) => {
  if (!point?.sticky?.element) {
    return null
  }

  return createPortal(
    <foreignObject className="node" width="360px" height="485px">
      <Container
        height="100%"
        padding="large"
        background={Color.GREY_700}
        onClick={e => e.stopPropagation()}
        className={css.graphSummaryCard}
      >
        <SummaryCard {...rest} point={point} />
      </Container>
    </foreignObject>,
    point.sticky.element
  )
}

export default SummaryCardWrapper
