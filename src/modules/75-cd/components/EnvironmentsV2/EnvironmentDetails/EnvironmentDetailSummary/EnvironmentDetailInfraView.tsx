/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Collapse, Container, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
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
        label: getString('cd.environmentDetailPage.infraSlashCluster'),
        flexGrow: 23
      },
      {
        label: getString('cd.serviceDashboard.headers.instances'),
        flexGrow: 32
      },
      {
        label: getString('cd.serviceDashboard.headers.pipelineExecution'),
        flexGrow: 24
      }
    ]

    return (
      <Layout.Horizontal flex padding={{ top: 'medium', bottom: 'medium' }}>
        {headersArray.map((header, index) => {
          return (
            <Text
              key={index}
              font={{ variation: FontVariation.TABLE_HEADERS }}
              style={{ flex: header.flexGrow, textTransform: 'uppercase' }}
            >
              {header.label}
            </Text>
          )
        })}
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const list = React.useMemo(() => {
    if (!dataInfra.length) {
      return (
        <DialogEmptyState
          isSearchApplied={isSearchApplied}
          resetSearch={resetSearch}
          message={getString('cd.environmentDetailPage.selectInfraMsg')}
        />
      )
    }
    return (
      <Container>
        <div className="separator" style={{ marginTop: '14px', borderTop: '1px solid var(--grey-200)' }} />
        <Text
          icon="services"
          font={{ variation: FontVariation.SMALL_BOLD }}
          style={{ marginTop: 12 }}
        >{`${serviceFilter}, ${artifactFilter}`}</Text>
        {headers}
        <Container style={{ overflowY: 'auto', maxHeight: '590px' }}>
          {dataInfra.map((infra, index) => {
            return (
              <Collapse
                key={index}
                collapseClassName={css.collapseBody}
                collapseHeaderClassName={css.collapseHeader}
                heading={
                  <EnvironmentDetailInfraTable
                    tableType={InfraViewTableType.SUMMARY}
                    tableStyle={css.infraViewTableStyle}
                    data={infra}
                    artifactFilter={artifactFilter}
                    envFilter={envFilter}
                    serviceFilter={serviceFilter}
                  />
                }
                expandedHeading={<>{/* empty element on purpose */}</>}
                collapsedIcon={'main-chevron-right'}
                expandedIcon={'main-chevron-down'}
              >
                {
                  <EnvironmentDetailInfraTable
                    tableType={InfraViewTableType.FULL}
                    tableStyle={css.infraViewTableStyle}
                    data={infra}
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
  }, [artifactFilter, dataInfra, envFilter, getString, headers, isSearchApplied, resetSearch, serviceFilter])

  return list
}
