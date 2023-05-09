/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import { Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  GARBuildDetailsDTO,
  RegionGar,
  SidecarArtifact,
  useGetBuildDetailsForGoogleArtifactRegistry,
  useGetBuildDetailsForGoogleArtifactRegistryV2,
  useGetLastSuccessfulBuildForGoogleArtifactRegistryV2,
  useGetRegionsForGoogleArtifactRegistry
} from 'services/cd-ng'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { TriggerDefaultFieldList } from '@triggers/components/Triggers/utils'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity
} from '../artifactSourceUtils'
import DigestField from '../ArtifactSourceRuntimeFields/DigestField'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'
interface JenkinsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: JenkinsRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
    readonly,
    allowableTypes,
    artifactPath,
    initialValues,
    accountId,
    stageIdentifier,
    projectIdentifier,
    orgIdentifier,
    artifact,
    repoIdentifier,
    branch,
    fromTrigger,
    isSidecar,
    serviceIdentifier,
    stepViewType,
    pipelineIdentifier,
    artifacts,
    useArtifactV1Data = false
  } = props

  const { getString } = useStrings()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const { expressions } = useVariablesExpression()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const { CD_NG_DOCKER_ARTIFACT_DIGEST } = useFeatureFlags()

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const versionValue = get(initialValues?.artifacts, `${artifactPath}.spec.version`, '')

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const packageValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.package`, ''), artifact?.spec?.package),
    get(initialValues?.artifacts, `${artifactPath}.spec.package`)
  )
  const projectValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.project`, ''), artifact?.spec?.project),
    get(initialValues?.artifacts, `${artifactPath}.spec.project`)
  )
  const regionValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.region`, ''), artifact?.spec?.region),
    get(initialValues?.artifacts, `${artifactPath}.spec.region`)
  )
  const repositoryNameValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.repositoryName`, ''), artifact?.spec?.repositoryName),
    get(initialValues?.artifacts, `${artifactPath}.spec.repositoryName`)
  )

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: buildsV1Detail,
    refetch: refetchBuildV1Details,
    loading: fetchingV1Builds,
    error: fetchingV1BuildsError
  } = useGetBuildDetailsForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      package: getFinalQueryParamValue(packageValue),
      project: getFinalQueryParamValue(projectValue),
      region: getFinalQueryParamValue(regionValue),
      repositoryName: getFinalQueryParamValue(repositoryNameValue)
    }
  })

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)
  const pipelineRuntimeYaml = getYamlData(formik?.values, stepViewType as StepViewType, path as string)

  const {
    data: buildsV2Detail,
    refetch: refetchBuildV2Details,
    loading: fetchingV2Builds,
    error: fetchingV2BuildsError
  } = useMutateAsGet(useGetBuildDetailsForGoogleArtifactRegistryV2, {
    lazy: true,
    body: pipelineRuntimeYaml,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      package: getFinalQueryParamValue(packageValue),
      project: getFinalQueryParamValue(projectValue),
      region: getFinalQueryParamValue(regionValue),
      repositoryName: getFinalQueryParamValue(repositoryNameValue),
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
        'version',
        serviceIdentifier as string,
        isMultiService
      )
    }
  })

  const { refetchBuildDetails, fetchingBuilds, error, buildsDetail } = useArtifactV1Data
    ? {
        refetchBuildDetails: refetchBuildV1Details,
        fetchingBuilds: fetchingV1Builds,
        error: fetchingV1BuildsError,
        buildsDetail: buildsV1Detail
      }
    : {
        refetchBuildDetails: refetchBuildV2Details,
        fetchingBuilds: fetchingV2Builds,
        error: fetchingV2BuildsError,
        buildsDetail: buildsV2Detail
      }
  const digestQueryParams = {
    ...commonParams,
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    package: getFinalQueryParamValue(packageValue),
    project: getFinalQueryParamValue(projectValue),
    region: getFinalQueryParamValue(regionValue),
    repositoryName: getFinalQueryParamValue(repositoryNameValue),
    tag: getFinalQueryParamValue(versionValue),
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
      'digest',
      serviceIdentifier as string,
      isMultiService
    )
  }
  const {
    data: digestData,
    loading: fetchingDigest,
    refetch: fetchDigest,
    error: digestError
  } = useMutateAsGet(useGetLastSuccessfulBuildForGoogleArtifactRegistryV2, {
    body: { version: versionValue, runtimeInputYaml: pipelineRuntimeYaml },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...digestQueryParams,
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
        'digest',
        serviceIdentifier as string,
        isMultiService
      )
    },
    lazy: true
  })

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingBuilds}
        onClick={handleClick}
      />
    </div>
  ))

  const selectItems = useMemo(() => {
    return buildsDetail?.data?.buildDetailsList?.map((builds: GARBuildDetailsDTO) => ({
      value: defaultTo(builds.version, ''),
      label: defaultTo(builds.version, '')
    }))
  }, [buildsDetail?.data])

  const getBuildDetails = (): { label: string; value: string }[] => {
    if (fetchingBuilds) {
      return [{ label: 'Loading Builds...', value: 'Loading Builds...' }]
    }
    return defaultTo(selectItems, [])
  }

  const { data: regionData } = useGetRegionsForGoogleArtifactRegistry({})

  useEffect(() => {
    if (regionData?.data) {
      setRegions(
        regionData?.data?.map((item: RegionGar) => {
          return { label: item.name, value: item.value } as SelectOption
        })
      )
    }
  }, [regionData])

  const isFieldDisabled = (fieldName: string): boolean => {
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
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.project`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.project`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.project`}
              label={getString('pipelineSteps.projectIDLabel')}
              placeholder={getString('pipeline.artifactsSelection.projectIDPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.project`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.region`}
              template={template}
              label={getString('regionLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              useValue
              placeholder={getString('pipeline.regionPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.region`)}
              multiTypeInputProps={{
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.region`, type),
                expressions,
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !readonly,
                  items: defaultTo(regions, [])
                },
                allowableTypes
              }}
              selectItems={regions}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.repositoryName`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.repositoryName`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.repositoryName`}
              label={getString('common.repositoryName')}
              placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repositoryName`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.package`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.package`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.package`}
              label={getString('pipeline.testsReports.callgraphField.package')}
              placeholder={getString('pipeline.manifestType.packagePlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.package`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.version`}
              template={template}
              selectItems={getBuildDetails()}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.version`)}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={error}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getBuildDetails(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchBuildDetails()
                }
              }}
            />
          )}

          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.version`}
              template={template}
              label={getString('version')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.versionRegex`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.versionRegex`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.versionRegex`}
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}

          {!fromTrigger &&
            CD_NG_DOCKER_ARTIFACT_DIGEST &&
            isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
              <div className={css.inputFieldLayout}>
                <DigestField
                  {...props}
                  fetchingDigest={fetchingDigest}
                  fetchDigestError={digestError}
                  fetchDigest={fetchDigest}
                  expressions={expressions}
                  stageIdentifier={stageIdentifier}
                  digestData={digestData}
                  disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.digest`)}
                />
              </div>
            )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class GoogleArtifactRegistrySource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry
  protected isSidecar = false

  isTagsSelectionDisabled(_props: ArtifactSourceRenderProps): boolean {
    return false
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
