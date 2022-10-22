/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { ShellScriptProvisionStepInfo } from 'services/cd-ng'
import type { StepElementConfig } from 'services/pipeline-ng'

export interface ShellScriptProvisionStepVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}

export interface ShellScriptProvisionInline {
  script?: string
}

export interface ShellScriptProvisionFileStore {
  file?: string
}
interface ShellScriptProvisionSource {
  type?: 'Inline' | 'Harness'
  spec?: ShellScriptProvisionInline | ShellScriptProvisionFileStore
}

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

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export interface ShellScriptProvisionData extends StepElementConfig {
  spec: Omit<ShellScriptProvisionStepInfo, 'environmentVariables' | 'source'> & {
    environmentVariables?: Array<Omit<ShellScriptProvisionStepVariable, 'id'>>
    source?: ShellScriptProvisionSource
  }
}

export interface ShellScriptProvisionFormData extends StepElementConfig {
  spec: Omit<ShellScriptProvisionStepInfo, 'environmentVariables' | 'source'> & {
    environmentVariables?: Array<ShellScriptProvisionStepVariable>
    source?: ShellScriptProvisionSource
  }
}
