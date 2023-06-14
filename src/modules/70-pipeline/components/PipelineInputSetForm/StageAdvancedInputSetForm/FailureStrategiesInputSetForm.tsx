/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import {
  AllowedTypes,
  AllowedTypesWithRunTime,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { get, set, unset } from 'lodash-es'
import produce from 'immer'

import FailureStrategyPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/FailureStrategyPanel'
import type { AllFailureStrategyConfig } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/utils'
import { StepMode } from '@pipeline/utils/stepUtils'
import { useStrings } from 'framework/strings'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { FailureStrategyConfig } from 'services/pipeline-ng'

import css from '../PipelineInputSetForm.module.scss'

export interface FailureStrategiesInputSetFormProps {
  readonly?: boolean
  path: string
  stageType: StageType
  viewType?: StepViewType
  allowableTypes?: AllowedTypes
  template?: FailureStrategyConfig[] | string
  mode?: StepMode
}

export interface FormikState {
  failureStrategies?: AllFailureStrategyConfig[]
}

export function FailureStrategiesInputSetForm(props: FailureStrategiesInputSetFormProps): React.ReactElement {
  const {
    readonly,
    path,
    stageType,
    viewType,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    mode = StepMode.STAGE
  } = props
  const formik = useFormikContext()
  const { getString } = useStrings()

  const failureStrategies = get(formik.values, path) as AllFailureStrategyConfig[] | undefined

  return (
    <div>
      <div className={css.titleWrapper}>
        <span className={css.failureStrategiesTitle}>{getString('pipeline.failureStrategies.title')}</span>
        {viewType === StepViewType.TemplateUsage ? (
          <MultiTypeSelectorButton
            type={getMultiTypeFromValue(failureStrategies as any)}
            allowedTypes={(allowableTypes as AllowedTypesWithRunTime[]).filter(
              type => type !== MultiTypeInputType.EXPRESSION
            )}
            disabled={readonly}
            onChange={type => {
              formik.setValues(
                produce(formik.values, (draft: any) => {
                  if (isMultiTypeRuntime(type)) {
                    set(draft, path, RUNTIME_INPUT_VALUE)
                  } else {
                    unset(draft, path)
                  }
                })
              )
            }}
          />
        ) : null}
      </div>
      <FailureStrategyPanel path={path} isReadonly={!!readonly} mode={mode} stageType={stageType} />
    </div>
  )
}
