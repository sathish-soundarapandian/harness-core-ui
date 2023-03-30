/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PillToggleOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import {
  EvaluationType,
  SLITypes,
  SLOV2Form,
  SLOV2FormFields
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import css from './EvaluationType.module.scss'

export const getPillToggleOptions = (getString: UseStringsReturn['getString'], occurenceBased: boolean) => {
  const { WINDOW, REQUEST } = EvaluationType
  const { AVAILABILITY, LATENCY } = SLITypes
  const options: [PillToggleOption<EvaluationType | SLITypes>, PillToggleOption<EvaluationType | SLITypes>] = [
    {
      label: getString(
        occurenceBased ? 'cv.slos.slis.evaluationType.window' : 'cv.slos.slis.type.availability'
      ).toUpperCase(),
      value: occurenceBased ? WINDOW : AVAILABILITY
    },
    {
      label: getString(occurenceBased ? 'common.request' : 'cv.slos.slis.type.latency').toUpperCase(),
      value: occurenceBased ? REQUEST : LATENCY
    }
  ]
  return options
}

export const getPillToggleProps = (values: SLOV2Form, occurenceBased?: boolean) => {
  const onChangeKey = occurenceBased ? SLOV2FormFields.EVALUATION_TYPE : SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE
  const { evaluationType, serviceLevelIndicatorType } = values
  const selectedView = (occurenceBased ? evaluationType : serviceLevelIndicatorType) as EvaluationType | SLITypes
  const styleProp = { className: css.evaluationType }
  return { styleProp, onChangeKey, selectedView }
}
