/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, get } from 'lodash-es'

import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { SidecarArtifact, useGetBuildDetailsForDocker, useGetBuildDetailsForDockerWithYaml } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'

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
  shouldFetchTagsSource,
  getValidInitialValuePath,
  DefaultParam
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import DigestField from '../ArtifactSourceRuntimeFields/DigestField'
import { useGetDigestDetailsForDocker } from './useGetDigestDetailsForDocker'
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
    artifactPath,
    artifacts,
    useArtifactV1Data = false
  } = props

  const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [lastQueryData, setLastQueryData] = useState({ connectorRef: '', imagePath: '' })
  const { CD_NG_DOCKER_ARTIFACT_DIGEST } = useFeatureFlags()

  const imagePathValue = getImagePath(
    // When the runtime value is provided some fixed value in templateusage view, that field becomes part of the pipeline yaml, and the fixed data comes from the pipelines api for service v2.
    // In this scenario, we take the default value from the allvalues(artifacts) field instead of artifact path
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.imagePath`, ''), artifact?.spec?.imagePath),
    get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
  )
  const tagRegexValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.tagRegex`, ''), artifact?.spec?.tagRegex),
    get(initialValues, `artifacts.${artifactPath}.spec.tagRegex`, '')
  )

  const tagValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.tag`, ''), artifact?.spec?.tag),
    get(initialValues, `artifacts.${artifactPath}.spec.tag`, '')
  )

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  const getFqnPathForEntity = (entityName: string): string =>
    getFqnPath(
      path as string,
      !!isPropagatedStage,
      stageIdentifier,
      defaultTo(
        isSidecar
          ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
          : artifactPath,
        ''
      ),
      entityName,
      serviceIdentifier as string,
      isMultiService
    )
  const tagFqnPath = getFqnPathForEntity('tag')
  const queryParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    imagePath: getFinalQueryParamValue(imagePathValue),
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
    serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined
  }

  const pipelineRuntimeYaml = getYamlData(formik?.values, stepViewType as StepViewType, path as string)
  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: dockerV1data,
    loading: fetchingV1Tags,
    refetch: fetchV1Tags,
    error: fetchV1TagsError
  } = useGetBuildDetailsForDocker({
    queryParams: {
      imagePath: getFinalQueryParamValue(imagePathValue),
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  const {
    data: dockerV2data,
    loading: fetchingV2Tags,
    refetch: fetchV2Tags,
    error: fetchV2TagsError
  } = useMutateAsGet(useGetBuildDetailsForDockerWithYaml, {
    body: pipelineRuntimeYaml,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },

    queryParams: {
      ...queryParams,
      fqnPath: tagFqnPath
    },
    lazy: true
  })

  const {
    fetchDigest,
    fetchingDigest,
    fetchDigestError: digestError,
    dockerDigestData: digestData
  } = useGetDigestDetailsForDocker({
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    imagePath: getFinalQueryParamValue(imagePathValue),
    tag: getFinalQueryParamValue(tagValue),
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    useArtifactV1Data,
    formik,
    path,
    initialValues,
    isPropagatedStage,
    serviceId,
    isSidecar,
    artifactPath,
    stageIdentifier,
    pipelineIdentifier,
    stepViewType
  })

  const { fetchTags, fetchingTags, fetchTagsError, dockerdata } = useArtifactV1Data
    ? {
        fetchTags: fetchV1Tags,
        fetchingTags: fetchingV1Tags,
        fetchTagsError: fetchV1TagsError,
        dockerdata: dockerV1data
      }
    : {
        fetchTags: fetchV2Tags,
        fetchingTags: fetchingV2Tags,
        fetchTagsError: fetchV2TagsError,
        dockerdata: dockerV2data
      }

  const fetchTagsEnabled = (): void => {
    if (canFetchTags()) {
      setLastQueryData({ connectorRef: connectorRefValue, imagePath: imagePathValue })
      fetchTags()
    }
  }

  const canFetchTags = (): boolean => {
    return (
      (!dockerdata?.data && !fetchTagsError) ||
      ((lastQueryData.connectorRef != connectorRefValue ||
        lastQueryData.imagePath !== imagePathValue ||
        getMultiTypeFromValue(artifact?.spec?.imagePath) === MultiTypeInputType.EXPRESSION) &&
        shouldFetchTagsSource([connectorRefValue, imagePathValue]))
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
              configureOptionsProps={{ className: css.connectorConfigOptions }}
              orgIdentifier={orgIdentifier}
              width={400}
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
              className={css.width400}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <>
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
            </>
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) && (
            <TextFieldInputSetView
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tagRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('tagRegex')}
              name={`${path}.artifacts.${artifactPath}.spec.tagRegex`}
              fieldPath={`artifacts.${artifactPath}.spec.tagRegex`}
              template={template}
            />
          )}
          {!fromTrigger &&
            CD_NG_DOCKER_ARTIFACT_DIGEST &&
            (isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) || tagValue !== DefaultParam) &&
            isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
              <DigestField
                {...props}
                fetchingDigest={fetchingDigest}
                // buildDetailsList={dockerdata?.data?.buildDetailsList}
                fetchDigestError={digestError}
                fetchDigest={fetchDigest}
                expressions={expressions}
                stageIdentifier={stageIdentifier}
                digestData={digestData}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.digest`)}
              />
            )}

          {!fromTrigger &&
            CD_NG_DOCKER_ARTIFACT_DIGEST &&
            (isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) || tagRegexValue !== DefaultParam) &&
            isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
              <TextFieldInputSetView
                tooltipProps={{
                  dataTooltipId: 'artifactDigestTooltip'
                }}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.digest`)}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                label={getString('pipeline.digest')}
                name={`${path}.artifacts.${artifactPath}.spec.digest`}
                fieldPath={`artifacts.${artifactPath}.spec.digest`}
                template={template}
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
