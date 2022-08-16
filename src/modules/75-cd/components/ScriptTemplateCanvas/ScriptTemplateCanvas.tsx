/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { defaultTo, isEqual } from 'lodash-es'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { ScriptTemplateFormWithRef } from './ScriptTemplateForm/ScriptTemplateForm'
import type { ShellScriptFormData } from '../PipelineSteps/ShellScriptStep/shellScriptTypes'

const ScriptTemplateCanvas = (_props: unknown, formikRef: TemplateFormRef) => {
  const { state, updateTemplate } = React.useContext(TemplateContext)

  const scriptRef = useRef<any | null>(null)
  /* istanbul ignore next */ React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      return scriptRef?.current?.resetForm()
    },
    submitForm() {
      return scriptRef?.current?.submitForm() || Promise.resolve()
    },
    getErrors() {
      return defaultTo(scriptRef?.current?.getErrors?.(), {})
    }
  }))
  const onUpdate = (formikValue: ShellScriptFormData) => {
    if (!isEqual(state.template.spec, formikValue.spec)) {
      updateTemplate({
        ...state.template,
        spec: {
          ...formikValue.spec,
          onDelegate: formikValue.spec.onDelegate !== 'targethost',
          source: {
            ...formikValue.spec.source,

            spec: {
              ...formikValue.spec.source?.spec,
              type: 'Inline',
              script: formikValue.spec.source?.spec?.script
            }
          },

          executionTarget: {
            ...formikValue.spec.executionTarget,
            connectorRef:
              (formikValue.spec.executionTarget?.connectorRef?.value as string) ||
              formikValue.spec.executionTarget?.connectorRef?.toString()
          },

          environmentVariables: Array.isArray(formikValue.spec.environmentVariables)
            ? formikValue.spec.environmentVariables
                .filter(variable => variable.value)
                .map(({ id, ...variable }) => variable)
            : undefined,

          outputVariables: Array.isArray(formikValue.spec.outputVariables)
            ? formikValue.spec.outputVariables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
            : undefined
        }
      })
    }
  }

  return <ScriptTemplateFormWithRef template={state.template} ref={scriptRef} updateTemplate={onUpdate} />
}

export const ScriptTemplateCanvasWithRef = React.forwardRef(ScriptTemplateCanvas)
