/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo, get, isNil, memoize } from 'lodash-es'

import { getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { AMITagObject, BuildDetails, useListVersionsForAMIArtifact } from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { amiFilters, isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useListTagsForAmiArtifactMutation } from 'services/cd-ng-rq'
import MultiTypeArrayTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeArrayTagSelector'

import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  getYamlData,
  isNewServiceEnvEntity
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
    readonly,
    allowableTypes,
    artifactPath,
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    artifact,
    repoIdentifier,
    branch,
    stepViewType,
    pipelineIdentifier,
    serviceIdentifier,
    stageIdentifier,
    isSidecar,
    artifacts
  } = props

  const { getString } = useStrings()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const [tags, setTags] = useState<SelectOption[]>([])
  const { expressions } = useVariablesExpression()

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )

  const connectorRefQueryParamValue = getFinalQueryParamValue(connectorRefValue)

  const regionValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.region`, ''), artifact?.spec?.region),
    get(initialValues?.artifacts, `${artifactPath}.spec.region`, '')
  )

  const regionQueryParamValue = getFinalQueryParamValue(regionValue)

  const tagsValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.tags`, ''), artifact?.spec?.tags),
    get(initialValues?.artifacts, `${artifactPath}.spec.tags`, '')
  )

  const tagsValueQueryParamValue = getFinalQueryParamValue(tagsValue) && tagsValue

  const filterValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.filters`, ''), artifact?.spec?.filters),
    get(initialValues?.artifacts, `${artifactPath}.spec.filters`, '')
  )

  const filterValueQueryParamValue = getFinalQueryParamValue(filterValue) && filterValue

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  const getFqnPathForEntity = (entity: string): string =>
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
      entity,
      serviceIdentifier as string,
      isMultiService
    )

  const { data: regionData, loading: fetchingRegions } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const {
    data: versionDetails,
    loading: isVersionLoading,
    refetch: refetchVersion,
    error: versionError
  } = useMutateAsGet(useListVersionsForAMIArtifact, {
    body: {
      tags: tagsValueQueryParamValue,
      filter: filterValueQueryParamValue,
      runtimeInputYaml: getYamlData(formik?.values, stepViewType as StepViewType, path as string)
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: regionQueryParamValue,
      connectorRef: connectorRefQueryParamValue,
      versionRegex: '*',
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      fqnPath: getFqnPathForEntity('version')
    },
    lazy: true
  })

  const selectVersionItems = useMemo(() => {
    return versionDetails?.data?.map((packageInfo: BuildDetails) => ({
      value: defaultTo(packageInfo.number, ''),
      label: defaultTo(packageInfo.number, '')
    }))
  }, [versionDetails?.data])

  useEffect(() => {
    if (!isNil(formik.values?.version)) {
      if (getMultiTypeFromValue(formik.values?.version) !== MultiTypeInputType.FIXED) {
        formik.setFieldValue('versionRegex', formik.values?.version)
      } else {
        formik.setFieldValue('versionRegex', '')
      }
    }
  }, [formik.values?.version])

  const getVersions = (): SelectOption[] => {
    if (isVersionLoading) {
      return [{ label: 'Loading Versions...', value: 'Loading Versions...' }]
    }
    return defaultTo(selectVersionItems, [])
  }

  const {
    data: tagsData,
    isLoading: isTagsLoading,
    mutate: refetchTags,
    error: tagsError
  } = useListTagsForAmiArtifactMutation({
    queryParams: {
      connectorRef: connectorRefQueryParamValue,
      region: regionQueryParamValue,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      fqnPath: getFqnPathForEntity('tags'),
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      branch: branch,
      repoIdentifier
    },
    body: ''
  })

  useEffect(() => {
    if (getMultiTypeFromValue(regionValue) === MultiTypeInputType.FIXED && regionValue) {
      refetchTags()
    }
  }, [regionValue])

  useEffect(() => {
    if (!isTagsLoading && tagsData?.data) {
      const tagOption = get(tagsData, 'data', []).map((tag: AMITagObject) => {
        const tagName = tag?.tagName as string
        return { label: tagName, value: tagName }
      })

      setTags(tagOption)
    }
  }, [tagsData?.data, isTagsLoading])

  useEffect(() => {
    if (!fetchingRegions && regionData?.resource) {
      const regionValues = defaultTo(regionData?.resource, []).map(region => ({
        value: region.value,
        label: region.name
      }))
      setRegions(regionValues as SelectOption[])
    }
  }, [regionData?.resource, fetchingRegions])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={isVersionLoading}
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
              disabled={readonly}
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.region`}
              template={template}
              label={getString('regionLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              useValue
              placeholder={getString('pipeline.regionPlaceholder')}
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.tags`, template) && (
            <MultiTypeArrayTagSelector
              name={`${path}.artifacts.${artifactPath}.spec.tags`}
              className="tags-select"
              expressions={expressions}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
              tags={tags}
              label={getString('pipeline.amiTags')}
              isLoadingTags={isTagsLoading}
              initialTags={get(initialValues?.artifacts, `${artifactPath}.spec.tags`, '')}
              errorMessage={get(tagsError, 'data.message', '')}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.filters`, template) && (
            <MultiTypeArrayTagSelector
              name={`${path}.artifacts.${artifactPath}.spec.filters`}
              className="tags-select"
              expressions={expressions}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
              label={getString('pipeline.amiFilters')}
              tags={amiFilters}
              initialTags={get(initialValues?.artifacts, `${artifactPath}.spec.filters`, '')}
              errorMessage={get(tagsError, 'data.message', '')}
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
          {isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.version`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              disabled={readonly}
              selectItems={getVersions()}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={versionError}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noVersion')}
                    />
                  ),
                  itemRenderer: itemRenderer,
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
                  refetchVersion()
                }
              }}
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
