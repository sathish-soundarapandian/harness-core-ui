/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { AllowedTypes, Layout } from '@harness/uicore'
import cx from 'classnames'

import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ApplicationSettingsConfiguration, ConnectionStringsConfiguration, ServiceSpec } from 'services/cd-ng'
import configFileSourceBaseFactory from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBaseFactory'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AllNGVariables } from '@pipeline/utils/types'
import applicationConfigBaseFactory from '@cd/factory/ApplicationConfigFactory/ApplicationConfigFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import manifestSourceBaseFactory from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { RuntimeApplicationConfig } from '@pipeline/components/RuntimeApplicationConfig/RuntimeApplicationConfig'
import type { K8SDirectServiceStep } from '../../K8sServiceSpec/K8sServiceSpecInterface'
import { KubernetesArtifacts } from '../../K8sServiceSpec/KubernetesArtifacts/KubernetesArtifacts'
import { KubernetesManifests } from '../../K8sServiceSpec/KubernetesManifests/KubernetesManifests'
import PrimaryArtifactRef from '../../K8sServiceSpec/PrimaryArtifact/PrimaryArtifactRef'
import { ConfigFiles } from '../../SshServiceSpec/SshConfigFiles/ConfigFiles'
import { ApplicationConfigType } from '../../AzureWebAppServiceSpec/AzureWebAppServiceSpecInterface.types'
import css from './GenericServiceSpec.module.scss'

export interface KubernetesInputSetProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec & {
    applicationSettings?: ApplicationSettingsConfiguration
    connectionStrings?: ConnectionStringsConfiguration
  }
  allValues?: ServiceSpec & {
    applicationSettings?: ApplicationSettingsConfiguration
    connectionStrings?: ConnectionStringsConfiguration
  }
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  serviceIdentifier?: string
  formik?: any
  allowableTypes: AllowedTypes
}
const GenericServiceSpecInputSetModeFormikForm = (props: KubernetesInputSetProps): React.ReactElement => {
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
    <Layout.Vertical spacing="medium" margin={{ bottom: 'xlarge' }}>
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
          artifacts={allValues?.artifacts}
          artifactSourceBaseFactory={artifactSourceBaseFactory}
          stageIdentifier={stageIdentifier}
          template={template as ServiceSpec}
          {...commonProps}
        />
      )}

      {!!template?.manifests?.length && (
        <KubernetesManifests
          manifests={allValues?.manifests}
          manifestSourceBaseFactory={manifestSourceBaseFactory}
          stageIdentifier={stageIdentifier}
          template={template}
          {...commonProps}
        />
      )}

      {!!template?.applicationSettings && (
        <RuntimeApplicationConfig
          type={ApplicationConfigType.applicationSettings}
          template={template}
          applicationConfig={allValues?.applicationSettings}
          applicationConfigBaseFactory={applicationConfigBaseFactory}
          stageIdentifier={stageIdentifier}
          {...commonProps}
        />
      )}

      {!!template?.connectionStrings && (
        <RuntimeApplicationConfig
          type={ApplicationConfigType.connectionStrings}
          template={template}
          applicationConfig={allValues?.connectionStrings}
          applicationConfigBaseFactory={applicationConfigBaseFactory}
          stageIdentifier={stageIdentifier}
          {...commonProps}
        />
      )}

      {!!template?.configFiles?.length && (
        <ConfigFiles
          configFiles={defaultTo(allValues?.configFiles, initialValues?.configFiles)}
          configFileSourceBaseFactory={configFileSourceBaseFactory}
          stageIdentifier={stageIdentifier}
          template={template}
          {...commonProps}
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

export const GenericServiceSpecInputSetMode = connect(GenericServiceSpecInputSetModeFormikForm)
