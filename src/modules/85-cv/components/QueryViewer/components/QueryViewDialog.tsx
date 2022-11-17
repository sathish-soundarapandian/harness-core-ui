/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Drawer } from '@blueprintjs/core'
import { Button, Container, FormInput } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import React from 'react'
import { useStrings } from 'framework/strings'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/constants'
import { Records } from '../../Records/Records'
import { QueryViewDialogProps, DrawerProps } from '../types'
import css from './QueryViewDialog.module.scss'

export function QueryViewDialog(props: QueryViewDialogProps): JSX.Element {
  const { onHide, query, loading, data, error, fetchRecords, isQueryExecuted, isOpen } = props
  const { getString } = useStrings()
  return (
    <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHide} className={css.queryViewDialog}>
      <Container className={css.queryContainer}>
        <FormInput.TextArea name={MapGCPLogsToServiceFieldNames.QUERY} className={css.formQueryBox} />
        <Button
          intent="primary"
          text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
          onClick={fetchRecords}
          disabled={isEmpty(query) || loading}
        />
        <Records
          loading={loading}
          data={data}
          error={error}
          fetchRecords={fetchRecords}
          isQueryExecuted={isQueryExecuted}
          query={query}
        />
      </Container>
    </Drawer>
  )
}
