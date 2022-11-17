/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get } from 'lodash-es'

import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useTags } from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import MultiTypeTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeTagSelector'
import { amiFilters } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { getDefaultQueryParam } from '../artifactSourceUtils'
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
    projectIdentifier,
    orgIdentifier,
    artifact,
    repoIdentifier,
    branch
  } = props

  const { getString } = useStrings()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const [tags, setTags] = useState<SelectOption[]>([])
  const { expressions } = useVariablesExpression()

  const connectorRefValue = getDefaultQueryParam(
    artifact?.spec?.connectorRef,
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const regionValue = getDefaultQueryParam(
    artifact?.spec?.region,
    get(initialValues?.artifacts, `${artifactPath}.spec.region`, '')
  )

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const {
    data: tagsData,
    loading: isTagsLoading,
    refetch: refetchTags,
    error: tagsError
  } = useTags({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: regionValue,
      awsConnectorRef: connectorRefValue
    },
    lazy: true
  })

  useEffect(() => {
    if (getMultiTypeFromValue(regionValue) === MultiTypeInputType.FIXED && regionValue) {
      refetchTags()
    }
  }, [regionValue])

  useEffect(() => {
    const tagOption = get(tagsData, 'data', []).map((tagItem: string) => ({
      value: tagItem,
      label: tagItem
    }))
    setTags(tagOption)
  }, [tagsData])

  useEffect(() => {
    const regionValues = defaultTo(regionData?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

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
              disabled={readonly}
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <FormInput.MultiTypeInput
              label={getString('regionLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              useValue
              placeholder={getString('pipeline.regionPlaceholder')}
              multiTypeInputProps={{
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.region`, type),
                width: 500,
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.amiTags`, template) && (
            <MultiTypeTagSelector
              name={`${path}.artifacts.${artifactPath}.spec.amiTags`}
              className="tags-select"
              expressions={expressions}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              tags={tags}
              label={'AMI Tags'}
              isLoadingTags={isTagsLoading}
              initialTags={get(initialValues?.artifacts, `${artifactPath}.spec.amiTags`, '')}
              errorMessage={get(tagsError, 'data.message', '')}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.amiFilters`, template) && (
            <MultiTypeTagSelector
              name={`${path}.artifacts.${artifactPath}.spec.amiFilters`}
              className="tags-select"
              expressions={expressions}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              label={'AMI Filters'}
              tags={amiFilters}
              initialTags={get(initialValues?.artifacts, `${artifactPath}.spec.amiFilters`, '')}
              errorMessage={get(tagsError, 'data.message', '')}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class AmazonMachineImageSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.AmazonMachineImage
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
