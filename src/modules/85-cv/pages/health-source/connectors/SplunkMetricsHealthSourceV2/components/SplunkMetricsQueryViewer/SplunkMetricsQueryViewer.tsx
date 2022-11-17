/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Utils, Container, Text } from '@harness/uicore'
import { IDrawerProps, Position, Drawer } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { Records } from '@cv/components/Records/Records'
import { MapSplunkToServiceFieldNames } from '@cv/pages/health-source/connectors/SplunkHealthSource/components/MapQueriesToHarnessService/constants'
import { useGetSplunkMetricSampleData } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import type { MapQueriesToHarnessServiceLayoutProps } from './SplunkMetricsQueryViewer.types'
import SplunkMetricsQueryViewerChart from './SplunkMetricsQueryViewerChart'
import css from './SplunkMetricsQueryViewer.module.scss'

export default function SplunkMetricsQueryViewer(props: MapQueriesToHarnessServiceLayoutProps): JSX.Element {
  const { formikProps, connectorIdentifier, onChange } = props
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const values = formikProps?.values

  const DrawerProps: IDrawerProps = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    isOpen: false,
    hasBackdrop: true,
    position: Position.RIGHT,
    usePortal: true,
    size: '50%'
  }

  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const queryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      tracingId: Utils.randomId(),
      connectorIdentifier: connectorIdentifier as string
    }),
    [accountId, projectIdentifier, orgIdentifier, connectorIdentifier]
  )

  const { data: splunkData, loading, refetch, error } = useGetSplunkMetricSampleData({ lazy: true })

  const fetchSplunkRecords = useCallback(async () => {
    await refetch({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifier,
        requestGuid: queryParams?.tracingId,
        query
      }
    })
    setIsQueryExecuted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const postFetchingRecords = useCallback(() => {
    // resetting values of service once fetch records button is clicked.
    onChange(MapSplunkToServiceFieldNames.SERVICE_INSTANCE, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    onChange(MapSplunkToServiceFieldNames.IS_STALE_RECORD, false)
  }, [])

  const staleRecordsWarningMessage = useMemo(
    () => (values?.isStaleRecord ? getString('cv.monitoringSources.splunk.staleRecordsWarning') : ''),
    [values?.isStaleRecord]
  )

  const handleFetchRecords = useCallback(() => {
    fetchSplunkRecords()
    if (postFetchingRecords) {
      postFetchingRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  let content = (
    <>
      <Text font={{ variation: FontVariation.SMALL }} tooltipProps={{ dataTooltipId: 'splunkQuery' }}>
        {getString('cv.query')}
      </Text>

      <Container margin={{ bottom: 'medium' }}>
        <QueryContent
          onClickExpand={setIsDialogOpen}
          query={query}
          isDialogOpen={isDialogOpen}
          loading={loading}
          handleFetchRecords={handleFetchRecords}
          textAreaProps={{
            onChangeCapture: () => {
              onChange(MapSplunkToServiceFieldNames.IS_STALE_RECORD, true)
            }
          }}
          textAreaPlaceholder={getString('cv.healthSource.splunkMetric.queryTextareaPlaceholder')}
          staleRecordsWarning={staleRecordsWarningMessage}
        />
      </Container>

      <SplunkMetricsQueryViewerChart data={splunkData?.resource} />

      <Records
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={splunkData?.resource}
        error={error}
        query={query}
        isQueryExecuted={isQueryExecuted}
        queryNotExecutedMessage={getString('cv.monitoringSources.splunk.submitQueryToSeeRecords')}
      />
    </>
  )

  if (isDialogOpen) {
    content = (
      <Drawer {...DrawerProps} isOpen={true} onClose={() => setIsDialogOpen(false)}>
        <Container data-testid="SplunkMetricQuery_drawer" padding="medium">
          {content}
        </Container>
      </Drawer>
    )
  }

  return (
    <div className={css.queryViewContainer}>
      <Container className={css.validationContainer}>{content}</Container>
    </div>
  )
}
