/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import { defaultTo, get } from 'lodash-es'
import type { GetDataError } from 'restful-react'

import { AllowedTypes, FormInput, Layout, MultiTypeInputType } from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  DeploymentStageConfig,
  Failure,
  PrimaryArtifact,
  ResponseArtifactoryResponseDTO,
  ServiceSpec,
  SidecarArtifact,
  useGetBuildDetailsForArtifactoryArtifactWithYaml
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { repositoryFormat } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isServerlessDeploymentType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import ServerlessArtifactoryRepository from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Artifactory/ServerlessArtifactoryRepository'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  isArtifactSourceRuntime,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags,
  shouldFetchTagsSource
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../K8sServiceSpec.module.scss'

interface ArtifactoryRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps, isServerlessOrSshOrWinRmSelected: boolean) => boolean
}

interface TagFieldsProps extends ArtifactoryRenderContent {
  template: ServiceSpec
  stageIdentifier: string
  path?: string
  allowableTypes: AllowedTypes
  fromTrigger?: boolean
  artifact?: PrimaryArtifact | SidecarArtifact
  selectedDeploymentType: ServiceDeploymentType
  isSidecar?: boolean
  artifactPath?: string
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps, isServerlessOrSshOrWinRmSelected: boolean) => boolean
  fetchingTags: boolean
  artifactoryTagsData: ResponseArtifactoryResponseDTO | null
  fetchTagsError: GetDataError<Failure | Error> | null
  fetchTags: () => void
  isFieldDisabled: (fieldName: string, isTag?: boolean) => boolean
}
const TagFields = (props: TagFieldsProps): JSX.Element => {
  const {
    template,
    path,
    stageIdentifier,
    allowableTypes,
    fromTrigger,
    artifactPath,
    selectedDeploymentType,
    fetchingTags,
    artifactoryTagsData,
    fetchTagsError,
    fetchTags,
    isFieldDisabled
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isServerlessOrSshOrWinRmSelected =
    isServerlessDeploymentType(selectedDeploymentType) ||
    selectedDeploymentType === 'WinRm' ||
    selectedDeploymentType === 'Ssh'

  const getTagsFieldName = (): string => {
    if (isServerlessOrSshOrWinRmSelected) {
      return `artifacts.${artifactPath}.spec.artifactPath`
    }
    return `artifacts.${artifactPath}.spec.tag`
  }

  const getTagRegexFieldName = (): string => {
    if (isServerlessOrSshOrWinRmSelected) {
      return `artifacts.${artifactPath}.spec.artifactPathFilter`
    }
    return `artifacts.${artifactPath}.spec.tagRegex`
  }

  return (
    <>
      {!!fromTrigger && isFieldRuntime(getTagsFieldName(), template) && (
        <FormInput.MultiTextInput
          label={isServerlessOrSshOrWinRmSelected ? getString('pipeline.artifactPathLabel') : getString('tagLabel')}
          multiTextInputProps={{
            expressions,
            value: TriggerDefaultFieldList.build,
            allowableTypes
          }}
          disabled={true}
          tooltipProps={{
            dataTooltipId: isServerlessOrSshOrWinRmSelected
              ? `wizardForm_artifacts_${path}.artifacts.${artifactPath}.spec.artifactPath`
              : `wizardForm_artifacts_${path}.artifacts.${artifactPath}.spec.tag`
          }}
          name={`${path}.artifacts.${artifactPath}.spec.tag`}
        />
      )}

      {!fromTrigger && isFieldRuntime(getTagsFieldName(), template) && (
        <ArtifactTagRuntimeField
          {...props}
          isFieldDisabled={() => isFieldDisabled(getTagsFieldName(), true)}
          fetchingTags={fetchingTags}
          buildDetailsList={artifactoryTagsData?.data?.buildDetailsList}
          fetchTagsError={fetchTagsError}
          fetchTags={fetchTags}
          expressions={expressions}
          stageIdentifier={stageIdentifier}
          isServerlessDeploymentTypeSelected={isServerlessOrSshOrWinRmSelected}
        />
      )}
      {isFieldRuntime(getTagRegexFieldName(), template) && (
        <FormInput.MultiTextInput
          disabled={isFieldDisabled(getTagRegexFieldName())}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          label={
            isServerlessOrSshOrWinRmSelected ? getString('pipeline.artifactPathFilterLabel') : getString('tagRegex')
          }
          name={
            isServerlessOrSshOrWinRmSelected
              ? `${path}.artifacts.${artifactPath}.spec.artifactPathFilter`
              : `${path}.artifacts.${artifactPath}.spec.tagRegex`
          }
        />
      )}
    </>
  )
}

const Content = (props: ArtifactoryRenderContent): JSX.Element => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
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

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const selectedDeploymentType: ServiceDeploymentType = useMemo(() => {
    let selectedStageSpec: DeploymentStageConfig = getStageFromPipeline(
      props.stageIdentifier,
      props.formik.values.pipeline ?? props.formik.values
    ).stage?.stage?.spec as DeploymentStageConfig

    if (!selectedStageSpec) {
      selectedStageSpec = props.formik.values.stages?.find(
        (currStage: StageElementWrapper) => currStage.stage?.identifier === props.stageIdentifier
      ).stage.spec as DeploymentStageConfig
    }

    return isNewServiceEnvEntity(path as string)
      ? (selectedStageSpec?.service?.serviceInputs?.serviceDefinition?.type as ServiceDeploymentType)
      : (selectedStageSpec?.serviceConfig?.serviceDefinition?.type as ServiceDeploymentType)
  }, [path, props.formik.values, props.stageIdentifier])

  const isServerlessOrSshOrWinRmSelected =
    isServerlessDeploymentType(selectedDeploymentType) ||
    selectedDeploymentType === 'WinRm' ||
    selectedDeploymentType === 'Ssh'

  // Initial values
  const artifactPathValue = isServerlessOrSshOrWinRmSelected
    ? getDefaultQueryParam(
        artifact?.spec?.artifactDirectory,
        get(initialValues?.artifacts, `${artifactPath}.spec.artifactDirectory`, '')
      )
    : getImagePath(artifact?.spec?.artifactPath, get(initialValues, `artifacts.${artifactPath}.spec.artifactPath`, ''))
  const connectorRefValue = getDefaultQueryParam(
    artifact?.spec?.connectorRef,
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const repositoryValue = getDefaultQueryParam(
    artifact?.spec?.repository,
    get(initialValues?.artifacts, `${artifactPath}.spec.repository`, '')
  )

  const artifactoryTagsDataCallMetadataQueryParams = React.useMemo(() => {
    if (isServerlessOrSshOrWinRmSelected) {
      return {
        artifactPath: getFinalQueryParamValue(
          getDefaultQueryParam(
            artifact?.spec?.artifactDirectory,
            get(initialValues?.artifacts, `${artifactPath}.spec.artifactDirectory`, '')
          )
        ),
        connectorRef: getFinalQueryParamValue(connectorRefValue),
        repository: getFinalQueryParamValue(repositoryValue),
        repositoryFormat: 'generic',
        pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
        serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
        fqnPath: getFqnPath(path as string, !!isPropagatedStage, stageIdentifier, defaultTo(artifactPath, ''))
      }
    }

    return {
      artifactPath: getImagePath(
        artifact?.spec?.artifactPath,
        get(initialValues, `artifacts.${artifactPath}.spec.artifactPath`, '')
      ),
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      repository: getFinalQueryParamValue(repositoryValue),
      repositoryFormat,
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      fqnPath: getFqnPath(path as string, !!isPropagatedStage, stageIdentifier, defaultTo(artifactPath, ''))
    }
  }, [
    isServerlessOrSshOrWinRmSelected,
    artifact?.spec?.artifactPath,
    artifact?.spec?.artifactDirectory,
    initialValues,
    artifactPath,
    connectorRefValue,
    repositoryValue,
    pipelineIdentifier,
    formik?.values?.identifier,
    path,
    serviceIdentifier,
    isPropagatedStage,
    stageIdentifier
  ])

  const [lastQueryData, setLastQueryData] = useState({ connectorRef: '', artifactPaths: '', repository: '' })
  const {
    data: artifactoryTagsData,
    loading: fetchingTags,
    refetch: refetchTags,
    error: fetchTagsError
  } = useMutateAsGet(useGetBuildDetailsForArtifactoryArtifactWithYaml, {
    body: yamlStringify({
      pipeline: formik?.values
    }),
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
      ...artifactoryTagsDataCallMetadataQueryParams
    },
    lazy: true
  })

  const canFetchTags = (): boolean => {
    return !!(
      (lastQueryData.connectorRef != connectorRefValue ||
        lastQueryData.artifactPaths !== artifactPathValue ||
        lastQueryData.repository !== repositoryValue) &&
      shouldFetchTagsSource([connectorRefValue, artifactPathValue, repositoryValue])
    )
  }

  const fetchTags = (): void => {
    if (canFetchTags()) {
      setLastQueryData({
        connectorRef: connectorRefValue,
        artifactPaths: artifactPathValue,
        repository: repositoryValue
      })
      refetchTags()
    }
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
      return isTagsSelectionDisabled(props, isServerlessOrSshOrWinRmSelected)
    }
    return false
  }

  const isRuntime = isArtifactSourceRuntime(isPrimaryArtifactsRuntime, isSidecarRuntime, isSidecar as boolean)

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
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
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

          {isFieldRuntime(`artifacts.${artifactPath}.spec.repositoryUrl`, template) && (
            <FormInput.MultiTextInput
              label={getString('repositoryUrlLabel')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repositoryUrl`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              name={`${path}.artifacts.${artifactPath}.spec.repositoryUrl`}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.repository`, template) &&
          !isServerlessOrSshOrWinRmSelected ? (
            <FormInput.MultiTextInput
              label={getString('repository')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repository`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              name={`${path}.artifacts.${artifactPath}.spec.repository`}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
            />
          ) : (
            isFieldRuntime(`artifacts.${artifactPath}.spec.repository`, template) && (
              <ServerlessArtifactoryRepository
                connectorRef={
                  get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '') || artifact?.spec?.connectorRef
                }
                expressions={expressions}
                allowableTypes={allowableTypes}
                formik={formik}
                fieldName={`${path}.artifacts.${artifactPath}.spec.repository`}
              />
            )
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactDirectory`, template) &&
            isServerlessOrSshOrWinRmSelected && (
              <FormInput.MultiTextInput
                label={getString('pipeline.artifactsSelection.artifactDirectory')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactDirectory`)}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                name={`${path}.artifacts.${artifactPath}.spec.artifactDirectory`}
                onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.artifactPath`)}
              />
            )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactPath`, template) &&
            !isServerlessOrSshOrWinRmSelected && (
              <FormInput.MultiTextInput
                label={getString('pipeline.artifactPathLabel')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactPath`)}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                name={`${path}.artifacts.${artifactPath}.spec.artifactPath`}
                onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              />
            )}

          <TagFields
            {...props}
            fetchTags={fetchTags}
            fetchTagsError={fetchTagsError}
            fetchingTags={fetchingTags}
            artifactoryTagsData={artifactoryTagsData}
            isFieldDisabled={isFieldDisabled}
            selectedDeploymentType={selectedDeploymentType}
          />
        </Layout.Vertical>
      )}
    </>
  )
}

export class ArtifactoryArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps, isServerlessOrSshOrWinRmSelected = false): boolean {
    const { initialValues, artifactPath, artifact } = props

    if (isServerlessOrSshOrWinRmSelected) {
      const isArtifactDirectoryPresent = getImagePath(
        artifact?.spec?.artifactDirectory,
        get(initialValues, `artifacts.${artifactPath}.spec.artifactDirectory`, '')
      )
      const isServerlessConnectorPresent = getDefaultQueryParam(
        artifact?.spec?.connectorRef,
        get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
      )
      const isServerlessRepositoryPresent = getDefaultQueryParam(
        artifact?.spec?.repository,
        get(initialValues?.artifacts, `${artifactPath}.spec.repository`, '')
      )

      return !(isArtifactDirectoryPresent && isServerlessConnectorPresent && isServerlessRepositoryPresent)
    }

    const isArtifactPathPresent = getImagePath(
      artifact?.spec?.artifactPath,
      get(initialValues, `artifacts.${artifactPath}.spec.artifactPath`, '')
    )
    const isConnectorPresent = getDefaultQueryParam(
      artifact?.spec?.connectorRef,
      get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
    )
    const isRepositoryPresent = getDefaultQueryParam(
      artifact?.spec?.repository,
      get(initialValues, `artifacts.${artifactPath}.spec.repository`, '')
    )
    return !(isArtifactPathPresent && isConnectorPresent && isRepositoryPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
