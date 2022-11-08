/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import { FormInput, Layout, MultiTypeInputType, Text } from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TriggerDefaultFieldList } from '@triggers/components/Triggers/utils'
import {
  BuildDetails,
  GithubPackageDTO,
  SidecarArtifact,
  useGetPackagesFromGithubWithServiceV2,
  useGetVersionsFromPackagesWithServiceV2
} from 'services/cd-ng'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { getFqnPath, getYamlData, isFieldfromTriggerTabDisabled, isNewServiceEnvEntity } from '../artifactSourceUtils'
import css from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactConnector.module.scss'

interface JenkinsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: JenkinsRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    path,
    readonly,
    allowableTypes,
    isSidecar,
    artifactPath,
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    artifact,
    initialValues,
    formik,
    fromTrigger,
    serviceIdentifier,
    stageIdentifier,
    pipelineIdentifier,
    stepViewType
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`),
    get(artifact, `spec.connectorRef`)
  )
  const orgValue = defaultTo(get(initialValues?.artifacts, `${artifactPath}.spec.org`), get(artifact, `spec.org`))
  const packageNameValue = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.packageName`),
    get(artifact, `spec.packageName`)
  )
  const packageTypeValue = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.packageType`),
    get(artifact, `spec.packageType`)
  )

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const {
    data: packageDetails,
    refetch: refetchPackageDetails,
    loading: fetchingPackages,
    error
  } = useMutateAsGet(useGetPackagesFromGithubWithServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: defaultTo(connectorRefValue, ''),
      packageType: defaultTo(packageTypeValue, ''),
      org: orgValue,
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
        'packageName'
      )
    }
  })

  const {
    data: versionDetails,
    refetch: refetchVersionDetails,
    loading: fetchingVersion,
    error: errorFetchingVersion
  } = useMutateAsGet(useGetVersionsFromPackagesWithServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      packageType: defaultTo(packageTypeValue, ''),
      packageName: defaultTo(packageNameValue, ''),
      connectorRef: defaultTo(connectorRefValue, ''),
      versionRegex: '*',
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

  const selectPackageItems = useMemo(() => {
    return packageDetails?.data?.githubPackageResponse?.map((packageInfo: GithubPackageDTO) => ({
      value: defaultTo(packageInfo.packageName, ''),
      label: defaultTo(packageInfo.packageName, '')
    }))
  }, [packageDetails?.data])

  const selectVersionItems = useMemo(() => {
    return versionDetails?.data?.map((packageInfo: BuildDetails) => ({
      value: defaultTo(packageInfo.number, ''),
      label: defaultTo(packageInfo.number, '')
    }))
  }, [versionDetails?.data])

  const getPackages = (): { label: string; value: string }[] => {
    if (fetchingPackages) {
      return [{ label: 'Loading Packages...', value: 'Loading Packages...' }]
    }
    return defaultTo(selectPackageItems, [])
  }

  const getVersions = (): { label: string; value: string }[] => {
    if (fetchingVersion) {
      return [{ label: 'Loading Versions...', value: 'Loading Versions...' }]
    }
    return defaultTo(selectVersionItems, [])
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingPackages}
        onClick={handleClick}
      />
    </div>
  ))

  const versionItemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingVersion}
        onClick={handleClick}
      />
    </div>
  ))

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
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.org`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.org`}
              label={getString('projectsOrgs.orgName')}
              onChange={() => {
                if (isFieldRuntime(`artifacts.${artifactPath}.spec.packageName`, template))
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.packageName`, '')
              }}
              placeholder={getString('pipeline.artifactsSelection.orgNamePlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.org`)}
              multiTextInputProps={{
                width: 391,
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.packageName`, template) && (
            <FormInput.MultiTypeInput
              selectItems={getPackages()}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.packageName`)}
              name={`${path}.artifacts.${artifactPath}.spec.packageName`}
              label={getString('pipeline.artifactsSelection.packageName')}
              placeholder={getString('pipeline.manifestType.packagePlaceholder')}
              useValue
              multiTypeInputProps={{
                width: 391,
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
                  items: getPackages(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchPackageDetails()
                }
              }}
            />
          )}
          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTypeInput
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.version`)}
              selectItems={getVersions()}
              useValue
              multiTypeInputProps={{
                expressions,
                width: 391,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={errorFetchingVersion}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noVersion')}
                    />
                  ),
                  itemRenderer: versionItemRenderer,
                  items: getVersions(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchVersionDetails()
                }
              }}
            />
          )}
          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTextInput
              label={getString('version')}
              multiTextInputProps={{
                width: 391,
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.versionRegex`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.versionRegex`}
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.versionRegex`)}
              multiTextInputProps={{
                width: 391,
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

export class GithubPackageRegistrySource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.GithubPackageRegistry
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
