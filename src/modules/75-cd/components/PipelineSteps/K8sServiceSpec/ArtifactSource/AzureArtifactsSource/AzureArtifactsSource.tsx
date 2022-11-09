/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'
import { FormInput, Layout, SelectOption, Text } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  AzureArtifactsFeed,
  AzureArtifactsPackage,
  AzureDevopsProject,
  BuildDetails,
  SidecarArtifact,
  useListFeedsForAzureArtifactsWithServiceV2,
  useListPackagesForAzureArtifactsWithServiceV2,
  useListProjectsForAzureArtifactsWithServiceV2,
  useListVersionsFromPackageWithServiceV2
} from 'services/cd-ng'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getDefaultQueryParam,
  getFqnPath,
  getImagePath,
  getYamlData,
  isArtifactSourceRuntime,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags
} from '../artifactSourceUtils'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface AzureArtifactsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: AzureArtifactsRenderContent): React.ReactElement => {
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
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath,
    serviceIdentifier,
    stepViewType,
    pipelineIdentifier
  } = props

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const connectorRefValue = defaultTo(
    artifact?.spec?.connectorRef,
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )

  const scopeValue = defaultTo(get(initialValues?.artifacts, `${artifactPath}.spec.scope`), artifact?.spec?.scope)

  const projectValue = defaultTo(get(initialValues?.artifacts, `${artifactPath}.spec.project`), artifact?.spec?.project)

  const feedValue = defaultTo(get(initialValues?.artifacts, `${artifactPath}.spec.feed`), artifact?.spec?.feed)

  const packageValue = defaultTo(get(initialValues?.artifacts, `${artifactPath}.spec.package`), artifact?.spec?.package)

  const packageTypeValue = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.packageType`),
    artifact?.spec?.packageType
  )

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const requestBody = {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  }

  const getItems = (isFetching: boolean, label: string, items: SelectOption[]): SelectOption[] => {
    if (isFetching) {
      return [{ label: `Loading ${label}...`, value: `Loading ${label}...` }]
    }
    return defaultTo(items, [])
  }

  const {
    refetch: refetchProjects,
    data: projectsResponse,
    loading: fetchingProjects
  } = useMutateAsGet(useListProjectsForAzureArtifactsWithServiceV2, {
    ...requestBody,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      org: 'automation-cdc',
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
        'project'
      )
    }
  })

  const projectItems: SelectOption[] = useMemo(() => {
    return (
      projectsResponse?.data?.map(
        (project: AzureDevopsProject) =>
          ({
            value: defaultTo(project.name, ''),
            label: defaultTo(project.name, '')
          } as SelectOption)
      ) || []
    )
  }, [projectsResponse?.data])

  const {
    refetch: refetchFeeds,
    data: feedsResponse,
    loading: fetchingFeeds,
    error: fetchingFeedsError
  } = useMutateAsGet(useListFeedsForAzureArtifactsWithServiceV2, {
    ...requestBody,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      project: projectValue,
      org: '',
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
        'feed'
      )
    }
  })

  const feedItems: SelectOption[] = useMemo(() => {
    return (
      feedsResponse?.data?.map(
        (feed: AzureArtifactsFeed) =>
          ({
            value: defaultTo(feed.name, ''),
            label: defaultTo(feed.name, '')
          } as SelectOption)
      ) || []
    )
  }, [feedsResponse?.data])

  const {
    refetch: refetchPackages,
    data: packagesResponse,
    loading: fetchingPackages,
    error: fetchingPackageError
  } = useMutateAsGet(useListPackagesForAzureArtifactsWithServiceV2, {
    ...requestBody,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      org: '',
      packageType: packageTypeValue,
      project: projectValue,
      feed: feedValue,
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
        'package'
      )
    }
  })

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingVersions || fetchingFeeds || fetchingPackages || fetchingProjects}
        onClick={handleClick}
      />
    </div>
  ))

  const packageItems: SelectOption[] = useMemo(() => {
    return (
      packagesResponse?.data?.map(
        (packageItem: AzureArtifactsPackage) =>
          ({
            value: defaultTo(packageItem.name, ''),
            label: defaultTo(packageItem.name, '')
          } as SelectOption)
      ) || []
    )
  }, [packagesResponse?.data])

  const {
    refetch: refetchVersions,
    data: versionResponse,
    loading: fetchingVersions,
    error: fetchingVersionError
  } = useMutateAsGet(useListVersionsFromPackageWithServiceV2, {
    ...requestBody,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      org: '',
      packageType: packageTypeValue,
      feed: feedValue,
      package: packageValue,
      project: projectValue,
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
        'version'
      )
    }
  })

  const versionItems: SelectOption[] = useMemo(() => {
    return (
      versionResponse?.data?.map(
        (buildItem: BuildDetails) =>
          ({
            value: defaultTo(buildItem.number, ''),
            label: defaultTo(buildItem.number, '')
          } as SelectOption)
      ) || []
    )
  }, [versionResponse?.data])

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
          {scopeValue === 'project' && isFieldRuntime(`artifacts.${artifactPath}.spec.project`, template) && (
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingProjects, 'Projects', projectItems)}
              // disabled={isFeedDisabled()}
              name={`${path}.artifacts.${artifactPath}.spec.project`}
              label={getString('projectLabel')}
              placeholder={getString('pipeline.artifactsSelection.projectPlaceholder')}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  itemRenderer: itemRenderer,
                  items: getItems(fetchingProjects, 'Projects', projectItems),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchProjects()
                }
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.feed`, template) && (
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingFeeds, 'Feeds', feedItems)}
              //   disabled={isFeedDisabled()}
              name={`${path}.artifacts.${artifactPath}.spec.feed`}
              label={getString('pipeline.artifactsSelection.feed')}
              placeholder={getString('pipeline.artifactsSelection.feedPlaceholder')}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={fetchingFeedsError}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noFeeds')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getItems(fetchingFeeds, 'Feeds', feedItems),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchFeeds()
                }
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.package`, template) && (
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingPackages, 'Packages', packageItems)}
              // disabled={isFeedDisabled()}
              name={`${path}.artifacts.${artifactPath}.spec.package`}
              label={getString('pipeline.artifactsSelection.packageName')}
              placeholder={getString('pipeline.artifactsSelection.packageNamePlaceholder')}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={fetchingPackageError}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noPackage')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getItems(fetchingPackages, 'Packages', packageItems),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchPackages()
                }
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingVersions, 'Versions', versionItems)}
              // disabled={isFeedDisabled()}
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
                      tagError={fetchingVersionError}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getItems(fetchingVersions, 'Versions', versionItems),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchVersions()
                }
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.versionRegex`, template) && (
            <FormInput.MultiTextInput
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
        </Layout.Vertical>
      )}
    </>
  )
}

export class AzureArtifactsSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.AzureArtifacts
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
