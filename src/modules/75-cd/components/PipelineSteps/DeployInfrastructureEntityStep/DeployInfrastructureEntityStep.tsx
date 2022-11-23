/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { noop } from 'lodash-es'

import type { IconName } from '@harness/uicore'

import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import DeployInfrastructureEntityInputStep from './DeployInfrastructureEntityInputStep'
import type { DeployInfrastructureEntityCustomInputStepProps, DeployInfrastructureEntityStepProps } from './types'

export class DeployInfrastructureEntityStep extends Step<DeployInfrastructureEntityStepProps> {
  protected type = StepType.DeployInfrastructureEntity
  protected stepPaletteVisible = false
  protected stepName = 'Deploy Infrastructure Entity'
  protected stepIcon: IconName = 'infrastructure'

  protected defaultValues: DeployInfrastructureEntityStepProps = {
    environmentRef: ''
  }

  constructor() {
    super()
  }

  renderStep(props: StepProps<DeployInfrastructureEntityStepProps>): JSX.Element {
    const {
      initialValues,
      readonly = false,
      allowableTypes,
      inputSetData,
      stepViewType,
      customStepProps,
      onUpdate
    } = props

    if (isTemplatizedView(stepViewType)) {
      return (
        <Formik initialValues={initialValues} validate={onUpdate} onSubmit={noop}>
          {/** Wrapping this component in formik to prevent the pseudo fields from corrupting the main input set formik.
           * The onUpdate call takes care of picking only the required data and naturally eliminate the pseudo fields.
           * The pseudo fields are present within the component - DeployInfrastructureEntityInputStep */}
          <DeployInfrastructureEntityInputStep
            initialValues={initialValues}
            readonly={readonly}
            inputSetData={inputSetData}
            allowableTypes={allowableTypes}
            stepViewType={stepViewType}
            {...(customStepProps as Required<DeployInfrastructureEntityCustomInputStepProps>)}
          />
        </Formik>
      )
    }

    return <React.Fragment />
  }

  validateInputSet(): any {
    return
  }
}
