/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import { FormInput, Layout, MultiTypeInputType, SelectOption, Text } from '@wings-software/uicore'
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
  useGetRegionsForGoogleArtifactRegistry
} from 'services/cd-ng'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { TriggerDefaultFieldList } from '@triggers/components/Triggers/utils'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../artifactSourceUtils'
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
    isSidecar
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

  const connectorRefValue =
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.connectorRef`) || get(artifact, `spec.connectorRef`)
  const packageValue =
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.package`) || get(artifact, `spec.package`)
  const projectValue =
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.project`) || get(artifact, `spec.project`)
  const regionValue =
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.region`) || get(artifact, `spec.region`)
  const repositoryNameValue =
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.repositoryName`) || get(artifact, `spec.repositoryName`)

  const {
    data: buildsDetail,
    refetch: refetchBuildDetails,
    loading: fetchingBuilds,
    error
  } = useGetBuildDetailsForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      package: packageValue,
      project: projectValue,
      region: regionValue,
      repositoryName: repositoryNameValue
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
        <Layout.Vertical key={artifactPath}>
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.project`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.project`}
              label={getString('projectLabel')}
              placeholder={getString('pipeline.artifactsSelection.projectPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.project`)}
              multiTextInputProps={{
                width: 391,
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <FormInput.MultiTypeInput
              label={getString('regionLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              useValue
              placeholder={getString('pipeline.regionPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.region`)}
              multiTypeInputProps={{
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.region`, type),
                width: 391,
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
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.repositoryName`}
              label={getString('common.repositoryName')}
              placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repositoryName`)}
              multiTextInputProps={{
                width: 391,
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.package`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.package`}
              label={getString('pipeline.testsReports.callgraphField.package')}
              placeholder={getString('pipeline.manifestType.packagePlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.package`)}
              multiTextInputProps={{
                width: 391,
                expressions,
                allowableTypes
              }}
            />
          )}
          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTypeInput
              selectItems={getBuildDetails()}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.version`)}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
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
                  items: getBuildDetails(),
                  allowCreatingNewItems: true
                },
                onFocus: () => {
                  refetchBuildDetails({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue,
                      package: packageValue,
                      project: projectValue,
                      region: regionValue,
                      repositoryName: repositoryNameValue
                    }
                  })
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
              disabled={readonly}
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
