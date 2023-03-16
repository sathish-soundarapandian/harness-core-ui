/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { PillToggle, PillToggleOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  EvaluationType,
  SLITypes,
  SLOV2Form,
  SLOV2FormFields
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import css from './EvaluationType.module.scss'

export default function EvaluationTypePillToggle({
  values,
  onChange,
  ffEvaluationType
}: {
  values: SLOV2Form
  onChange: FormikProps<SLOV2Form>['setFieldValue']
  ffEvaluationType?: boolean
}): JSX.Element {
  const { WINDOW, REQUEST } = EvaluationType
  const { AVAILABILITY, LATENCY } = SLITypes
  const { getString } = useStrings()
  const onChangeKey = ffEvaluationType ? SLOV2FormFields.EVALUATION_TYPE : SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE
  const { evaluationType, serviceLevelIndicatorType } = values
  const selectedView = (ffEvaluationType ? evaluationType : serviceLevelIndicatorType) as EvaluationType | SLITypes
  const options: [PillToggleOption<EvaluationType | SLITypes>, PillToggleOption<EvaluationType | SLITypes>] = [
    {
      label: getString(ffEvaluationType ? 'cv.slos.slis.evaluationType.window' : 'cv.slos.slis.type.availability'),
      value: ffEvaluationType ? WINDOW : AVAILABILITY
    },
    {
      label: getString(ffEvaluationType ? 'common.request' : 'cv.slos.slis.type.latency'),
      value: ffEvaluationType ? REQUEST : LATENCY
    }
  ]
  const styleProp = ffEvaluationType ? { className: css.evaluationType } : {}
  return (
    <PillToggle
      {...styleProp}
      onChange={item => onChange(onChangeKey, item)}
      selectedView={selectedView}
      options={options}
    />
  )
}
