/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { SelectOption } from '@harness/uicore'
import type { RadioButtonProps } from '@harness/uicore/dist/components/RadioButton/RadioButton'
import type { UseStringsReturn } from 'framework/strings'
import type {
  CopyCommandUnitSpec,
  ScriptCommandUnitSpec,
  ShellScriptInlineSource,
  ShellScriptSourceWrapper,
  CommandUnitWrapper,
  StepElementConfig,
  StepSpecType,
  HarnessFileStoreSource,
  DownloadArtifactCommandUnitSpec
} from 'services/cd-ng'

// Copy Command Unit type
export interface CopyCommandUnit extends CommandUnitWrapper {
  spec: CopyCommandUnitSpec
}

export interface DownloadArtifactCommandUnit extends CommandUnitWrapper {
  spec: DownloadArtifactCommandUnitSpec
}

// Script Command Unit
interface CustomShellScriptSourceWrapper extends ShellScriptSourceWrapper {
  spec: ShellScriptInlineSource & HarnessFileStoreSource
}
export interface CustomScriptCommandUnitSpec extends ScriptCommandUnitSpec {
  source: CustomShellScriptSourceWrapper
}
export interface CustomScriptCommandUnit extends CommandUnitWrapper {
  spec: CustomScriptCommandUnitSpec
}

// Overall Command Unit Type
export type CommandUnitType = CopyCommandUnit | DownloadArtifactCommandUnit | CustomScriptCommandUnit

export interface CommandScriptStepVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}

export interface CommandScriptsData extends StepElementConfig {
  spec: StepSpecType & {
    commandUnits?: CommandUnitType[]
    delegateSelectors?: string[]
    environmentVariables?: Array<Omit<CommandScriptStepVariable, 'id'>>
    outputVariables?: Array<Omit<CommandScriptStepVariable, 'id'>>
    metadata?: string
    onDelegate: boolean
  }
}

export interface CommandScriptsFormData extends StepElementConfig {
  spec: StepSpecType & {
    commandUnits?: CommandUnitType[]
    delegateSelectors?: string[]
    environmentVariables?: Array<CommandScriptStepVariable>
    outputVariables?: Array<CommandScriptStepVariable>
    metadata?: string
    onDelegate: boolean
  }
}

export enum LocationType {
  HARNESS = 'Harness',
  INLINE = 'Inline'
}

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export enum CommandType {
  Copy = 'Copy',
  Script = 'Script',
  DownloadArtifact = 'DownloadArtifact'
}

export const commandTypeOptions: SelectOption[] = [
  { label: 'Copy', value: 'Copy' },
  { label: 'Script', value: 'Script' },
  { label: 'Download Artifact', value: 'DownloadArtifact' }
]

export const sourceTypeOptions: RadioButtonProps[] = [
  { label: 'Artifact', value: 'Artifact' },
  { label: 'Config', value: 'Config' }
]

export const scriptTypeOptions: SelectOption[] = [
  { label: 'Bash', value: 'Bash' },
  { label: 'PowerShell', value: 'PowerShell' }
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

export const commandUnitSchema = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<unknown | undefined> =>
  Yup.array().of(
    Yup.object({
      type: Yup.string(),
      spec: Yup.object().when('type', {
        is: val => val === 'Script',
        then: Yup.object({
          source: Yup.object({
            spec: Yup.object({
              script: Yup.string().required(
                getString?.('common.validation.fieldIsRequired', { name: getString('common.script') })
              )
            })
          })
        }),
        otherwise: Yup.object({
          destinationPath: Yup.string().required(
            getString?.('common.validation.fieldIsRequired', {
              name: getString('cd.steps.commands.destinationPath')
            })
          )
        })
      })
    })
  )
