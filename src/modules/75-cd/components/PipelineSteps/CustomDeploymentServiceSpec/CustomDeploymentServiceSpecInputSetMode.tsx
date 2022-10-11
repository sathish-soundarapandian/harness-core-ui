/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Layout, AllowedTypes } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { ServiceSpec } from 'services/cd-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { KubernetesArtifacts } from '@cd/components/PipelineSteps/K8sServiceSpec/KubernetesArtifacts/KubernetesArtifacts'
import type { CustomDeploymentServiceStep } from './CustomDeploymentServiceSpecInterface'
import css from './CustomDeploymentServiceSpec.module.scss'

export interface CustomDeploymentInputSetProps {
  initialValues: CustomDeploymentServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  serviceIdentifier?: string
  formik?: any
  allowableTypes: AllowedTypes
}
const CustomDeploymentServiceSpecInputSetModeFormikForm = (
  props: CustomDeploymentInputSetProps
): React.ReactElement => {
  const {
    template,
    path,
    factory,
    allValues,
    initialValues,
    onUpdate,
    readonly = false,
    stageIdentifier,
    serviceIdentifier,
    stepViewType,
    formik,
    allowableTypes
  } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium">
      {!!(template?.artifacts?.primary?.type || template?.artifacts?.sidecars?.length) && (
        <KubernetesArtifacts
          type={template?.artifacts?.primary?.type || ''}
          template={template}
          artifacts={allValues?.artifacts}
          artifactSourceBaseFactory={artifactSourceBaseFactory}
          stepViewType={stepViewType}
          stageIdentifier={stageIdentifier}
          serviceIdentifier={serviceIdentifier}
          formik={formik}
          path={path}
          initialValues={initialValues}
          readonly={readonly}
          allowableTypes={allowableTypes}
        />
      )}

      {!!template?.variables?.length && (
        <div id={`Stage.${stageIdentifier}.Service.Variables`} className={cx(css.nopadLeft, css.accordionSummary)}>
          <div className={css.subheading}>{getString('common.variables')}</div>

          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (initialValues.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              type={StepType.CustomVariable}
              stepViewType={StepViewType.InputSet}
              allowableTypes={allowableTypes}
              onUpdate={({ variables }: CustomVariablesData) => {
                onUpdate?.({
                  variables: variables
                })
              }}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (allValues?.variables || []) as AllNGVariables[] }
              }}
              readonly={readonly}
            />
          </div>
        </div>
      )}
    </Layout.Vertical>
  )
}

export const CustomDeploymentServiceSpecInputSetMode = connect(CustomDeploymentServiceSpecInputSetModeFormikForm)
