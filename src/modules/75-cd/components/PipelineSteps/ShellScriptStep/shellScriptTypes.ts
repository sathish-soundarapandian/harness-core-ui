/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import type { ShellScriptStepInfo, StepElementConfig } from 'services/pipeline-ng'

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export const variableSchema = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<
  | {
      name: string
      value: string
      type: string
    }
  | undefined
> =>
  Yup.array().of(
    Yup.object({
      name: Yup.string().required(getString('common.validation.nameIsRequired')),
      value: Yup.string().required(getString('common.validation.valueIsRequired')),
      type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
    })
  )

export const scriptOutputType: SelectOption[] = [{ label: 'String', value: 'String' }]

export interface ShellScriptStepVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}
export interface ShellScriptOutputStepVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String'
}
interface ShellScriptSource {
  type?: string
  spec?: ShellScriptInline
}
export interface ShellScriptInline {
  script?: string
}
export interface ShellScriptData extends StepElementConfig {
  spec: Omit<ShellScriptStepInfo, 'environmentVariables' | 'outputVariables' | 'source'> & {
    environmentVariables?: Array<Omit<ShellScriptStepVariable, 'id'>>
    outputVariables?: Array<Omit<ShellScriptOutputStepVariable, 'id'>>
    source?: ShellScriptSource
  }
}

export interface ShellScriptFormData extends StepElementConfig {
  spec: Omit<ShellScriptStepInfo, 'environmentVariables' | 'outputVariables' | 'source'> & {
    environmentVariables?: Array<ShellScriptStepVariable>
    outputVariables?: Array<ShellScriptOutputStepVariable>
    source?: ShellScriptSource
  }
}
