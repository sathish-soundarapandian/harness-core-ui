/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { AllowedTypes, Formik } from '@harness/uicore'
import { noop } from 'lodash-es'
// eslint-disable-next-line no-restricted-imports
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ArtifactConfig } from 'services/cd-ng'

export interface ArtifactSourceConfigDetails {
  type: ArtifactType
  spec: ArtifactConfig
}

interface Props {
  allowableTypes: AllowedTypes
  template: ArtifactSourceConfigDetails
  path?: string
  readonly?: boolean
  className?: string
}

export function ArtifactSourceConfigRuntimeInputs(props: Props) {
  const { template, allowableTypes, path, readonly } = props
  const artifactSourceType = template?.type as ArtifactType
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const artifactSource = artifactSourceType && artifactSourceBaseFactory.getArtifactSource(artifactSourceType)

  const adaptedInitialValues = React.useMemo(() => {
    return {
      data: {
        artifacts: { primary: template }
      }
    }
  }, [template])

  if (!template) {
    return null
  }

  return (
    <Formik<{
      data: { artifacts: { primary: ArtifactSourceConfigDetails } }
    }>
      onSubmit={noop}
      initialValues={adaptedInitialValues}
      formName="artifactSourceConfigRuntimeInputsForm"
      enableReinitialize={true}
    >
      {_formikProps => {
        return (
          <>
            {artifactSource &&
              artifactSource.renderContent({
                template: { artifacts: { primary: template } },
                type: artifactSourceType,
                stepViewType: StepViewType.TemplateUsage,
                stageIdentifier: '',
                artifactSourceBaseFactory: artifactSourceBaseFactory,
                isArtifactsRuntime: true,
                isPrimaryArtifactsRuntime: true,
                isSidecarRuntime: false,
                projectIdentifier,
                orgIdentifier,
                accountId,
                pipelineIdentifier: '',
                isSidecar: false,
                artifact: template,
                readonly: !!readonly,
                allowableTypes: allowableTypes,
                initialValues: { artifacts: { primary: template } },
                artifactPath: 'primary',
                path
              })}
          </>
        )
      }}
    </Formik>
  )
}
