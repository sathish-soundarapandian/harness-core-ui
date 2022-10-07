/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { debounce, isEqual, set } from 'lodash-es'
import { sanitize } from '@common/utils/JSONUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { ScriptTemplateFormWithRef } from './ScriptTemplateForm/ScriptTemplateForm'
import type { ShellScriptFormData } from '../PipelineSteps/ShellScriptStep/shellScriptTypes'

function getProcessedTemplate(formikValue: ShellScriptFormData) {
  return {
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

    executionTarget:
      formikValue.spec.onDelegate === 'targethost'
        ? {
            ...formikValue.spec.executionTarget,
            connectorRef:
              (formikValue.spec.executionTarget?.connectorRef?.value as string) ||
              formikValue.spec.executionTarget?.connectorRef?.toString()
          }
        : {},

    environmentVariables: Array.isArray(formikValue.spec.environmentVariables)
      ? formikValue.spec.environmentVariables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
      : undefined
  }
}

const ScriptTemplateCanvas = (_props: unknown, formikRef: TemplateFormRef) => {
  const {
    state: { template },
    updateTemplate
  } = React.useContext(TemplateContext)

  const onSubmitStep = async (formikValue: ShellScriptFormData): Promise<void> => {
    const processNode = getProcessedTemplate(formikValue)
    sanitize(processNode, {
      removeEmptyArray: false,
      removeEmptyObject: false,
      removeEmptyString: false
    })
    if (!isEqual(template.spec, processNode)) {
      set(template, 'spec', processNode)
      updateTemplate(template)
    }
  }
  const debounceSubmit = debounce((formikValue: ShellScriptFormData): void => {
    onSubmitStep(formikValue)
  }, 500)

  return (
    <ScriptTemplateFormWithRef
      template={template}
      ref={formikRef}
      updateTemplate={debounceSubmit}
      onChange={debounceSubmit}
    />
  )
}

export const ScriptTemplateCanvasWithRef = React.forwardRef(ScriptTemplateCanvas)
