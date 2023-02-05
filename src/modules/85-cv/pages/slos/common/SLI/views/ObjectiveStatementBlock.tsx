/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { comparatorOptions } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import type { PickMetricProps } from './PickMetric'
import css from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.module.scss'

interface ObjectiveStatementBlockProps extends Partial<PickMetricProps> {
  isRatioBasedMetric?: boolean
  validRequestMetric?: string
  goodRequestMetric?: string
}

export const ObjectiveStatementBlock = ({
  isRatioBasedMetric,
  validRequestMetric,
  goodRequestMetric,
  formikProps
}: ObjectiveStatementBlockProps): JSX.Element => {
  const FLEX_START = 'flex-start'
  const { getString } = useStrings()
  const disabled = isRatioBasedMetric ? !validRequestMetric || !goodRequestMetric : !validRequestMetric
  const OrderOfObjectiveValue = !isRatioBasedMetric ? (
    <>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {getString('cv.ThresholdValidrequests')}
      </Text>
      <FormInput.Text
        name={SLOV2FormFields.OBJECTIVE_VALUE}
        inputGroup={{
          type: 'number',
          min: 0,
          step: 'any'
        }}
        className={css.objectiveValue}
        disabled={disabled}
      />
    </>
  ) : (
    <>
      <FormInput.Text
        name={SLOV2FormFields.OBJECTIVE_VALUE}
        placeholder={'1 to 99'}
        inputGroup={{
          type: 'number',
          min: 0,
          max: 100,
          step: 'any'
        }}
        className={css.objectiveValue}
        disabled={disabled}
      />
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {getString('cv.percentageValidrequests')}
      </Text>
    </>
  )
  return (
    <Layout.Horizontal flex={{ justifyContent: FLEX_START, alignItems: 'baseline' }} spacing="small">
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {isRatioBasedMetric ? getString('cv.SLIValueIsGoodIf') : getString('cv.ThresholdSLIValueGoodIf')}
      </Text>
      <FormInput.Select
        name={SLOV2FormFields.OBJECTIVE_COMPARATOR}
        items={comparatorOptions}
        onChange={option => {
          formikProps?.setFieldValue(SLOV2FormFields.OBJECTIVE_COMPARATOR, option.value)
        }}
        className={css.comparatorOptions}
        disabled={disabled}
      />
      {OrderOfObjectiveValue}
    </Layout.Horizontal>
  )
}
