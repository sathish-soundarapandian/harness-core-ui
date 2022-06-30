/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { connect } from 'formik'

import { CustomVariableInputSet } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'

import type { DeployInfrastructureProps } from './utils'

import css from './DeployInfrastructureStep.module.scss'

function DeployInfrastructureInputStepInternal({
  inputSetData,
  initialValues,
  allowableTypes
}: DeployInfrastructureProps & { formik?: any }) {
  return (
    <>
      {inputSetData?.template?.environment?.environmentInputs?.variables &&
        inputSetData?.path?.includes('environment.environmentInputs') && (
          <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
            <CustomVariableInputSet
              allowableTypes={allowableTypes}
              // TODO: Change after type is created
              initialValues={initialValues.environment?.environmentInputs as any}
              template={inputSetData.template.environment.environmentInputs as any}
              path={inputSetData.path}
              className={css.fullWidth}
            />
          </Layout.Horizontal>
        )}

      {inputSetData?.template?.environment?.serviceOverrideInputs?.variables &&
        inputSetData?.path?.includes('environment.serviceOverrideInputs') && (
          <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
            <CustomVariableInputSet
              allowableTypes={allowableTypes}
              // TODO: Change after type is created
              initialValues={initialValues.environment?.serviceOverrideInputs as any}
              template={inputSetData.template.environment.serviceOverrideInputs as any}
              path={inputSetData.path}
              className={css.fullWidth}
            />
          </Layout.Horizontal>
        )}
    </>
  )
}
const DeployInfrastructureInputStep = connect(DeployInfrastructureInputStepInternal)

export default DeployInfrastructureInputStep
