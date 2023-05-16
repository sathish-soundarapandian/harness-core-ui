import React from 'react'
import type {
  AllowedTypes,
  AllowedTypesWithRunTime} from '@harness/uicore';
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { get, isEmpty, set, unset } from 'lodash-es'
import produce from 'immer'
import { useFormikContext } from 'formik'

import { useStrings } from 'framework/strings'
import { getDefaultMonacoConfig } from '@common/components/MonacoTextField/MonacoTextField'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isRuntimeInput } from '@pipeline/utils/CIUtils'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { StrategyConfig } from 'services/pipeline-ng'
import { LoopingStrategyPanel } from '@pipeline/components/PipelineStudio/LoopingStrategy/LoopingStrategyPanel'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'

import css from '../PipelineInputSetForm.module.scss'

export interface LoopingStrategyInputSetFormProps {
  readonly?: boolean
  path: string
  stageType: StageType
  viewType?: StepViewType
  allowableTypes?: AllowedTypes
  template?: StrategyConfig | string
  step?: StepOrStepGroupOrTemplateStepData
}

export function LoopingStrategyInputSetForm(props: LoopingStrategyInputSetFormProps): React.ReactElement {
  const { readonly, path, viewType, allowableTypes, template, step } = props
  const { getString } = useStrings()
  const formik = useFormikContext()

  const formikValue = yamlStringify(get(formik.values, path, ''))
  const onUpdateStrategy = (strategy: StrategyConfig): void => {
    formik.setValues(
      produce(formik.values, (draft: any) => {
        if (isEmpty(strategy)) {
          unset(draft, path)
        } else {
          set(draft, path, strategy)
        }
      })
    )
  }

  function preventSubmit(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.stopPropagation()
    }
  }

  return (
    <div className={css.strategyContainer} onKeyDown={preventSubmit}>
      <div className={css.titleWrapper}>
        <span className={css.strategyTitle}>{getString('pipeline.loopingStrategy.title')}</span>
        {viewType === StepViewType.TemplateUsage ? (
          <MultiTypeSelectorButton
            type={getMultiTypeFromValue(formikValue as any)}
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
      {isRuntimeInput(template) ? (
        <LoopingStrategyPanel path={path} isReadonly={readonly} onUpdateStrategy={onUpdateStrategy} step={step} />
      ) : (
        <RuntimeStrategy {...props} />
      )}
    </div>
  )
}

export function RuntimeStrategy(props: LoopingStrategyInputSetFormProps): React.ReactElement {
  const { readonly, path } = props
  const formik = useFormikContext()
  const isChanged = React.useRef(false)

  const formikValue = yamlStringify(get(formik.values, path, ''))
  const [value, setValue] = React.useState(formikValue)

  React.useEffect(() => {
    // do not update values from formik once user has changed the input
    if (!isChanged.current) {
      setValue(formikValue)
    }
  }, [formikValue])

  function handleChange(newValue: string): void {
    try {
      isChanged.current = true
      setValue(newValue)
      const parsed = yamlParse(newValue)
      formik.setValues(
        produce(formik.values, (draft: any) => {
          set(draft, path, parsed)
        })
      )
    } catch (e) {
      // empty block
    }
  }

  return (
    <div className={css.editor}>
      <MonacoEditor
        height={300}
        options={getDefaultMonacoConfig(!!readonly)}
        language="yaml"
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
