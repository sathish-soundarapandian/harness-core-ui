import React from 'react'
import { useFormikContext } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
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

import css from '../PipelineInputSetForm.module.scss'

export interface FailureStrategiesInputSetFormProps {
  readonly?: boolean
  path: string
  stageType: StageType
  viewType?: StepViewType
}

export interface FormikState {
  failureStrategies?: AllFailureStrategyConfig[]
}

export function FailureStrategiesInputSetForm(props: FailureStrategiesInputSetFormProps): React.ReactElement {
  const { readonly, path, stageType, viewType } = props
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
            allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
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
      <FailureStrategyPanel path={path} isReadonly={!!readonly} mode={StepMode.STAGE} stageType={stageType} />
    </div>
  )
}
