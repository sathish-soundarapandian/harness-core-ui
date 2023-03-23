/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IOptionProps } from '@blueprintjs/core'
import type { SelectOption } from '@harness/uicore'
import type { RadioButtonProps } from '@harness/uicore/dist/components/RadioButton/RadioButton'
import type { UseStringsReturn } from 'framework/strings'
import { Comparators, SLIEventTypes, SLIMetricTypes, SLIMissingDataTypes, SLITypes } from './CVCreateSLOV2.types'

export enum SLOType {
  COMPOSITE = 'Composite',
  SIMPLE = 'Simple'
}

export const getSLITypeOptions = (
  getString: UseStringsReturn['getString']
): Pick<RadioButtonProps, 'value' | 'label'>[] => {
  return [
    { label: getString('cv.slos.slis.type.availability'), value: SLITypes.AVAILABILITY },
    { label: getString('cv.slos.slis.type.latency'), value: SLITypes.LATENCY }
  ]
}

// PickMetric

export const getSLIMetricOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.metricOptions.thresholdBased'), value: SLIMetricTypes.THRESHOLD },
    { label: getString('cv.slos.slis.metricOptions.ratioBased'), value: SLIMetricTypes.RATIO }
  ]
}

export const comparatorOptions: SelectOption[] = [
  {
    label: Comparators.LESS,
    value: Comparators.LESS
  },
  {
    label: Comparators.GREATER,
    value: Comparators.GREATER
  },
  {
    label: Comparators.LESS_EQUAL,
    value: Comparators.LESS_EQUAL
  },
  {
    label: Comparators.GREATER_EQUAL,
    value: Comparators.GREATER_EQUAL
  }
]

export const getEventTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.good'), value: SLIEventTypes.GOOD },
    { label: getString('cv.bad'), value: SLIEventTypes.BAD }
  ]
}

export const getMissingDataTypeOptions = (
  getString: UseStringsReturn['getString']
): Pick<RadioButtonProps, 'value' | 'label' | 'disabled' | 'tooltipId'>[] => {
  return [
    { label: getString('cv.good'), value: SLIMissingDataTypes.GOOD },
    { label: getString('cv.bad'), value: SLIMissingDataTypes.BAD },
    { label: getString('cv.ignore'), value: SLIMissingDataTypes.IGNORE }
  ]
}

export const MAX_OBJECTIVE_PERCENTAGE = 100
