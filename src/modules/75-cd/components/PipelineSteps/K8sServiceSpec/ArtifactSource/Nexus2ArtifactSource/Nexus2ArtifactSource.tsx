/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import { Layout, SelectOption, Text } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { useMutateAsGet } from '@common/hooks'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  SidecarArtifact,
  useArtifactIds,
  useGetBuildDetailsForNexusArtifactWithYaml,
  useGetGroupIds,
  useGetRepositories
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { checkIfQueryParamsisNotEmpty } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { queryInterface } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Nexus3Artifact/Nexus3Artifact'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import {
  DefaultParam,
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  getValidInitialValuePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags
} from '../artifactSourceUtils'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
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
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    readonly,
    repoIdentifier,
    branch,
    stageIdentifier,
    isTagsSelectionDisabled,
    pipelineIdentifier,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath,
    serviceIdentifier,
    artifacts,
    stepViewType
  } = props

  const [groupIds, setGroupIds] = useState<SelectOption[]>([])
  const [artifactIds, setArtifactIds] = useState<SelectOption[]>([])
  const { getString } = useStrings()
  const [lastQueryData, setLastQueryData] = useState<queryInterface>({
    connectorRef: '',
    repositoryFormat: '',
    repository: ''
  })
  const { expressions } = useVariablesExpression()

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )

  const repositoryValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.repository`, ''), artifact?.spec?.repository),
    get(initialValues?.artifacts, `${artifactPath}.spec.repository`, '')
  )

  const repositoryFormatValue = getDefaultQueryParam(
    getValidInitialValuePath(
      get(artifacts, `${artifactPath}.spec.repositoryFormat`, ''),
      artifact?.spec?.repositoryFormat
    ),
    get(initialValues?.artifacts, `${artifactPath}.spec.repositoryFormat`, '')
  )
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const artifactIdValue = getDefaultQueryParam(
    getValidInitialValuePath(
      get(artifacts, `${artifactPath}.spec.spec.artifactId`, ''),
      artifact?.spec?.spec?.artifactId
    ),
    get(initialValues?.artifacts, `${artifactPath}.spec.spec.artifactId`, '')
  )

  const groupIdValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.spec.groupId`, ''), artifact?.spec?.spec?.groupId),
    get(initialValues?.artifacts, `${artifactPath}.spec.spec.groupId`, '')
  )

  const extensionValue = getDefaultQueryParam(
    getValidInitialValuePath(
      get(artifacts, `${artifactPath}.spec.spec.extension`, ''),
      artifact?.spec?.spec?.extension
    ),
    get(initialValues?.artifacts, `${artifactPath}.spec.spec.extension`, '')
  )

  const classifierValue = getDefaultQueryParam(
    getValidInitialValuePath(
      get(artifacts, `${artifactPath}.spec.spec.classifier`, ''),
      artifact?.spec?.spec?.classifier
    ),
    get(initialValues?.artifacts, `${artifactPath}.spec.spec.classifier`, '')
  )

  const packageNameValue = getDefaultQueryParam(
    getValidInitialValuePath(
      get(artifacts, `${artifactPath}.spec.spec.packageName`, ''),
      artifact?.spec?.spec?.packageName
    ),
    get(initialValues?.artifacts, `${artifactPath}.spec.spec.packageName`, '')
  )

  const pipelineRuntimeYaml = getYamlData(formik?.values, stepViewType as StepViewType, path as string)

  const {
    data: repositoryDetails,
    refetch: refetchRepositoryDetails,
    loading: fetchingRepository,
    error: errorFetchingRepository
  } = useMutateAsGet(useGetRepositories, {
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      repositoryFormat: getFinalQueryParamValue(repositoryFormatValue),
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
        'repository'
      )
    }
  })

  const groupQueryParams: any = {
    ...commonParams,
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    repository: getFinalQueryParamValue(repositoryValue),
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
      'spec.groupId'
    )
  }

  if (repositoryFormatValue !== DefaultParam) {
    groupQueryParams['repositoryFormat'] = repositoryFormatValue
  }

  const artifactQueryParams: any = {
    ...commonParams,
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    repository: repositoryValue,
    groupId: groupIdValue,
    nexusSourceType: 'Nexus3Registry',
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
      'spec.artifactId'
    )
  }

  if (repositoryFormatValue !== DefaultParam) {
    artifactQueryParams['repositoryFormat'] = repositoryFormatValue
  }

  const {
    data: groupData,
    loading: fetchingGroups,
    error: groupError,
    refetch: refetchGroups
  } = useMutateAsGet(useGetGroupIds, {
    body: pipelineRuntimeYaml,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: groupQueryParams,
    lazy: true,
    debounce: 300
  })

  const {
    data: artifactData,
    loading: fetchingArtifacts,
    error: artifactError,
    refetch: refetchArtifacts
  } = useMutateAsGet(useArtifactIds, {
    body: pipelineRuntimeYaml,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: artifactQueryParams,
    lazy: true,
    debounce: 300
  })

  const selectRepositoryItems = useMemo(() => {
    return repositoryDetails?.data?.map(repository => ({
      value: defaultTo(repository.repositoryId, ''),
      label: defaultTo(repository.repositoryId, '')
    }))
  }, [repositoryDetails?.data])

  const getRepository = (): { label: string; value: string }[] => {
    if (fetchingRepository) {
      return [
        {
          label: getString('pipeline.artifactsSelection.loadingRepository'),
          value: getString('pipeline.artifactsSelection.loadingRepository')
        }
      ]
    }
    return defaultTo(selectRepositoryItems, [])
  }

  useEffect(() => {
    const groupOptions: SelectOption[] = (groupData?.data || [])?.map(group => {
      return {
        label: group,
        value: group
      } as SelectOption
    }) || [
      {
        label: getString('common.loadingFieldOptions', {
          fieldName: getString('common.subscriptions.tabs.plans')
        }),
        value: getString('common.loadingFieldOptions', {
          fieldName: getString('common.subscriptions.overview.plan')
        })
      }
    ]
    setGroupIds(groupOptions)
  }, [groupData?.data])

  useEffect(() => {
    if (groupError) {
      setGroupIds([])
    }
  }, [groupError])

  useEffect(() => {
    if (artifactError) {
      setArtifactIds([])
    }
  }, [artifactError])

  useEffect(() => {
    const artifactOptions: SelectOption[] = (artifactData?.data || [])?.map(item => {
      return {
        label: item,
        value: item
      } as SelectOption
    }) || [
      {
        label: getString('common.loadingFieldOptions', {
          fieldName: getString('common.subscriptions.tabs.plans')
        }),
        value: getString('common.loadingFieldOptions', {
          fieldName: getString('common.subscriptions.overview.plan')
        })
      }
    ]
    setArtifactIds(artifactOptions)
  }, [artifactData?.data])

  const {
    data,
    loading: nexusBuildDetailsLoading,
    refetch: refetchNexusTag,
    error: nexusTagError
  } = useMutateAsGet(useGetBuildDetailsForNexusArtifactWithYaml, {
    body: yamlStringify({
      pipeline: formik?.values
    }),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      repository: getFinalQueryParamValue(repositoryValue),
      repositoryFormat: getFinalQueryParamValue(repositoryFormatValue),
      artifactId: getFinalQueryParamValue(artifactIdValue),
      groupId: getFinalQueryParamValue(groupIdValue),
      extension: getFinalQueryParamValue(extensionValue),
      classifier: getFinalQueryParamValue(classifierValue),
      packageName: getFinalQueryParamValue(packageNameValue),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
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
    },
    lazy: true
  })

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchNexusTag()
    }
  }, [lastQueryData])

  const canFetchTags = (): boolean => {
    return (
      (!data?.data && !nexusTagError) ||
      (repositoryFormatValue === RepositoryFormatTypes.Maven
        ? lastQueryData.repositoryFormat !== repositoryFormatValue ||
          lastQueryData.repository !== repositoryValue ||
          lastQueryData.artifactId !== artifactIdValue ||
          lastQueryData.groupId !== groupIdValue ||
          lastQueryData.extension !== extensionValue ||
          lastQueryData.classifier !== classifierValue
        : lastQueryData.repositoryFormat !== repositoryFormatValue ||
          lastQueryData.repository !== repositoryValue ||
          lastQueryData.packageName !== packageNameValue)
    )
  }
  const fetchTags = (): void => {
    if (canFetchTags()) {
      let repositoryDependentFields: any = {}
      if (repositoryFormatValue === RepositoryFormatTypes.Maven) {
        const optionalFields: any = {}
        if (extensionValue) optionalFields.extension = extensionValue

        if (classifierValue) optionalFields.classifier = classifierValue

        repositoryDependentFields = {
          artifactId: artifactIdValue,
          groupId: groupIdValue,
          ...optionalFields
        }
      } else {
        repositoryDependentFields = {
          packageName: packageNameValue
        }
      }
      setLastQueryData({
        repository: repositoryValue,
        repositoryFormat: repositoryFormatValue,
        ...repositoryDependentFields
      })
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
      return isTagsSelectionDisabled(props)
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
        disabled={fetchingRepository}
        onClick={handleClick}
      />
    </div>
  ))

  const groupItemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingGroups}
        onClick={handleClick}
      />
    </div>
  ))

  const artifactIdItemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingArtifacts}
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
              configureOptionsProps={{ className: css.connectorConfigOptions }}
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.repository`, template) && (
            <SelectInputSetView
              selectItems={getRepository()}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repository`)}
              label={getString('repository')}
              name={`${path}.artifacts.${artifactPath}.spec.repository`}
              placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
              useValue
              fieldPath={`artifacts.${artifactPath}.spec.repository`}
              template={template}
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={errorFetchingRepository}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.errors.noRepositories')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getRepository(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchRepositoryDetails()
                }
              }}
            />
          )}
          <div className={css.inputFieldLayout}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.spec.groupId`, template) && (
              <SelectInputSetView
                selectItems={groupIds}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.groupId`)}
                label={getString('pipeline.artifactsSelection.groupId')}
                name={`${path}.artifacts.${artifactPath}.spec.spec.groupId`}
                placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                useValue
                fieldPath={`artifacts.${artifactPath}.spec.groupId`}
                template={template}
                multiTypeInputProps={{
                  expressions,
                  allowableTypes,
                  selectProps: {
                    noResults: !fetchingGroups ? (
                      <NoTagResults
                        tagError={groupError}
                        isServerlessDeploymentTypeSelected={false}
                        defaultErrorText={getString('pipeline.artifactsSelection.errors.noGroupIds')}
                      />
                    ) : null,
                    itemRenderer: groupItemRenderer,
                    items: groupIds,
                    allowCreatingNewItems: true
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    if (
                      e?.target?.type !== 'text' ||
                      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                    ) {
                      return
                    }
                    refetchGroups()
                  }
                }}
              />
            )}
          </div>
          <div className={css.inputFieldLayout}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.spec.artifactId`, template) && (
              <SelectInputSetView
                selectItems={artifactIds}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactId`)}
                label={getString('pipeline.artifactsSelection.artifactId')}
                name={`${path}.artifacts.${artifactPath}.spec.spec.artifactId`}
                placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                useValue
                fieldPath={`artifacts.${artifactPath}.spec.artifactId`}
                template={template}
                multiTypeInputProps={{
                  expressions,
                  allowableTypes,
                  selectProps: {
                    noResults: !fetchingArtifacts ? (
                      <NoTagResults
                        tagError={artifactError}
                        isServerlessDeploymentTypeSelected={false}
                        defaultErrorText={getString('pipeline.artifactsSelection.errors.noArtifactIds')}
                      />
                    ) : null,
                    itemRenderer: artifactIdItemRenderer,
                    items: artifactIds,
                    allowCreatingNewItems: true
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    if (
                      e?.target?.type !== 'text' ||
                      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                    ) {
                      return
                    }
                    refetchArtifacts()
                  }
                }}
              />
            )}
          </div>

          {isFieldRuntime(`artifacts.${artifactPath}.spec.spec.extension`, template) && (
            <TextFieldInputSetView
              label={getString('pipeline.artifactsSelection.extension')}
              name={`${path}.artifacts.${artifactPath}.spec.spec.extension`}
              placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={`artifacts.${artifactPath}.spec.spec.extension`}
              template={template}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.spec.classifier`, template) && (
            <TextFieldInputSetView
              label={getString('pipeline.artifactsSelection.classifier')}
              name={`${path}.artifacts.${artifactPath}.spec.spec.classifier`}
              placeholder={getString('pipeline.artifactsSelection.classifierPlaceholder')}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={`artifacts.${artifactPath}.spec.spec.classifier`}
              template={template}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.spec.packageName`, template) && (
            <TextFieldInputSetView
              label={getString('pipeline.artifactsSelection.packageName')}
              name={`${path}.artifacts.${artifactPath}.spec.spec.packageName`}
              placeholder={getString('pipeline.manifestType.packagePlaceholder')}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={`artifacts.${artifactPath}.spec.spec.packageName`}
              template={template}
            />
          )}
          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <TextFieldInputSetView
              label={getString('tagLabel')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.tag`}
              fieldPath={`artifacts.${artifactPath}.spec.tag`}
              template={template}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <ArtifactTagRuntimeField
              {...props}
              isFieldDisabled={() => isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
              fetchingTags={nexusBuildDetailsLoading}
              buildDetailsList={data?.data?.buildDetailsList}
              fetchTagsError={nexusTagError}
              fetchTags={fetchTags}
              expressions={expressions}
              stageIdentifier={stageIdentifier}
            />
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
        </Layout.Vertical>
      )}
    </>
  )
}

export class Nexus2ArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Nexus2Registry
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
