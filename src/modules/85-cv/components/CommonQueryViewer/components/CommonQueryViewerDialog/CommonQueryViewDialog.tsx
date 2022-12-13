/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Drawer } from '@blueprintjs/core'
import { Button, ButtonVariation, Container, FormInput } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import React from 'react'
import { useStrings } from 'framework/strings'
import { CommonRecords } from '@cv/components/CommonRecords/CommonRecords'
import { CommonHealthSourceFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { CommonQueryViewDialogProps, DrawerProps } from '../../types'
import css from './CommonQueryViewDialog.module.scss'

export function CommonQueryViewDialog(props: CommonQueryViewDialogProps): JSX.Element {
  const { onHide, query, loading, data, error, fetchRecords, isQueryExecuted, isOpen, isQueryRuntimeOrExpression } =
    props
  const { getString } = useStrings()
  return (
    <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHide} className={css.queryViewDialog}>
      <Container className={css.queryContainer}>
        <FormInput.TextArea name={CommonHealthSourceFieldNames.QUERY} className={css.formQueryBox} />
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('cv.monitoringSources.commonHealthSource.runQuery')}
          onClick={fetchRecords}
          disabled={isEmpty(query) || loading}
          className={css.runQueryButton}
        />
        <CommonRecords
          fetchRecords={fetchRecords}
          loading={loading}
          data={data}
          error={error}
          query={query}
          isQueryExecuted={isQueryRuntimeOrExpression ? !isQueryRuntimeOrExpression : isQueryExecuted}
        />
      </Container>
    </Drawer>
  )
}
