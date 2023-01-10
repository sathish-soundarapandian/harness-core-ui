/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { SecurityStepData, SecurityStepSpec } from './types'
import SecurityField from './SecurityField'
import { logLevelOptions, severityOptions } from './constants'
interface SelectItems extends SelectOption {
  disabled?: boolean
}

type SecurityFieldsProps<T> = {
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  formik: FormikProps<T>
}

interface ISecurityScanFields<T> extends SecurityFieldsProps<T> {
  scanModeSelectItems: SelectItems[]
  scanConfigReadonly?: boolean
}

interface ISecurityTargetFields<T> extends SecurityFieldsProps<T> {
  targetTypeSelectItems: SelectItems[]
}

export function SecurityScanFields<T>(props: ISecurityScanFields<T>) {
  const { allowableTypes, formik, stepViewType, scanModeSelectItems, scanConfigReadonly } = props

  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<T>}
        enableFields={{
          'spec.mode': {
            label: 'sto.stepField.mode',
            fieldType: 'dropdown',
            inputProps: {
              disabled: scanModeSelectItems.length === 1
            },
            selectItems: scanModeSelectItems
          }
        }}
      />

      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<T>}
        enableFields={{
          'spec.config': {
            label: 'sto.stepField.config',
            inputProps: { disabled: scanConfigReadonly }
          }
        }}
      />
    </>
  )
}

export function SecurityTargetFields<T>(props: ISecurityTargetFields<T>) {
  const { allowableTypes, formik, stepViewType, targetTypeSelectItems } = props

  return (
    <>
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik as unknown as FormikProps<T>}
        enableFields={{
          'spec.target.type': {
            label: 'sto.stepField.target.type',
            selectItems: targetTypeSelectItems,
            inputProps: { disabled: targetTypeSelectItems.length === 1 }
          },
          'spec.target.name': {
            label: 'sto.stepField.target.name'
          },
          'spec.target.workspace': {
            label: 'sto.stepField.target.workspace'
          },
          'spec.target.variant': {
            label: 'sto.stepField.target.variant'
          },
          'spec.target.ssl': {
            label: 'sto.stepField.target.ssl',
            fieldType: 'checkbox'
          }
        }}
      />
    </>
  )
}

export function SecurityIngestionFields<T>(props: SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>) {
  const { allowableTypes, formik, stepViewType } = props

  return (
    <SecurityField
      stepViewType={stepViewType}
      allowableTypes={allowableTypes}
      formik={formik as unknown as FormikProps<T>}
      enableFields={{
        'spec.ingestion.file': {
          label: 'sto.stepField.ingestion.file',
          hide: formik.values.spec.mode !== 'ingestion'
        }
      }}
    />
  )
}

export function SecurityAdvancedFields<T>(props: SecurityFieldsProps<SecurityStepData<SecurityStepSpec>>) {
  const { allowableTypes, formik, stepViewType } = props
  const { getString } = useStrings()

  return (
    <SecurityField
      stepViewType={stepViewType}
      allowableTypes={allowableTypes}
      formik={formik as unknown as FormikProps<T>}
      enableFields={{
        'spec.advanced.log.level': {
          optional: true,
          fieldType: 'dropdown',
          label: 'sto.stepField.advanced.logLevel',
          selectItems: logLevelOptions(getString)
        },
        'spec.advanced.args.cli': {
          optional: true,
          label: 'sto.stepField.advanced.cli'
        },
        'spec.advanced.fail_on_severity': {
          optional: true,
          fieldType: 'dropdown',
          label: 'sto.stepField.advanced.failOnSeverity',
          selectItems: severityOptions(getString)
        }
      }}
    />
  )
}
