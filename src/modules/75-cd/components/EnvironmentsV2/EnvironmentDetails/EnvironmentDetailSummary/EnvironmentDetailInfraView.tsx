/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Collapse, Container, Icon, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { capitalize } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { InstanceGroupedByInfrastructureV2 } from 'services/cd-ng'
import { EnvironmentDetailInfraTable, InfraViewTableType } from './EnvironmentDetailInfraTable'
import { DialogEmptyState } from './EnvironmentDetailsUtils'
import css from './EnvironmentDetailSummary.module.scss'

interface EnvironmentDetailInfraViewProps {
  artifactFilter: string
  serviceFilter: string
  envFilter: string
  data: InstanceGroupedByInfrastructureV2[][]
  isSearchApplied: boolean
  resetSearch: () => void
}

export default function EnvironmentDetailInfraView(props: EnvironmentDetailInfraViewProps): React.ReactElement {
  const { artifactFilter, envFilter, serviceFilter, data: dataInfra, isSearchApplied = false, resetSearch } = props
  const { getString } = useStrings()

  const headers = React.useMemo(() => {
    const headersArray = [
      {
        label: getString('cd.environmentDetailPage.infraSlashCluster')
      },
      {
        label: getString('cd.serviceDashboard.headers.instances')
      },
      {
        label: getString('cd.serviceDashboard.headers.pipelineExecution')
      }
    ]

    return (
      <Layout.Horizontal className={css.instanceHeaderStyle}>
        {headersArray.map((header, index) => {
          return (
            <Text key={index} font={{ variation: FontVariation.TABLE_HEADERS }} style={{ textTransform: 'uppercase' }}>
              {header.label}
            </Text>
          )
        })}
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const instanceGroupedList = dataInfra.flat()

  const InfraViewHeader = (
    <Layout.Horizontal
      margin={{ top: 'medium', bottom: 'small' }}
      flex={{ alignItems: 'center', justifyContent: 'start' }}
      spacing="small"
    >
      <Icon name="services" color={Color.GREY_1000} />
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {capitalize(getString('service').toLowerCase()) + ':'}
      </Text>
      <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
        {serviceFilter}
      </Text>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_600}>
        {' | '}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {capitalize(getString('cd.serviceDashboard.artifact')) + ':'}
      </Text>
      <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
        {artifactFilter}
      </Text>
    </Layout.Horizontal>
  )

  if (!instanceGroupedList.length) {
    return (
      <DialogEmptyState
        isSearchApplied={isSearchApplied}
        resetSearch={resetSearch}
        message={getString('cd.environmentDetailPage.selectArtifactMsg')}
      />
    )
  }

  return (
    <Container>
      <div className={cx('separator', css.separatorStyle)} />
      {InfraViewHeader}
      {headers}
      <Container style={{ overflowY: 'auto', maxHeight: '582px' }}>
        {instanceGroupedList.map((infra, index) => {
          if (infra.instanceGroupedByPipelineExecutionList?.length === 1) {
            return (
              <Container className={css.nonCollapseRow}>
                <EnvironmentDetailInfraTable
                  tableType={InfraViewTableType.FULL}
                  tableStyle={css.infraViewTableStyle}
                  data={[infra]}
                  artifactFilter={artifactFilter}
                  envFilter={envFilter}
                  serviceFilter={serviceFilter}
                />
              </Container>
            )
          }
          return (
            <Collapse
              key={index}
              collapseClassName={css.collapseBody}
              collapseHeaderClassName={css.collapseHeader}
              heading={
                <EnvironmentDetailInfraTable
                  tableType={InfraViewTableType.SUMMARY}
                  tableStyle={css.infraViewTableStyle}
                  data={[infra]}
                  artifactFilter={artifactFilter}
                  envFilter={envFilter}
                  serviceFilter={serviceFilter}
                />
              }
              keepChildrenMounted={true}
              expandedHeading={<>{/* empty element on purpose */}</>}
              collapsedIcon={'main-chevron-right'}
              expandedIcon={'main-chevron-down'}
              transitionDuration={0}
            >
              {
                <EnvironmentDetailInfraTable
                  tableType={InfraViewTableType.FULL}
                  tableStyle={css.infraViewTableStyle}
                  data={[infra]}
                  artifactFilter={artifactFilter}
                  envFilter={envFilter}
                  serviceFilter={serviceFilter}
                />
              }
            </Collapse>
          )
        })}
      </Container>
    </Container>
  )
}
