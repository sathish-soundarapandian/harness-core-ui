/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Layout, AllowedTypes } from '@harness/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { ServiceSpec } from 'services/cd-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AllNGVariables } from '@pipeline/utils/types'
import { ConfigFiles } from '@cd/components/PipelineSteps/SshServiceSpec/SshConfigFiles/ConfigFiles'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import manifestSourceBaseFactory from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import configFileSourceBaseFactory from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBaseFactory'
import { KubernetesArtifacts } from '@cd/components/PipelineSteps/K8sServiceSpec/KubernetesArtifacts/KubernetesArtifacts'
import { KubernetesManifests } from '@cd/components/PipelineSteps/K8sServiceSpec/KubernetesManifests/KubernetesManifests'
import type { SshWinRmDirectServiceStep } from './SshServiceSpecInterface'
import PrimaryArtifactRef from '../K8sServiceSpec/PrimaryArtifact/PrimaryArtifactRef'
import css from './SshServiceSpec.module.scss'

export interface SshInputSetProps {
  initialValues: SshWinRmDirectServiceStep
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
const SshServiceSpecInputSetModeFormikForm = (props: SshInputSetProps): React.ReactElement => {
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
  const commonProps = {
    stepViewType,
    formik,
    path,
    initialValues,
    readonly,
    allowableTypes,
    serviceIdentifier
  }

  return (
    <Layout.Vertical spacing="medium">
      {!!template?.artifacts?.primary?.primaryArtifactRef && (
        <PrimaryArtifactRef primaryArtifact={allValues?.artifacts?.primary} template={template} {...commonProps} />
      )}

      {!!(
        template?.artifacts?.primary?.type ||
        (Array.isArray(template?.artifacts?.primary?.sources) && template?.artifacts?.primary?.sources?.length) ||
        template?.artifacts?.sidecars?.length
      ) && (
        <KubernetesArtifacts
          type={template?.artifacts?.primary?.type || ''}
          template={template}
          artifacts={allValues?.artifacts}
          artifactSourceBaseFactory={artifactSourceBaseFactory}
          stageIdentifier={stageIdentifier}
          {...commonProps}
        />
      )}

      {!!template?.manifests?.length && (
        <KubernetesManifests
          template={template}
          manifests={allValues?.manifests}
          manifestSourceBaseFactory={manifestSourceBaseFactory}
          stageIdentifier={stageIdentifier}
          {...commonProps}
        />
      )}

      {!!template?.configFiles?.length && (
        <>
          <ConfigFiles
            template={template}
            configFiles={allValues?.configFiles}
            configFileSourceBaseFactory={configFileSourceBaseFactory}
            stageIdentifier={stageIdentifier}
            {...commonProps}
          />
        </>
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
                  variables: variables as any
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

export const SshServiceSpecInputSetMode = connect(SshServiceSpecInputSetModeFormikForm)
