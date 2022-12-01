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
import { DialogEmptyState } from './EnvironmentDetailCommonUtils'
import css from './EnvironmentDetailSummary.module.scss'

interface EnvironmentDetailInfraViewProps {
  artifactFilter: string
  serviceFilter: string
  envFilter: string
  data: InstanceGroupedByInfrastructureV2[]
}

export default function EnvironmentDetailInfraView(props: EnvironmentDetailInfraViewProps): React.ReactElement {
  const { artifactFilter, envFilter, serviceFilter, data: dataInfra } = props
  const { getString } = useStrings()
  //todo cluster
  const isCluster = false

  const headers = React.useMemo(() => {
    const headersArray = [
      {
        label: isCluster ? getString('common.cluster') : getString('cd.serviceDashboard.headers.infrastructures'),
        flexGrow: 20
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
      return DialogEmptyState()
    }
    return (
      <Container>
        <div className="separator" style={{ marginTop: '14px', borderTop: '1px solid var(--grey-100)' }} />
        {headers}
        <Container style={{ overflowY: 'auto' }}>
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
                    data={[infra]}
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
  }, [artifactFilter, dataInfra, envFilter, headers, serviceFilter])

  return list
}
