import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Container, FormInput, Layout, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CVMultiTypeQuery from '@cv/components/CVMultiTypeQuery/CVMultiTypeQuery'
import { useStrings } from 'framework/strings'
import type { QueryContentProps } from '../../types'
import css from '../../CommonQueryViewer.module.scss'

export function CommonQueryContent(props: QueryContentProps): JSX.Element {
  const {
    handleFetchRecords,
    query,
    loading,
    onClickExpand,
    isDialogOpen,
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression,
    isQueryButtonDisabled,
    runQueryBtnTooltip
  } = props
  const { getString } = useStrings()

  return (
    <Container className={css.queryContainer}>
      {isTemplate ? (
        <>
          <CVMultiTypeQuery
            name={CustomMetricFormFieldNames.QUERY}
            expressions={defaultTo(expressions, [])}
            fetchRecords={handleFetchRecords}
            disableFetchButton={isEmpty(query) || isConnectorRuntimeOrExpression || loading}
            allowedTypes={
              isConnectorRuntimeOrExpression
                ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
                : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            }
            runQueryBtnTooltip={runQueryBtnTooltip}
          />
        </>
      ) : (
        <>
          <Layout.Horizontal className={css.queryIcons} spacing="small">
            {onClickExpand && !isDialogOpen && (
              <Button
                icon="fullscreen"
                iconProps={{ size: 12 }}
                className={css.action}
                onClick={() => onClickExpand?.(true)}
              />
            )}
          </Layout.Horizontal>
          <FormInput.TextArea
            name={CustomMetricFormFieldNames.QUERY}
            className={cx(css.formQueryBox)}
            placeholder={getString('cv.monitoringSources.commonHealthSource.submitQueryToSeeRecords')}
          />
          <Layout.Horizontal spacing={'large'}>
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('cv.monitoringSources.commonHealthSource.runQuery')}
              onClick={handleFetchRecords}
              disabled={isQueryButtonDisabled}
              tooltip={runQueryBtnTooltip}
            />
          </Layout.Horizontal>
        </>
      )}
    </Container>
  )
}
