/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { ShellScriptFormData, variableSchema } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import BaseScript from '@cd/components/BaseScript/BaseScript'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1203634286/Shell+Script
 */

interface ShellScriptWidgetProps {
  initialValues: ShellScriptFormData
  updateTemplate?: (data: ShellScriptFormData) => void
  onChange?: (data: ShellScriptFormData) => void
  allowableTypes: MultiTypeInputType[]
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function BaseScriptForm(
  { initialValues, updateTemplate, onChange }: ShellScriptWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const defaultSSHSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      shell: Yup.string().trim().required(getString('validation.scriptTypeRequired')),
      source: Yup.object().shape({
        spec: Yup.object().shape({
          script: Yup.string().trim().required(getString('common.scriptRequired'))
        })
      }),
      environmentVariables: variableSchema(getString),
      outputVariables: variableSchema(getString)
    })
  })

  const values: any = {
    ...initialValues,
    spec: {
      ...initialValues.spec,

      executionTarget: {
        ...initialValues.spec.executionTarget,
        connectorRef: undefined
      }
    }
  }

  const validationSchema = defaultSSHSchema

  return (
    <Formik<ShellScriptFormData>
      onSubmit={submit => {
        updateTemplate?.(submit)
      }}
      //   onSubmit={noop}
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="shellScriptForm"
      initialValues={values}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptFormData>) => {
        setFormikRef(formikRef, formik)
        if (formik.dirty) {
          updateTemplate?.(formik.values)
        }

        return <BaseScript formik={formik} readonly={false} allowableTypes={[]} />
      }}
    </Formik>
  )
}

export const BaseScriptWithRef = React.forwardRef(BaseScriptForm)
