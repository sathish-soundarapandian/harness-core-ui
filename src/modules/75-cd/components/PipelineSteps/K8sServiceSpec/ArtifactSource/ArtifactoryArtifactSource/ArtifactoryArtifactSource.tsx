/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'
import type { GetDataError } from 'restful-react'

import { parse } from 'yaml'
import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  ArtifactoryImagePath,
  DeploymentStageConfig,
  Failure,
  PrimaryArtifact,
  ResponseArtifactoryResponseDTO,
  ServiceSpec,
  SidecarArtifact,
  useGetBuildDetailsForArtifactoryArtifactWithYaml,
  useGetImagePathsForArtifactory,
  useGetService
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { repositoryFormat } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  isAzureWebAppGenericDeploymentType,
  isServerlessDeploymentType,
  ServiceDeploymentType
} from '@pipeline/utils/stageHelpers'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import ServerlessArtifactoryRepository from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Artifactory/ServerlessArtifactoryRepository'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getConnectorRefFqnPath,
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags,
  shouldFetchTagsSource,
  isExecutionTimeFieldDisabled
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

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
const TagFields = (props: TagFieldsProps & { isGenericArtifactory?: boolean }): JSX.Element => {
  const {
    template,
    path,
    stageIdentifier,
    allowableTypes,
    fromTrigger,
    artifactPath,
    fetchingTags,
    artifactoryTagsData,
    fetchTagsError,
    fetchTags,
    isFieldDisabled,
    isGenericArtifactory
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const getTagsFieldName = (): string => {
    if (isGenericArtifactory) {
      return `artifacts.${artifactPath}.spec.artifactPath`
    }
    return `artifacts.${artifactPath}.spec.tag`
  }

  const getTagRegexFieldName = (): string => {
    if (isGenericArtifactory) {
      return `artifacts.${artifactPath}.spec.artifactPathFilter`
    }
    return `artifacts.${artifactPath}.spec.tagRegex`
  }

  return (
    <>
      {!!fromTrigger && isFieldRuntime(getTagsFieldName(), template) && (
        <FormInput.MultiTextInput
          label={isGenericArtifactory ? getString('pipeline.artifactPathLabel') : getString('tagLabel')}
          multiTextInputProps={{
            expressions,
            value: TriggerDefaultFieldList.build,
            allowableTypes
          }}
          disabled={true}
          tooltipProps={{
            dataTooltipId: isGenericArtifactory
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
          isServerlessDeploymentTypeSelected={isGenericArtifactory}
        />
      )}
      {isFieldRuntime(getTagRegexFieldName(), template) && (
        <FormInput.MultiTextInput
          disabled={isFieldDisabled(getTagRegexFieldName())}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          label={isGenericArtifactory ? getString('pipeline.artifactPathFilterLabel') : getString('tagRegex')}
          name={
            isGenericArtifactory
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
    artifactPath,
    stepViewType
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const { data: service, loading: serviceLoading } = useGetService({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    serviceIdentifier: serviceIdentifier as string
  })

  const selectedDeploymentType: ServiceDeploymentType = useMemo(() => {
    let selectedStageSpec: DeploymentStageConfig = getStageFromPipeline(
      props.stageIdentifier,
      props.formik.values.pipeline ?? props.formik.values
    ).stage?.stage?.spec as DeploymentStageConfig

    const stageArray: StageElementWrapperConfig[] = []
    props.formik.values.stages?.forEach((stage: StageElementWrapperConfig) => {
      if (get(stage, 'parallel')) {
        stage.parallel?.forEach((parallelStage: StageElementWrapperConfig) => {
          stageArray.push(parallelStage)
        })
      } else stageArray.push(stage)
    })
    if (!selectedStageSpec) {
      const selectedStage = stageArray.find(
        (currStage: StageElementWrapper) => currStage.stage?.identifier === props.stageIdentifier
      )?.stage
      selectedStageSpec = defaultTo(
        get(selectedStage, 'spec'),
        get(selectedStage, 'template.templateInputs.spec')
      ) as DeploymentStageConfig
    }
    return isNewServiceEnvEntity(path as string)
      ? (get(selectedStageSpec, 'service.serviceInputs.serviceDefinition.type') as ServiceDeploymentType)
      : (get(selectedStageSpec, 'serviceConfig.serviceDefinition.type') as ServiceDeploymentType)
  }, [path, props.formik.values, props.stageIdentifier])

  const isServerlessOrSshOrWinRmSelected =
    isServerlessDeploymentType(selectedDeploymentType) ||
    selectedDeploymentType === 'WinRm' ||
    selectedDeploymentType === 'Ssh'

  let repoFormat = defaultTo(
    artifact?.spec?.repositoryFormat,
    get(initialValues, `artifacts.${artifactPath}.spec.repositoryFormat`, '')
  )
  const isAzureWebAppGenericSelected = useMemo(() => {
    /* istanbul ignore else */
    if (service) {
      const parsedService = service?.data?.yaml && parse(service?.data?.yaml)
      repoFormat = get(parsedService, `service.serviceDefinition.spec.artifacts.${artifactPath}.spec.repositoryFormat`)
    }

    if (repoFormat) {
      return isAzureWebAppGenericDeploymentType(selectedDeploymentType, repoFormat)
    }

    return false
  }, [service, artifactPath, selectedDeploymentType, initialValues, artifact])

  const isGenericArtifactory = React.useMemo(() => {
    return isServerlessOrSshOrWinRmSelected || isAzureWebAppGenericSelected
  }, [isServerlessOrSshOrWinRmSelected, isAzureWebAppGenericSelected])

  const connectorRef =
    get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '') || artifact?.spec?.connectorRef

  const {
    data: imagePathData,
    loading: imagePathLoading,
    refetch: refetchImagePathData,
    error: imagePathError
  } = useGetImagePathsForArtifactory({
    queryParams: {
      repository: '',
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
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
        ),
        isGenericArtifactory ? 'artifactPath' : 'tag'
      )
    },
    lazy: true
  })

  useEffect(() => {
    if (imagePathLoading) {
      setArtifactPaths([{ label: getString('loading'), value: getString('loading') }])
    }
    if ((imagePathError?.data as Failure)?.status === 'ERROR') {
      const errorMessage = (imagePathError?.data as Failure)?.message as string
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    } else if ((imagePathError?.data as Failure)?.status === 'FAILURE') {
      const erroObj = (imagePathError?.data as Failure)?.errors?.[0]
      const errorMessage =
        erroObj?.fieldId && erroObj?.error ? `${erroObj?.fieldId} ${erroObj?.error}` : getString('somethingWentWrong')
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    }
  }, [imagePathLoading, imagePathError])

  useEffect(() => {
    if (imagePathData?.data) {
      setArtifactPaths(
        imagePathData.data?.imagePaths?.map((imagePath: ArtifactoryImagePath) => ({
          label: imagePath.imagePath || '',
          value: imagePath.imagePath || ''
        })) || []
      )
    }
  }, [imagePathData])

  // Initial values
  const artifactPathValue = isGenericArtifactory
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
    if (isGenericArtifactory) {
      return {
        // API is expecting artifacthPath query param to have artifactDirectory field value for generic artifactory
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
        fqnPath: getFqnPath(
          path as string,
          !!isPropagatedStage,
          stageIdentifier,
          defaultTo(
            isSidecar
              ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
              : artifactPath,
            ''
          ),
          'artifactPath'
        )
      }
    }

    return {
      artifactPath: getFinalQueryParamValue(
        getImagePath(
          artifact?.spec?.artifactPath,
          get(initialValues, `artifacts.${artifactPath}.spec.artifactPath`, '')
        )
      ),
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      repository: getFinalQueryParamValue(repositoryValue),
      repositoryFormat,
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
        ),
        'tag'
      )
    }
  }, [
    initialValues,
    artifactPath,
    isGenericArtifactory,
    artifact?.spec?.artifactPath,
    artifact?.spec?.artifactDirectory,
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
      ...artifactoryTagsDataCallMetadataQueryParams
    },
    lazy: true
  })

  const canFetchTags = (): boolean => {
    return !!(
      (lastQueryData.connectorRef != connectorRefValue ||
        lastQueryData.artifactPaths !== artifactPathValue ||
        getMultiTypeFromValue(artifact?.spec?.artifactPath) === MultiTypeInputType.EXPRESSION ||
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
      serviceLoading ||
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
      return isTagsSelectionDisabled(props, isGenericArtifactory)
    }
    return false
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={imagePathLoading}
        onClick={handleClick}
      />
    </div>
  ))

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

          <div className={css.inputFieldLayout}>
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
            {getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.repositoryUrl`)) ===
              MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                className={css.configureOptions}
                style={{ alignSelf: 'center' }}
                value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.repositoryUrl`)}
                type="String"
                variableName="repositoryUrl"
                showRequiredField={false}
                showDefaultField={true}
                isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.repositoryUrl`, value)
                }}
              />
            )}
          </div>

          <div className={css.inputFieldLayout}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.repository`, template) && (
              <ServerlessArtifactoryRepository
                connectorRef={
                  get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '') || artifact?.spec?.connectorRef
                }
                repoFormat={isGenericArtifactory ? 'generic' : repoFormat}
                expressions={expressions}
                allowableTypes={allowableTypes}
                formik={formik}
                fieldName={`${path}.artifacts.${artifactPath}.spec.repository`}
                fieldPath={`artifacts.${artifactPath}.spec.repository`}
                template={template}
                serviceId={isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined}
                fqnPath={getConnectorRefFqnPath(
                  path as string,
                  !!isPropagatedStage,
                  stageIdentifier,
                  defaultTo(artifactPath, ''),
                  'connectorRef'
                )}
              />
            )}
            {getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.repository`)) ===
              MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                className={css.configureOptions}
                style={{ alignSelf: 'center' }}
                value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.repository`)}
                type="String"
                variableName="repository"
                showRequiredField={false}
                showDefaultField={true}
                isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.repository`, value)
                }}
              />
            )}
          </div>
          <div className={css.inputFieldLayout}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactDirectory`, template) && isGenericArtifactory && (
              <TextFieldInputSetView
                label={getString('pipeline.artifactsSelection.artifactDirectory')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactDirectory`)}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                name={`${path}.artifacts.${artifactPath}.spec.artifactDirectory`}
                onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.artifactPath`)}
                fieldPath={`artifacts.${artifactPath}.spec.artifactDirectory`}
                template={template}
              />
            )}
            {getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.artifactDirectory`)) ===
              MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                className={css.configureOptions}
                style={{ alignSelf: 'center' }}
                value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.artifactDirectory`)}
                type="String"
                variableName="artifactDirectory"
                showRequiredField={false}
                showDefaultField={true}
                isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.artifactDirectory`, value)
                }}
              />
            )}
          </div>
          <div className={css.inputFieldLayout}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactPath`, template) && !isGenericArtifactory && (
              <FormInput.MultiTypeInput
                selectItems={artifactPaths}
                label={getString('pipeline.artifactImagePathLabel')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactPath`)}
                name={`${path}.artifacts.${artifactPath}.spec.artifactPath`}
                placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                useValue
                multiTypeInputProps={{
                  expressions,
                  allowableTypes,
                  selectProps: {
                    noResults: <NoTagResults tagError={imagePathError} isServerlessDeploymentTypeSelected={false} />,
                    itemRenderer: itemRenderer,
                    items: artifactPaths,
                    allowCreatingNewItems: true
                  },
                  onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    if (
                      e?.target?.type !== 'text' ||
                      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                    ) {
                      return
                    }
                    refetchImagePathData({
                      queryParams: {
                        repository: repositoryValue,
                        connectorRef,
                        accountIdentifier: accountId,
                        orgIdentifier,
                        projectIdentifier
                      }
                    })
                  }
                }}
              />
            )}
            {getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.artifactPath`)) ===
              MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                className={css.configureOptions}
                style={{ alignSelf: 'center' }}
                value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.artifactPath`)}
                type="String"
                variableName="artifactPath"
                showRequiredField={false}
                showDefaultField={true}
                isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.artifactPath`, value)
                }}
              />
            )}
          </div>

          <TagFields
            {...props}
            fetchTags={fetchTags}
            fetchTagsError={fetchTagsError}
            fetchingTags={fetchingTags}
            artifactoryTagsData={artifactoryTagsData}
            isFieldDisabled={isFieldDisabled}
            selectedDeploymentType={selectedDeploymentType}
            isGenericArtifactory={isGenericArtifactory}
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
      const isArtifactDirectoryPresent = getDefaultQueryParam(
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
