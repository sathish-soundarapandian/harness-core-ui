/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, get } from 'lodash-es'

import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { SidecarArtifact, useGetBuildDetailsForDockerWithYaml } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags,
  shouldFetchTagsSource
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface DockerRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: DockerRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
    stepViewType,
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    readonly,
    repoIdentifier,
    pipelineIdentifier,
    branch,
    stageIdentifier,
    serviceIdentifier,
    isTagsSelectionDisabled,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath
  } = props

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [lastQueryData, setLastQueryData] = useState({ connectorRef: '', imagePath: '' })

  const imagePathValue = getImagePath(
    artifact?.spec?.imagePath,
    get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
  )
  const connectorRefValue = getDefaultQueryParam(
    artifact?.spec?.connectorRef,
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )

  const {
    data: dockerdata,
    loading: fetchingTags,
    refetch: fetchTags,
    error: fetchTagsError
  } = useMutateAsGet(useGetBuildDetailsForDockerWithYaml, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },

    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      imagePath: getFinalQueryParamValue(imagePathValue),
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        )
      )
    },
    lazy: true
  })

  const fetchTagsEnabled = (): void => {
    if (canFetchTags()) {
      setLastQueryData({ connectorRef: connectorRefValue, imagePath: imagePathValue })
      fetchTags()
    }
  }

  const canFetchTags = (): boolean => {
    return (
      !!(
        lastQueryData.connectorRef != connectorRefValue ||
        lastQueryData.imagePath !== imagePathValue ||
        getMultiTypeFromValue(artifact?.spec?.imagePath) === MultiTypeInputType.EXPRESSION
      ) && shouldFetchTagsSource([connectorRefValue, imagePathValue])
    )
  }

  const isFieldDisabled = (fieldName: string, isTag = false): boolean => {
    /* instanbul ignore else */
    if (
      readonly ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    if (isTag) {
      return isTagsSelectionDisabled(props)
    }
    return false
  }
  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime
  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template) && (
            <FormMultiTypeConnectorField
              name={`${path}.artifacts.${artifactPath}.spec.connectorRef`}
              label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
              selected={get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')}
              placeholder={''}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.imagePath`, template) && (
            <TextFieldInputSetView
              label={getString('pipeline.imagePathLabel')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.imagePath`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              name={`${path}.artifacts.${artifactPath}.spec.imagePath`}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              fieldPath={`artifacts.${artifactPath}.spec.imagePath`}
              template={template}
            />
          )}

          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <FormInput.MultiTextInput
              label={getString('tagLabel')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.tag`}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <ArtifactTagRuntimeField
              {...props}
              isFieldDisabled={() => isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
              fetchingTags={fetchingTags}
              buildDetailsList={dockerdata?.data?.buildDetailsList}
              fetchTagsError={fetchTagsError}
              fetchTags={fetchTagsEnabled}
              expressions={expressions}
              stageIdentifier={stageIdentifier}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) && (
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tagRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('tagRegex')}
              name={`${path}.artifacts.${artifactPath}.spec.tagRegex`}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class DockerArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.DockerRegistry
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { initialValues, artifactPath, artifact } = props

    const isImagePathPresent = getImagePath(
      artifact?.spec?.imagePath,
      get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
    )
    const isConnectorPresent = getDefaultQueryParam(
      artifact?.spec?.connectorRef,
      get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
    )

    return !(isImagePathPresent && isConnectorPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
