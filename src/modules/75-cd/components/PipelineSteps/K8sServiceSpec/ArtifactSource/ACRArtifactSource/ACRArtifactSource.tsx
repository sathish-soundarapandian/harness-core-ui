/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import {
  ExpressionAndRuntimeTypeProps,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  MultiTypeInputValue,
  SelectOption,
  Text
} from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { SidecarArtifact, useGetACRRegistriesForService, useGetACRRepositoriesForService } from 'services/cd-ng'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useGetBuildDetailsForAcrArtifact } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/ACRArtifactSource/hooks/useGetBuildDetailsForAcrArtifact'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useGetSubscriptionsForAcrArtifact } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/ACRArtifactSource/hooks/useGetSubscriptionsForAcrArtifact'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getScopeAppendedToIdentifier } from '@common/utils/StringUtils'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { getValue } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags,
  shouldFetchTagsSource
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface ACRRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}

const Content = (props: ACRRenderContent): JSX.Element => {
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
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const { expressions } = useVariablesExpression()
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [registries, setRegistries] = React.useState<SelectOption[]>([])
  const [repositories, setRepositories] = React.useState<SelectOption[]>([])

  const [lastQueryData, setLastQueryData] = React.useState<{
    connectorRef: string
    subscriptionId: string
    registry: string
    repository: string
  }>({
    connectorRef: '',
    subscriptionId: '',
    registry: '',
    repository: ''
  })

  const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined
  const resolvedArtifactPath = defaultTo(
    isSidecar
      ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
      : artifactPath,
    ''
  )

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  const getFqnPathForEntity = (entityName: string): string =>
    getFqnPath(
      path as string,
      !!isPropagatedStage,
      stageIdentifier,
      resolvedArtifactPath,
      entityName,
      serviceIdentifier as string,
      isMultiService
    )
  const subscriptionsFqnPath = getFqnPathForEntity('subscriptionId')
  const registryFqnPath = getFqnPathForEntity('registry')
  const repositoryFqnPath = getFqnPathForEntity('repository')

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const subscriptionIdValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.subscriptionId`, ''), artifact?.spec?.subscriptionId),
    get(initialValues?.artifacts, `${artifactPath}.spec.subscriptionId`, '')
  )
  const registryValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.registry`, ''), artifact?.spec?.registry),
    get(initialValues?.artifacts, `${artifactPath}.spec.registry`, '')
  )
  const repositoryValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.repository`, ''), artifact?.spec?.repository),
    get(initialValues?.artifacts, `${artifactPath}.spec.repository`, '')
  )

  const { fetchTags, fetchingTags, fetchTagsError, acrTagsData } = useGetBuildDetailsForAcrArtifact({
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    subscriptionId: getFinalQueryParamValue(subscriptionIdValue),
    registry: getFinalQueryParamValue(registryValue),
    repository: getFinalQueryParamValue(repositoryValue),
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    useArtifactV1Data,
    formik,
    path,
    initialValues,
    isPropagatedStage,
    serviceId,
    isSidecar,
    artifactPath,
    stageIdentifier,
    pipelineIdentifier,
    stepViewType
  })

  const { subscriptionsData, refetchSubscriptions, loadingSubscriptions, subscriptionsError } =
    useGetSubscriptionsForAcrArtifact({
      connectorRef: artifact?.spec?.connectorRef,
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId,
      useArtifactV1Data,
      subscriptionsFqnPath
    })

  useEffect(() => {
    if (getMultiTypeFromValue(artifact?.spec?.connectorRef) === MultiTypeInputType.FIXED) {
      if (useArtifactV1Data) {
        refetchSubscriptions({
          queryParams: {
            connectorRef: artifact?.spec?.connectorRef,
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          }
        })
      } else {
        refetchSubscriptions({
          queryParams: {
            connectorRef: artifact?.spec?.connectorRef,
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            serviceId,
            fqnPath: subscriptionsFqnPath
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.spec?.connectorRef, artifact?.spec?.subscriptionId])

  useEffect(() => {
    const subscriptionValues = [] as SelectOption[]
    defaultTo(subscriptionsData?.data?.subscriptions, []).map(sub =>
      subscriptionValues.push({ label: `${sub.subscriptionName}: ${sub.subscriptionId}`, value: sub.subscriptionId })
    )

    setSubscriptions(subscriptionValues as SelectOption[])
  }, [subscriptionsData])

  const {
    data: registriesData,
    refetch: refetchRegistries,
    loading: loadingRegistries,
    error: registriesError
  } = useGetACRRegistriesForService({
    queryParams: {
      connectorRef: artifact?.spec?.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      subscriptionId: artifact?.spec?.subscriptionId,
      serviceId,
      fqnPath: registryFqnPath
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (
      getMultiTypeFromValue(artifact?.spec?.connectorRef) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(artifact?.spec?.subscriptionId) === MultiTypeInputType.FIXED
    ) {
      refetchRegistries({
        queryParams: {
          connectorRef: artifact?.spec?.connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscriptionId: artifact?.spec?.subscriptionId,
          serviceId,
          fqnPath: registryFqnPath
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.spec?.connectorRef, artifact?.spec?.subscriptionId])

  useEffect(() => {
    const options =
      defaultTo(registriesData?.data?.registries, []).map(registry => ({
        label: registry.registry,
        value: registry.registry
      })) || /* istanbul ignore next */ []
    setRegistries(options)
  }, [registriesData])

  const {
    data: repositoriesData,
    refetch: refetchRepositories,
    loading: loadingRepositories,
    error: repositoriesError
  } = useGetACRRepositoriesForService({
    queryParams: {
      connectorRef: artifact?.spec?.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      subscriptionId: artifact?.spec?.subscriptionId,
      registry: artifact?.spec?.registry,
      serviceId,
      fqnPath: repositoryFqnPath
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (
      getMultiTypeFromValue(artifact?.spec?.connectorRef) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(artifact?.spec?.subscriptionId) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(artifact?.spec?.registry) === MultiTypeInputType.FIXED
    ) {
      refetchRepositories({
        queryParams: {
          connectorRef: artifact?.spec?.connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscriptionId: artifact?.spec?.subscriptionId,
          registry: artifact?.spec?.registry,
          serviceId,
          fqnPath: repositoryFqnPath
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.spec?.connectorRef, artifact?.spec?.subscriptionId, artifact?.spec?.registry])

  useEffect(() => {
    const options =
      defaultTo(repositoriesData?.data?.repositories, []).map(repo => ({
        label: repo.repository,
        value: repo.repository
      })) || /* istanbul ignore next */ []
    setRepositories(options)
  }, [repositoriesData])

  const fetchTagsEnabled = (): void => {
    if (canFetchTags()) {
      setLastQueryData({
        connectorRef: connectorRefValue,
        subscriptionId: subscriptionIdValue,
        registry: registryValue,
        repository: repositoryValue
      })

      fetchTags()
    }
  }

  const canFetchTags = (): boolean => {
    return (
      (!acrTagsData?.data && !fetchTagsError) ||
      ((lastQueryData.connectorRef !== connectorRefValue ||
        lastQueryData.subscriptionId !== subscriptionIdValue ||
        lastQueryData.registry !== registryValue ||
        lastQueryData.repository !== repositoryValue) &&
        shouldFetchTagsSource([connectorRefValue, subscriptionIdValue, registryValue, repositoryValue]))
    )
  }

  const isFieldDisabled = (fieldName: string, isTag = false): boolean => {
    if (
      readonly ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        /* istanbul ignore next */ isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    if (isTag) {
      return isTagsSelectionDisabled(props)
    }
    return false
  }

  const getItemRenderer = memoize((item: SelectOption, { handleClick }: IItemRendererProps, disabled: boolean) => {
    return (
      <div key={item.label.toString()}>
        <Menu.Item
          text={
            <Layout.Horizontal spacing="small">
              <Text>{item.label}</Text>
            </Layout.Horizontal>
          }
          disabled={disabled}
          onClick={handleClick}
        />
      </div>
    )
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
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              onChange={
                /* istanbul ignore next */ (value, _valueType, type) => {
                  resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)
                  const { record, scope } = value as unknown as { record: ConnectorReferenceDTO; scope: Scope }
                  const connectorRef = getScopeAppendedToIdentifier(record?.identifier, scope)
                  if (record && type === MultiTypeInputType.FIXED) {
                    if (useArtifactV1Data) {
                      refetchSubscriptions({
                        queryParams: {
                          connectorRef,
                          accountIdentifier: accountId,
                          orgIdentifier,
                          projectIdentifier
                        }
                      })
                    } else {
                      refetchSubscriptions({
                        queryParams: {
                          connectorRef,
                          accountIdentifier: accountId,
                          orgIdentifier,
                          projectIdentifier,
                          serviceId,
                          fqnPath: subscriptionsFqnPath
                        }
                      })
                    }
                  } else {
                    setSubscriptions([])
                    setRegistries([])
                    setRepositories([])
                  }
                }
              }
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.subscriptionId`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.subscriptionId`}
              template={template}
              formik={formik}
              disabled={loadingSubscriptions || isFieldDisabled(`artifacts.${artifactPath}.spec.subscriptionId`)}
              multiTypeInputProps={{
                onChange: /* istanbul ignore next */ (
                  value: ExpressionAndRuntimeTypeProps['value'],
                  _typeValue: MultiTypeInputValue,
                  type: MultiTypeInputType
                ) => {
                  resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)
                  if ((value as SelectOption)?.value && type === MultiTypeInputType.FIXED) {
                    const connectorRef = defaultTo(
                      get(formik?.values, `${path}.artifacts.${artifactPath}.spec.connectorRef`),
                      artifact?.spec?.connectorRef
                    )
                    refetchRegistries({
                      queryParams: {
                        connectorRef,
                        accountIdentifier: accountId,
                        orgIdentifier,
                        projectIdentifier,
                        subscriptionId: getValue(value),
                        serviceId,
                        fqnPath: registryFqnPath
                      }
                    })
                  } else {
                    setRegistries([])
                    setRepositories([])
                  }
                },
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !(loadingSubscriptions || readonly),
                  itemRenderer: (item: SelectOption, eventProps: IItemRendererProps) =>
                    getItemRenderer(item, eventProps, loadingSubscriptions),
                  noResults: (
                    <Text padding={'small'}>
                      {get(subscriptionsError, 'data.message', null) || getString('pipeline.ACR.subscriptionError')}
                    </Text>
                  ),
                  items: subscriptions
                },
                expressions,
                allowableTypes
              }}
              useValue
              selectItems={subscriptions}
              label={getString('pipeline.ACR.subscription')}
              placeholder={
                loadingSubscriptions
                  ? /* istanbul ignore next */ getString('loading')
                  : getString('pipeline.ACR.subscriptionPlaceholder')
              }
              name={`${path}.artifacts.${artifactPath}.spec.subscriptionId`}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.registry`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.registry`}
              template={template}
              formik={formik}
              disabled={loadingRegistries || isFieldDisabled(`artifacts.${artifactPath}.spec.registry`)}
              multiTypeInputProps={{
                onChange: /* istanbul ignore next */ (
                  value: ExpressionAndRuntimeTypeProps['value'],
                  _typeValue: MultiTypeInputValue,
                  type: MultiTypeInputType
                ) => {
                  resetTags(formik.values, `${path}.artifacts.${artifactPath}.spec.tag`)

                  if ((value as SelectOption)?.value && type === MultiTypeInputType.FIXED) {
                    const connectorRef = defaultTo(
                      get(formik?.values, `${path}.artifacts.${artifactPath}.spec.connectorRef`),
                      artifact?.spec?.connectorRef
                    )
                    const subscriptionId = defaultTo(
                      get(formik.values, `${path}.artifacts.${artifactPath}.spec.subscriptionId`),
                      artifact?.spec?.subscriptionId
                    )
                    refetchRepositories({
                      queryParams: {
                        connectorRef,
                        accountIdentifier: accountId,
                        orgIdentifier,
                        projectIdentifier,
                        subscriptionId,
                        serviceId,
                        fqnPath: repositoryFqnPath,
                        registry: getValue(value)
                      }
                    })
                  } else {
                    setRepositories([])
                  }
                },
                selectProps: {
                  allowCreatingNewItems: true,
                  items: registries,
                  itemRenderer: (item: SelectOption, eventProps: IItemRendererProps) =>
                    getItemRenderer(item, eventProps, loadingRegistries),
                  addClearBtn: !(loadingRegistries || readonly),
                  noResults: (
                    <Text padding={'small'}>
                      {get(registriesError, 'data.message', null) || getString('pipeline.ACR.registryError')}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
              useValue
              selectItems={registries}
              label={getString('pipeline.ACR.registry')}
              placeholder={
                loadingRegistries
                  ? /* istanbul ignore next */ getString('loading')
                  : getString('pipeline.ACR.registryPlaceholder')
              }
              name={`${path}.artifacts.${artifactPath}.spec.registry`}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.repository`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.repository`}
              template={template}
              formik={formik}
              disabled={loadingRepositories || isFieldDisabled(`artifacts.${artifactPath}.spec.repository`)}
              multiTypeInputProps={{
                onChange: /* istanbul ignore next */ () =>
                  resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !(loadingRepositories || readonly),
                  itemRenderer: (item: SelectOption, eventProps: IItemRendererProps) =>
                    getItemRenderer(item, eventProps, loadingRepositories),
                  items: repositories,
                  noResults: (
                    <Text padding={'small'}>
                      {get(repositoriesError, 'data.message', null) || getString('pipeline.ACR.repositoryError')}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
              useValue
              selectItems={repositories}
              label={getString('repository')}
              placeholder={
                loadingRepositories
                  ? /* istanbul ignore next */ getString('loading')
                  : getString('pipeline.ACR.repositoryPlaceholder')
              }
              name={`${path}.artifacts.${artifactPath}.spec.repository`}
            />
          )}
          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <FormInput.MultiTextInput
              label={getString('tagLabel')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.tag`}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <ArtifactTagRuntimeField
              {...props}
              isFieldDisabled={() => isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
              fetchingTags={fetchingTags}
              buildDetailsList={/* istanbul ignore next */ acrTagsData?.data?.buildDetailsList}
              fetchTagsError={fetchTagsError}
              fetchTags={fetchTagsEnabled}
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

export class ACRArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Acr
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { initialValues, artifactPath, artifact } = props

    const isConnectorPresent = getDefaultQueryParam(
      artifact?.spec?.connectorRef,
      get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
    )
    const isSubscriptionPresent = getDefaultQueryParam(
      artifact?.spec?.subscriptionId,
      get(initialValues, `artifacts.${artifactPath}.spec.subscriptionId`, '')
    )
    const isRegistryPresent = getDefaultQueryParam(
      artifact?.spec?.registry,
      get(initialValues, `artifacts.${artifactPath}.spec.registry`, '')
    )
    const isRepositoryPresent = getDefaultQueryParam(
      artifact?.spec?.repository,
      get(initialValues, `artifacts.${artifactPath}.spec.repository`, '')
    )

    return !(isConnectorPresent && isSubscriptionPresent && isRegistryPresent && isRepositoryPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    /* istanbul ignore next */
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
