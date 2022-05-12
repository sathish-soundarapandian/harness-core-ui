/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { debounce } from 'lodash-es'
import type { StageElementWrapperConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import FailureStrategyPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/FailureStrategyPanel'
import type { AllFailureStrategyConfig } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/utils'
import { getFailureStrategiesValidationSchema } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/validation'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { StageType } from '@pipeline/utils/stageHelpers'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import type { StepCommandsRef } from '../StepCommands/StepCommands'

export interface FailureStrategyProps {
  selectedStage?: StageElementWrapperConfig
  isReadonly: boolean
  onUpdate(data: { failureStrategies: AllFailureStrategyConfig[] }): void
  tabName?: string
}

export function FailureStrategy(props: FailureStrategyProps, ref: StepCommandsRef): React.ReactElement {
  const { getString } = useStrings()
  const { selectedStage, onUpdate, isReadonly, tabName } = props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(debounce(onUpdate, 300), [onUpdate])
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  React.useEffect(() => {
    !!tabName && subscribeForm({ tab: tabName, form: formikRef })
    return () => {
      !!tabName && unSubscribeForm({ tab: tabName, form: formikRef })
    }
  }, [subscribeForm, unSubscribeForm, tabName])

  React.useImperativeHandle(ref, () => ({
    setFieldError(key: string, error: string) {
      if (formikRef.current) {
        formikRef.current.setFieldError(key, error)
      }
    },
    isDirty() {
      if (formikRef.current) {
        return formikRef.current.dirty
      }
    },
    submitForm() {
      if (formikRef.current) {
        return formikRef.current.submitForm()
      }
      return Promise.resolve()
    },
    getErrors() {
      if (formikRef.current) {
        return formikRef.current.errors
      }

      return {}
    },
    getValues() {
      if (formikRef.current) {
        return formikRef.current.values
      }

      return {}
    },
    resetForm() {
      if (formikRef.current) {
        return formikRef.current.resetForm()
      }

      return {}
    }
  }))

  const stageType = selectedStage?.stage?.type as StageType

  return (
    <Formik
      initialValues={{
        failureStrategies: selectedStage?.stage?.failureStrategies as AllFailureStrategyConfig[]
      }}
      validationSchema={Yup.object().shape({
        failureStrategies: getFailureStrategiesValidationSchema(getString)
      })}
      onSubmit={onUpdate}
      validate={debouncedUpdate}
    >
      {formik => {
        !!tabName && window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: tabName }))
        formikRef.current = formik as FormikProps<unknown> | null
        return (
          <FailureStrategyPanel
            isReadonly={isReadonly}
            mode={Modes.STAGE}
            stageType={stageType}
            formikProps={formik as FormikProps<{ failureStrategies?: AllFailureStrategyConfig[] }>}
          />
        )
      }}
    </Formik>
  )
}

export const FailureStrategyWithRef = React.forwardRef(FailureStrategy)
