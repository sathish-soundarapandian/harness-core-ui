/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Container, FormInput, Icon, PageError } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useGetMetricPacks, GetMetricPacksQueryParams, MetricPackDTO, TimeSeriesMetricPackDTO } from 'services/cv'
import CheckboxWithPrompt from '../common/CheckboxWithPrompt/CheckboxWithPrompt'
import { isGivenMetricPackContainsThresholds } from '../common/MetricThresholds/MetricThresholds.utils'
import type { MetricThresholdType, ThresholdsPropertyNames } from '../common/MetricThresholds/MetricThresholds.types'
import css from './MonitoredServiceConnector.module.scss'

export default function MetricPackCustom({
  connector,
  metricDataValue,
  metricPackValue,
  onChange,
  setMetricDataValue,
  setSelectedMetricPacks,
  isMetricThresholdEnabled
}: {
  connector: GetMetricPacksQueryParams['dataSourceType']
  metricPackValue: MetricPackDTO[] | undefined
  metricDataValue: { [key: string]: boolean }
  onChange: (identifier: string, updatedValue: boolean) => void
  setMetricDataValue: (value: { [key: string]: boolean }) => void
  setSelectedMetricPacks: React.Dispatch<React.SetStateAction<TimeSeriesMetricPackDTO[]>>
  isMetricThresholdEnabled?: boolean
}): JSX.Element {
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { setFieldValue, values: formValues } = useFormikContext()

  const {
    data: metricPacks,
    refetch: refetchMetricPacks,
    error: metricPackError,
    loading
  } = useGetMetricPacks({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      dataSourceType: connector
    }
  })

  const handleMetricPackChange = useCallback(
    (updatedValue: boolean, identifier?: string) => {
      if (identifier) {
        setFieldValue(`metricData.${identifier}`, updatedValue)
        onChange(identifier, updatedValue)
      }
    },
    [onChange, setFieldValue]
  )

  const getShowPromptOnUnCheck = (metricPackIdentifier: string): boolean => {
    return Boolean(
      isMetricThresholdEnabled &&
        isGivenMetricPackContainsThresholds(
          formValues as Record<ThresholdsPropertyNames, MetricThresholdType[]>,
          metricPackIdentifier
        )
    )
  }

  useEffect(() => {
    if (metricPacks) {
      const metricData: { [key: string]: boolean } = {}
      const metricList: MetricPackDTO[] = (metricPackValue?.length ? metricPackValue : metricPacks?.resource) || []
      metricList.forEach((i: MetricPackDTO) => (metricData[i.identifier as string] = true))
      if (!isEmpty(metricData)) {
        setMetricDataValue(metricData)
      }
      if (metricPacks?.resource) {
        setSelectedMetricPacks(metricPacks?.resource as TimeSeriesMetricPackDTO[])
      }
    }
  }, [metricPacks])

  return (
    <FormInput.CustomRender
      name={'metricData'}
      render={() => {
        return loading ? (
          <Icon name="steps-spinner" />
        ) : (
          <>
            <Container className={css.metricPack}>
              {metricPacks?.resource?.map(({ identifier }: MetricPackDTO) => {
                if (!identifier) {
                  return null
                }

                return (
                  <CheckboxWithPrompt
                    checkboxName={identifier}
                    checkboxLabel={identifier}
                    checked={metricDataValue[identifier]}
                    key={identifier}
                    checkBoxKey={identifier}
                    contentText={getString('cv.metricThresholds.metricPacksDeletePromptContent')}
                    popupTitleText={getString('common.warning')}
                    onChange={handleMetricPackChange}
                    showPromptOnUnCheck={getShowPromptOnUnCheck(identifier)}
                  />
                )
              })}
            </Container>
            {metricPackError && (
              <PageError message={getErrorMessage(metricPackError)} onClick={() => refetchMetricPacks()} />
            )}
          </>
        )
      }}
    />
  )
}
