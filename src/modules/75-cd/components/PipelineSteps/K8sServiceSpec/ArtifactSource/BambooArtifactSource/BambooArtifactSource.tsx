/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import {
  getMultiTypeFromValue,
  Layout,
  MultiSelectOption,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  BuildDetails,
  SidecarArtifact,
  useGetPlansKey,
  useGetArtifactPathsForBamboo,
  useGetBuildsForBamboo,
  BambooPlanNames
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  getYamlData,
  isFieldfromTriggerTabDisabled
} from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

interface BambooRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: BambooRenderContent): React.ReactElement => {
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
    // serviceIdentifier,

    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath,
    artifacts
    // stepViewType
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [planDetails, setPlanDetails] = useState<SelectOption[]>([])
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const [build, setBambooBuilds] = useState<SelectOption[]>([])
  // const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const getFqnPathForEntity = (entityName: string): string =>
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
      entityName
    )

  const planFqnPath = getFqnPathForEntity('planKey')
  // const artifactPathsFqnPath = getFqnPathForEntity('artifactPaths')
  // const buildsFqnPath = getFqnPathForEntity('builds')

  const refetchingAllowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION] as MultiTypeInputType[]

  const [connectorRefValue, setConnectorRefValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
        get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
      )
    )
  )

  const [planKey] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.planKey`, ''), artifact?.spec?.plankey),
        get(initialValues?.artifacts, `${artifactPath}.spec.planKey`, '')
      )
    )
  )

  const [artifactPathValue, setArtifactPathValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        getValidInitialValuePath(
          get(artifacts, `${artifactPath}.spec.artifactPaths`, ''),
          artifact?.spec?.artifactPaths
        ),
        get(initialValues?.artifacts, `${artifactPath}.spec.artifactPaths`, '')
      )
    )
  )

  const getEncodedValue = (value: string): string => {
    return encodeURIComponent(value)
  }

  // const pipelineRuntimeYaml = getYamlData(formik?.values, stepViewType as StepViewType, path as string)

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.

  const {
    refetch: refetchPlans,
    data: plansResponse,
    loading: loadingPlans,
    error: plansError
  } = useGetPlansKey({
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },

    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),
      fqnPath: planFqnPath
    },
    lazy: true
  })

  const {
    refetch: refetchArtifactPaths,
    data: artifactPathsResponse,
    loading: fetchingArtifacts
    // error: errorFetchingPath
  } = useGetArtifactPathsForBamboo({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    },
    planName: planKey ? getEncodedValue(planKey) : ''
  })

  const {
    refetch: refetchJenkinsBuild,
    data: bambooBuildResponse,
    loading: fetchingBuild
    //  error: errorFetchingBuild
  } = useGetBuildsForBamboo({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    },
    planName: planKey ? getEncodedValue(planKey) : ''
  })

  useEffect(() => {
    if (artifactPathsResponse?.data) {
      const artifactPathResponseFormatted: MultiSelectOption[] = artifactPathsResponse?.data?.map(
        (artifactPathVal: string) => {
          return {
            label: artifactPathVal,
            value: artifactPathVal
          } as MultiSelectOption
        }
      )
      setArtifactPaths(artifactPathResponseFormatted)
    }
  }, [artifactPathsResponse])

  useEffect(() => {
    if (bambooBuildResponse?.data) {
      const jenkinsBuildsResponseFormatted: MultiSelectOption[] = bambooBuildResponse?.data?.map(
        (jenkinsBuild: BuildDetails) => {
          return {
            label: jenkinsBuild.uiDisplayName,
            value: jenkinsBuild.number
          } as MultiSelectOption
        }
      )
      setBambooBuilds(jenkinsBuildsResponseFormatted)
    }
  }, [bambooBuildResponse])

  useEffect(() => {
    if (plansResponse?.data?.planKeys) {
      const planOptions: SelectOption[] = (plansResponse?.data?.planKeys || [])?.map((plan: BambooPlanNames) => {
        return {
          label: plan.name,
          value: plan.name
        } as SelectOption
      }) || [
        {
          label: 'Loading plans ...',
          value: 'Loading plans ...'
        }
      ]
      setPlanDetails(planOptions)
    }
  }, [plansResponse?.data?.planKeys])

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

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime
  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingPlans} />
  ))
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
              onChange={value => {
                if (value) {
                  const { record } = value as unknown as { record: ConnectorReferenceDTO }
                  if (record) {
                    setConnectorRefValue(record?.identifier)
                  } else {
                    setConnectorRefValue(value as string)
                  }
                } else {
                  setConnectorRefValue(undefined)
                }
                setPlanDetails([])
                setArtifactPaths([])
                setBambooBuilds([])
              }}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.planKey`, template) && (
            <SelectInputSetView
              formik={formik}
              selectItems={
                loadingPlans
                  ? [
                      {
                        label: getString('pipeline.artifactsSelection.loadingDigest'),
                        value: getString('pipeline.artifactsSelection.loadingDigest')
                      }
                    ]
                  : planDetails
              }
              useValue
              multiTypeInputProps={{
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  /* istanbul ignore next */
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }

                  refetchPlans()
                },
                selectProps: {
                  items: loadingPlans
                    ? [
                        {
                          label: getString('pipeline.artifactsSelection.loadingDigest'),
                          value: getString('pipeline.artifactsSelection.loadingDigest')
                        }
                      ]
                    : planDetails,
                  usePortal: true,
                  addClearBtn: !readonly,
                  noResults: <Text lineClamp={1}>{plansError}</Text>,
                  itemRenderer,
                  allowCreatingNewItems: true,
                  popoverClassName: css.selectPopover,
                  loadingItems: loadingPlans
                },
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.bamboo.planName')}
              name={`${path}.artifacts.${artifactPath}.spec.planKey`}
              fieldPath={`artifacts.${artifactPath}.spec.planKey`}
              template={template}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactPaths`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.artifactPaths`}
              template={template}
              label={getString('pipeline.artifactPathLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.artifactPaths`}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactPaths`)}
              placeholder={
                fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder')
              }
              multiTypeInputProps={{
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.artifactPaths`, type),
                width: 400,
                expressions,
                allowableTypes,
                onChange: (newFilePath: any) => {
                  const artifacthPath = typeof newFilePath === 'string' ? newFilePath : newFilePath?.value
                  setArtifactPathValue(artifacthPath)
                  setBambooBuilds([])
                },
                onClick: () => {
                  if (
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(planKey, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(connectorRefValue, allowableTypes))
                  ) {
                    refetchArtifactPaths()
                  }
                },
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !readonly,
                  items: defaultTo(artifactPaths, [])
                }
              }}
              selectItems={artifactPaths || []}
            />
          )}
          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.build`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.build`}
              template={template}
              label={getString('pipeline.bambooBuilds')}
              name={`${path}.artifacts.${artifactPath}.spec.build`}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.build`)}
              useValue
              placeholder={fetchingBuild ? getString('loading') : getString('pipeline.selectBambooBuildsPlaceholder')}
              multiTypeInputProps={{
                onClick: () => {
                  if (
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(connectorRefValue, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(planKey, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(artifactPathValue, allowableTypes))
                  ) {
                    refetchJenkinsBuild()
                  }
                },
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.build`, type),
                width: 400,
                expressions,
                allowableTypes,
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !readonly,
                  items: defaultTo(build, [])
                }
              }}
              selectItems={build || []}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class BambooArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  isTagsSelectionDisabled(_props: ArtifactSourceRenderProps): boolean {
    return false
  }

  protected artifactType = ENABLED_ARTIFACT_TYPES.Bamboo
  protected isSidecar = false

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
