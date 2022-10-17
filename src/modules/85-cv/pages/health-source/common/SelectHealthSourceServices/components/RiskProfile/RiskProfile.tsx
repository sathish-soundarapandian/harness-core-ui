/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { Classes } from '@blueprintjs/core'
import { Container, FormInput, Label, MultiTypeInputType, SelectOption, Text } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { useGetMetricPacks, useGetLabelNames, useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { getRiskCategoryOptions, getRiskCategoryOptionsV2 } from './RiskProfile.utils'
import { FieldNames } from './RiskProfile.constant'
import type { SelectHealthSourceServicesProps } from '../../SelectHealthSourceServices.types'
import css from './RiskProfile.module.scss'

interface RiskProfileProps {
  metricPackResponse?: ReturnType<typeof useGetMetricPacks>
  riskProfileResponse?: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
  labelNamesResponse?: ReturnType<typeof useGetLabelNames>
  continuousVerificationEnabled?: boolean
  serviceInstance?: string
  riskCategory?: string
  isTemplate?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
  fieldNames?: SelectHealthSourceServicesProps['fieldNames']
}

export function RiskProfile(props: RiskProfileProps): JSX.Element {
  const {
    metricPackResponse,
    labelNamesResponse,
    continuousVerificationEnabled,
    serviceInstance,
    riskCategory,
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression,
    fieldNames = {},
    riskProfileResponse
  } = props
  const { error, loading, data } = metricPackResponse || {}
  const { error: riskProfileError, loading: riskProfileLoading, data: riskProfileData } = riskProfileResponse || {}

  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const riskCategoryItems = useMemo(() => {
    if (data) {
      return getRiskCategoryOptions(data?.resource)
    } else if (riskProfileData) {
      return getRiskCategoryOptionsV2(riskProfileData?.resource)
    }

    return []
  }, [data, riskProfileData])

  const { riskProfileCategory, higherBaselineDeviation, lowerBaselineDeviation } = fieldNames

  const riskProfileCategeoryName = riskProfileCategory ?? FieldNames.RISK_CATEGORY
  const higherBaselineName = higherBaselineDeviation ?? FieldNames.HIGHER_BASELINE_DEVIATION
  const lowerBaselineName = lowerBaselineDeviation ?? FieldNames.LOWER_BASELINE_DEVIATION

  useEffect(() => {
    if (error || riskProfileError) {
      clear()
      showError(getErrorMessage(error || riskProfileError), 7000)
    }
  })

  const transformedLabelNames: SelectOption[] = useMemo(
    () => labelNamesResponse?.data?.data?.map(label => ({ label, value: label })) || [],
    [labelNamesResponse]
  )

  let metricPackContent: React.ReactNode = <Container />
  if (loading || riskProfileLoading) {
    metricPackContent = (
      <Container data-testid="metricPackOptions-loading">
        <Text tooltipProps={{ dataTooltipId: 'riskProfileBaselineDeviation' }} className={css.groupLabel}>
          {getString('cv.monitoringSources.baselineDeviation')}
        </Text>
        {[1, 2, 3, 4].map(val => (
          <Container
            key={val}
            width={150}
            height={15}
            style={{ marginBottom: 'var(--spacing-small)' }}
            className={Classes.SKELETON}
          />
        ))}
      </Container>
    )
  } else if (riskCategoryItems?.length) {
    metricPackContent = (
      <FormInput.RadioGroup
        label={getString('cv.monitoringSources.riskCategoryLabel')}
        name={riskProfileCategeoryName}
        items={riskCategoryItems}
        key={riskCategory}
      />
    )
  }

  return (
    <Container className={css.main}>
      {metricPackContent}

      <Container className={css.checkBoxGroup}>
        <Text className={css.groupLabel}>{getString('cv.monitoringSources.baselineDeviation')}</Text>
        <FormInput.CheckBox label={getString('cv.monitoringSources.higherCounts')} name={higherBaselineName} />
        <FormInput.CheckBox label={getString('cv.monitoringSources.lowerCounts')} name={lowerBaselineName} />
      </Container>

      {continuousVerificationEnabled ? (
        isTemplate ? (
          <>
            <Label>
              <ServiceInstanceLabel />
            </Label>
            <FormInput.MultiTypeInput
              label=""
              name={FieldNames.SERVICE_INSTANCE}
              selectItems={transformedLabelNames}
              multiTypeInputProps={{
                expressions,
                allowableTypes: isConnectorRuntimeOrExpression
                  ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                  : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
                value: serviceInstance ? { label: serviceInstance, value: serviceInstance } : undefined
              }}
            />
          </>
        ) : (
          <FormInput.Select
            name={FieldNames.SERVICE_INSTANCE}
            label={<ServiceInstanceLabel />}
            items={transformedLabelNames}
            value={serviceInstance ? { label: serviceInstance, value: serviceInstance } : undefined}
          />
        )
      ) : null}
    </Container>
  )
}
