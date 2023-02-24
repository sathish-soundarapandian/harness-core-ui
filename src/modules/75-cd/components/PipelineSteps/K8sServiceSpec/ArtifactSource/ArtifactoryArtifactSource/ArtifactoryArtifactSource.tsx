/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { defaultTo, get, memoize, pick } from 'lodash-es'
import type { GetDataError } from 'restful-react'

import { parse } from 'yaml'
import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  ArtifactoryImagePath,
  DeploymentStageConfig,
  Failure,
  Error,
  PrimaryArtifact,
  ResponseArtifactoryResponseDTO,
  ServiceSpec,
  SidecarArtifact,
  useGetBuildDetailsForArtifactoryArtifactWithYaml,
  useGetImagePathsForArtifactoryV2,
  useGetService,
  useGetBuildDetailsForArtifactoryArtifact,
  useGetImagePathsForArtifactory,
  ArtifactListConfig,
  ArtifactSource
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { repositoryFormat } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getHelpeTextForTags,
  isAzureWebAppGenericDeploymentType,
  isCustomDTGenericDeploymentType,
  isServerlessDeploymentType,
  isTasGenericDeploymentType,
  RepositoryFormatTypes,
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
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
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
  isExecutionTimeFieldDisabled,
  getValidInitialValuePath
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
    stepViewType,
    artifacts,
    useArtifactV1Data = false
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
  const [repoFormat, setRepoFormat] = useState(
    defaultTo(
      artifact?.spec?.repositoryFormat,
      get(initialValues, `artifacts.${artifactPath}.spec.repositoryFormat`, '')
    )
  )

  const selectedDeploymentType: ServiceDeploymentType = useMemo(() => {
    let selectedStageSpec: DeploymentStageConfig = getStageFromPipeline(
      props.stageIdentifier,
      props.formik?.values.pipeline ?? props.formik?.values
    ).stage?.stage?.spec as DeploymentStageConfig

    const stageArray: StageElementWrapperConfig[] = []
    props.formik?.values.stages?.forEach((stage: StageElementWrapperConfig) => {
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
  }, [path, props.formik?.values, props.stageIdentifier])

  const isServerlessOrSshOrWinRmSelected =
    isServerlessDeploymentType(selectedDeploymentType) ||
    selectedDeploymentType === 'WinRm' ||
    selectedDeploymentType === 'Ssh'

  const [isAzureWebAppGenericSelected, setIsAzureWebAppGenericSelected] = useState(
    repoFormat ? isAzureWebAppGenericDeploymentType(selectedDeploymentType, repoFormat) : false
  )

  const [isCustomDeploymentGenericSelected, setIsCustomDeploymentGenericSelected] = useState(
    repoFormat ? isCustomDTGenericDeploymentType(selectedDeploymentType, repoFormat) : false
  )

  const [isTasGenericSelected, setIsTasGenericSelected] = useState(
    repoFormat ? isCustomDTGenericDeploymentType(selectedDeploymentType, repoFormat) : false
  )

  const [isGenericArtifactory, setIsGenericArtifactory] = useState(
    isServerlessOrSshOrWinRmSelected ||
      isAzureWebAppGenericSelected ||
      isCustomDeploymentGenericSelected ||
      isTasGenericSelected ||
      repoFormat === RepositoryFormatTypes.Generic
  )

  useEffect(() => {
    let serviceRepoFormat
    /* istanbul ignore else */
    if (service) {
      const parsedService = service?.data?.yaml && parse(service?.data?.yaml)
      // to be refactored for some fields once generic dependency is resolved via V2
      const artifactsInfo = get(parsedService, `service.serviceDefinition.spec.artifacts`) as ArtifactListConfig
      artifactsInfo?.primary?.sources?.map(artifactInfo => {
        if (artifactInfo?.identifier === (artifact as ArtifactSource)?.identifier) {
          serviceRepoFormat = artifactInfo?.spec?.repositoryFormat
          setRepoFormat(serviceRepoFormat)
        }
      })
    }

    setIsTasGenericSelected(
      serviceRepoFormat ? isTasGenericDeploymentType(selectedDeploymentType, serviceRepoFormat) : false
    )
  }, [service, artifact, selectedDeploymentType])

  useEffect(() => {
    let serviceRepoFormat
    /* istanbul ignore else */
    if (service) {
      const parsedService = service?.data?.yaml && parse(service?.data?.yaml)
      serviceRepoFormat = get(
        parsedService,
        `service.serviceDefinition.spec.artifacts.${artifactPath}.spec.repositoryFormat`
      )

      setRepoFormat(serviceRepoFormat)
    }

    setIsAzureWebAppGenericSelected(
      serviceRepoFormat ? isAzureWebAppGenericDeploymentType(selectedDeploymentType, serviceRepoFormat) : false
    )
  }, [service, artifactPath, selectedDeploymentType])

  useEffect(() => {
    let serviceRepoFormat
    /* istanbul ignore else */
    if (service) {
      const parsedService = service?.data?.yaml && parse(service?.data?.yaml)
      // to be refactored for some fields once generic dependency is resolved via V2
      const artifactsInfo = get(parsedService, `service.serviceDefinition.spec.artifacts`) as ArtifactListConfig
      artifactsInfo?.primary?.sources?.map(artifactInfo => {
        if (artifactInfo?.identifier === (artifact as ArtifactSource)?.identifier) {
          serviceRepoFormat = artifactInfo?.spec?.repositoryFormat
          setRepoFormat(serviceRepoFormat)
        }
      })
    }

    setIsCustomDeploymentGenericSelected(
      serviceRepoFormat ? isCustomDTGenericDeploymentType(selectedDeploymentType, serviceRepoFormat) : false
    )
  }, [service, artifact, selectedDeploymentType])

  useEffect(() => {
    setIsGenericArtifactory(
      isServerlessOrSshOrWinRmSelected ||
        isAzureWebAppGenericSelected ||
        isCustomDeploymentGenericSelected ||
        isTasGenericSelected ||
        repoFormat === RepositoryFormatTypes.Generic
    )
  }, [
    isServerlessOrSshOrWinRmSelected,
    isAzureWebAppGenericSelected,
    isCustomDeploymentGenericSelected,
    isTasGenericSelected,
    repoFormat
  ])

  const connectorRef = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const repositoryValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.repository`, ''), artifact?.spec?.repository),
    get(initialValues?.artifacts, `${artifactPath}.spec.repository`, '')
  )

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: imagePathV1Data,
    loading: imagePathV1Loading,
    refetch: refetchV1ImagePathData,
    error: imagePathV1Error
  } = useGetImagePathsForArtifactory({
    queryParams: {
      repository: defaultTo(getFinalQueryParamValue(repositoryValue), ''),
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true,
    debounce: 300
  })
  const getTagRegexFieldName = (): string => {
    if (isGenericArtifactory) {
      return `artifacts.${artifactPath}.spec.artifactPathFilter`
    }
    return `artifacts.${artifactPath}.spec.tagRegex`
  }

  const getFQNFieldName = (): string =>
    isGenericArtifactory ? 'artifactPath' : isFieldRuntime(getTagRegexFieldName(), template) ? 'tagRegex' : 'tag'

  const {
    data: imagePathV2Data,
    loading: imagePathV2Loading,
    refetch: refetchV2ImagePathData,
    error: imagePathV2Error
  } = useMutateAsGet(useGetImagePathsForArtifactoryV2, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      repository: getFinalQueryParamValue(repositoryValue),
      connectorRef: getFinalQueryParamValue(connectorRef),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
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
        getFQNFieldName()
      )
    },
    lazy: true
  })

  const { imagePathData, imagePathLoading, refetchImagePathData, imagePathError } = useArtifactV1Data
    ? {
        imagePathData: imagePathV1Data,
        imagePathLoading: imagePathV1Loading,
        refetchImagePathData: refetchV1ImagePathData,
        imagePathError: imagePathV1Error
      }
    : {
        imagePathData: imagePathV2Data,
        imagePathLoading: imagePathV2Loading,
        refetchImagePathData: refetchV2ImagePathData,
        imagePathError: imagePathV2Error
      }

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
        getValidInitialValuePath(
          get(artifacts, `${artifactPath}.spec.artifactDirectory`, ''),
          artifact?.spec?.artifactDirectory
        ),
        get(initialValues?.artifacts, `${artifactPath}.spec.artifactDirectory`, '')
      )
    : getImagePath(artifact?.spec?.artifactPath, get(initialValues, `artifacts.${artifactPath}.spec.artifactPath`, ''))
  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const isArtifactDisabled = () => {
    return repositoryValue?.toString()?.length === 0 || connectorRefValue?.toString()?.length === 0
  }

  const artifactoryTagsDataCallMetadataQueryParams = React.useMemo(() => {
    if (isGenericArtifactory) {
      return {
        // API is expecting artifacthPath query param to have artifactDirectory field value for generic artifactory
        artifactPath: getFinalQueryParamValue(
          getDefaultQueryParam(
            getValidInitialValuePath(
              get(artifacts, `${artifactPath}.spec.artifactDirectory`, ''),
              artifact?.spec?.artifactDirectory
            ),
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
        getDefaultQueryParam(
          getValidInitialValuePath(
            get(artifacts, `${artifactPath}.spec.artifactPath`, ''),
            artifact?.spec?.artifactPath
          ),
          get(initialValues?.artifacts, `${artifactPath}.spec.artifactPath`, '')
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
    stageIdentifier,
    artifacts,
    isSidecar
  ])

  const [lastQueryData, setLastQueryData] = useState({ connectorRef: '', artifactPaths: '', repository: '' })

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: artifactoryTagsV1Data,
    loading: fetchingV1Tags,
    refetch: refetchV1Tags,
    error: fetchTagsV1Error
  } = useGetBuildDetailsForArtifactoryArtifact({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      ...pick(artifactoryTagsDataCallMetadataQueryParams, [
        'artifactPath',
        'repository',
        'repositoryFormat',
        'connectorRef'
      ])
    },
    lazy: true,
    debounce: 300
  })

  const {
    data: artifactoryTagsV2Data,
    loading: fetchingV2Tags,
    refetch: refetchV2Tags,
    error: fetchTagsV2Error
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

  const { artifactoryTagsData, fetchingTags, refetchTags, fetchTagsError } = useArtifactV1Data
    ? {
        artifactoryTagsData: artifactoryTagsV1Data,
        fetchingTags: fetchingV1Tags,
        refetchTags: refetchV1Tags,
        fetchTagsError: fetchTagsV1Error
      }
    : {
        artifactoryTagsData: artifactoryTagsV2Data,
        fetchingTags: fetchingV2Tags,
        refetchTags: refetchV2Tags,
        fetchTagsError: fetchTagsV2Error
      }

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

  const artifactPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => {
    const isDisabled =
      imagePathLoading ||
      (imagePathError?.data as Error)?.status === 'ERROR' ||
      (imagePathError?.data as Failure)?.status === 'FAILURE'
    return <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={isDisabled} />
  })

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
            <div className={css.inputFieldLayout}>
              <TextFieldInputSetView
                label={getString('repositoryUrlLabel')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repositoryUrl`)}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                name={`${path}.artifacts.${artifactPath}.spec.repositoryUrl`}
                fieldPath={`artifacts.${artifactPath}.spec.repositoryUrl`}
                template={template}
              />
              {getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.repositoryUrl`)) ===
                MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  className={css.configureOptions}
                  style={{ alignSelf: 'center' }}
                  value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.repositoryUrl`)}
                  type="String"
                  variableName="repositoryUrl"
                  showRequiredField={false}
                  isReadonly={readonly}
                  showDefaultField={true}
                  isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
                  showAdvanced={true}
                  onChange={value => {
                    formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.repositoryUrl`, value)
                  }}
                />
              )}
            </div>
          )}
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
              fqnPath={getFqnPath(
                path as string,
                !!isPropagatedStage,
                stageIdentifier,
                defaultTo(
                  isSidecar
                    ? artifactPath
                        ?.split('[')[0]
                        .concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
                    : artifactPath,
                  ''
                ),
                'connectorRef'
              )}
              stepViewType={stepViewType}
            />
          )}
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactPath`, template) && !isGenericArtifactory && (
            <div className={css.inputFieldLayout}>
              <FormInput.MultiTypeInput
                selectItems={artifactPaths}
                label={getString('pipeline.artifactImagePathLabel')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactPath`)}
                name={`${path}.artifacts.${artifactPath}.spec.artifactPath`}
                placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                useValue
                helperText={getHelpeTextForTags(
                  {
                    repository: repositoryValue as string,
                    connectorRef: connectorRefValue
                  },
                  getString,
                  isGenericArtifactory,
                  getString('pipeline.artifactOrImagePathDependencyRequired')
                )}
                multiTypeInputProps={{
                  expressions,
                  allowableTypes,
                  selectProps: {
                    noResults: <NoTagResults tagError={imagePathError} isServerlessDeploymentTypeSelected={false} />,
                    itemRenderer: artifactPathItemRenderer,
                    items: artifactPaths,
                    allowCreatingNewItems: true
                  },
                  onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    if (
                      e?.target?.type !== 'text' ||
                      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                      isArtifactDisabled()
                    ) {
                      return
                    }
                    refetchImagePathData()
                  }
                }}
              />
              {getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.artifactPath`)) ===
                MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  className={css.configureOptions}
                  style={{ alignSelf: 'center' }}
                  value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.artifactPath`)}
                  type="String"
                  variableName="artifactPath"
                  showRequiredField={false}
                  isReadonly={readonly}
                  showDefaultField={true}
                  isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
                  showAdvanced={true}
                  onChange={value => {
                    formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.artifactPath`, value)
                  }}
                />
              )}
            </div>
          )}

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
