/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useEffect, useRef, useState } from 'react'

import {
  Text,
  FontVariation,
  Layout,
  Container,
  Formik,
  FormikForm as Form,
  Color,
  PageSpinner,
  useToaster,
  FormInput,
  Button,
  RadioButtonGroup,
  IconName,
  Icon
} from '@harness/uicore'
import type { FormikContextType, FormikProps } from 'formik'
import { cloneDeep, cloneDeepWith, defaultTo, get, isEmpty, isEqual, omit, set, unset } from 'lodash-es'
import produce from 'immer'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { StringKeys, useStrings } from 'framework/strings'
import {
  ArtifactConfig,
  ArtifactListConfig,
  ArtifactSource,
  ConnectorInfoDTO,
  FileStoreNodeDTO,
  ManifestConfig,
  ManifestConfigWrapper,
  ServiceRequestDTO,
  useCreateServiceV2,
  UserRepoResponse,
  useUpdateServiceV2
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import type { ManifestStores, ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ManifestStoreMap, manifestTypeIcons } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import {
  BinaryLabels,
  cleanServiceDataUtil,
  getUniqueEntityIdentifier,
  newServiceState,
  ServiceDataType
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import InHarnessFileStore from './ManifestRepoTypes/InHarnessFileStore/InHarnessFileStore'
import { SelectGitProvider, SelectGitProviderRefInstance } from './ManifestRepoTypes/SelectGitProvider'
import { AllSaaSGitProviders, StepStatus } from '../DeployProvisioningWizard/Constants'
import { SelectRepository } from '../SelectArtifact/SelectRepository'
import { ProvideManifest } from './ManifestRepoTypes/ProvideManifest'
import ArtifactSelection from './ArtifactSelection/ArtifactSelection'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import moduleCss from './ConfigureService.module.scss'
export interface ConfigureServiceRefInstance {
  submitForm?: FormikProps<ConfigureServiceInterface>['submitForm']
}

export interface ConfigureServiceInterface {
  serviceRef: string
  manifestData: ManifestConfig // for type can be moved outside
  manifestStoreType: ManifestStores
  repository?: UserRepoResponse
  manifestConfig: ManifestConfigWrapper
  artifactToDeploy: string
  artifactData: ArtifactListConfig
  artifactType: ArtifactSource['type']
  artifactConfig: ArtifactConfig
  fileNodesData: FileStoreNodeDTO[]
}
interface ConfigureServiceProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
  onSuccess: () => void
}

export type ConfigureServiceForwardRef =
  | ((instance: ConfigureServiceRefInstance | null) => void)
  | React.MutableRefObject<ConfigureServiceRefInstance | null>
  | null

const allowableManifestTypes = ['K8sManifest', 'HelmChart'] as ManifestTypes[]
const manifestTypeLabels: Record<string, StringKeys> = {
  K8sManifest: 'kubernetesText',
  HelmChart: 'cd.getStartedWithCD.helm'
}
const DefaultManifestStepStatus = new Map<string, StepStatus>([
  ['Connector', StepStatus.InProgress],
  ['Repository', StepStatus.ToDo],
  ['ManifestDetails', StepStatus.ToDo]
])

const ConfigureServiceRef = (
  props: ConfigureServiceProps,
  forwardRef: ConfigureServiceForwardRef
): React.ReactElement => {
  const { getString } = useStrings()
  const { disableNextBtn, enableNextBtn, onSuccess } = props
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()

  const [manifestStepStatus, setManifestStepStatus] = useState<Map<string, StepStatus>>(DefaultManifestStepStatus)
  const [serviceIdentifier, setServiceIdentifier] = useState<string | undefined>(get(serviceData, 'identifier'))
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { loading: createLoading, mutate: createService } = useCreateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: updateService } = useUpdateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const [editService, setEditService] = useState(false)

  const { showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const formikRef = useRef<FormikContextType<ConfigureServiceInterface>>()
  const selectGitProviderRef = React.useRef<SelectGitProviderRefInstance | null>(null)

  const validationSchema = Yup.object().shape({
    serviceRef: Yup.string()
      .required(getString('validation.identifierRequired'))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers)
  })

  // initial service creation from onboarding
  const createServiceOnLoad = async (): Promise<void> => {
    const serviceRef = formikRef?.current?.values?.serviceRef
    const isServiceNameUpdated = isEmpty(get(serviceData, 'identifier'))

    if (isServiceNameUpdated) {
      const serviceRefIdentifier = getUniqueEntityIdentifier(serviceRef)

      setServiceIdentifier(serviceRefIdentifier)
      const updatedContextService = produce(serviceData, draft => {
        if (draft) {
          set(draft, 'name', serviceRef)
          set(draft, 'identifier', isServiceNameUpdated ? serviceRefIdentifier : get(serviceData, 'identifier'))
          set(draft, 'serviceDefinition.type', 'Kubernetes')
        }
      })

      const cleanServiceData = cleanServiceDataUtil(updatedContextService as ServiceRequestDTO)
      !isEmpty(updatedContextService) && saveServiceData(updatedContextService as ServiceDataType)

      try {
        const response = await createService({ ...cleanServiceData, orgIdentifier, projectIdentifier })
        if (response.status === 'SUCCESS') {
          clear()
        } else {
          throw response
        }
      } catch (error: any) {
        showError(getRBACErrorMessage(error))
      }
    }
  }
  React.useEffect(() => {
    // initial service creation from onboarding
    createServiceOnLoad()
  }, [])

  const handleSubmit = async (): Promise<ConfigureServiceInterface> => {
    const manifestConfig = formikRef?.current?.values?.manifestConfig
    const manifestType = formikRef?.current?.values?.manifestData?.type as ManifestTypes
    try {
      const artifactObj = get(serviceData, 'serviceDefinition.spec.artifacts') as ArtifactListConfig
      const updatedArtifactObj = produce(artifactObj, draft => {
        if (draft) {
          set(draft, 'primary.sources[0].type', formikRef?.current?.values?.artifactType)
          set(draft, 'primary.primaryArtifactRef', artifactObj?.primary?.sources?.[0]?.identifier)
        }
      })

      const helmVersionPath = 'serviceDefinition.spec.manifests[0].manifest.spec.helmVersion'
      // setting default value
      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        set(draft, 'serviceDefinition.spec.manifests[0]', manifestConfig)
        manifestType === 'K8sManifest' ? unset(draft, helmVersionPath) : set(draft, helmVersionPath, 'V2')
        // omit artifactConfig if artifact to deploy is no
        formikRef.current?.values?.artifactToDeploy === BinaryLabels.YES
          ? set(draft, 'serviceDefinition.spec.artifacts', updatedArtifactObj)
          : unset(draft, 'serviceDefinition.spec.artifacts')
        set(draft, 'identifier', serviceIdentifier)
      })

      saveServiceData(updatedContextService)

      const serviceBody = { service: { ...omit(cloneDeepWith(updatedContextService), 'data') } }
      if (isEqual(serviceBody, { service: { ...omit(serviceData, 'data') } })) {
        props?.onSuccess?.()
        return Promise.resolve(formikRef?.current?.values as ConfigureServiceInterface)
      }
      const body = {
        ...omit(cloneDeep(serviceBody.service), 'serviceDefinition', 'gitOpsEnabled'),
        projectIdentifier,
        orgIdentifier,
        yaml: yamlStringify({ ...serviceBody })
      }

      const response = await updateService(body)
      if (response.status !== 'SUCCESS') {
        throw response
      }
      onSuccess()
      return Promise.resolve(formikRef?.current?.values as ConfigureServiceInterface)
    } catch (e: any) {
      showError(getRBACErrorMessage(e))
      return Promise.resolve({} as ConfigureServiceInterface)
    }
  }

  useEffect(() => {
    const serviceRef = formikRef?.current?.values?.serviceRef
    const gitValues = selectGitProviderRef?.current?.values
    const manifestValues = omit(formikRef?.current?.values, 'repository')
    const gitTestConnectionStatus = isEqual(get(serviceData, 'data.gitValues'), gitValues)
      ? get(serviceData, 'data.gitConnectionStatus')
      : selectGitProviderRef.current?.testConnectionStatus
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'name', serviceRef)
      set(draft, 'identifier', serviceIdentifier)
      set(draft, 'data.gitValues', gitValues)
      set(draft, 'data.manifestValues', manifestValues)
      set(draft, 'data.artifactType', formikRef?.current?.values?.artifactType)
      set(draft, 'data.manifestData', formikRef?.current?.values?.manifestData)
      set(draft, 'data.gitConnectionStatus', gitTestConnectionStatus)
      set(draft, 'data.gitConnectionStatus', gitTestConnectionStatus)
      set(draft, 'data.gitConnectionStatus', gitTestConnectionStatus)
    })
    saveServiceData(updatedContextService)

    if (formikRef.current?.values) {
      if (!forwardRef) {
        return
      }
      if (typeof forwardRef === 'function') {
        return
      }

      if (formikRef.current.values) {
        forwardRef.current = {
          submitForm: formikRef?.current?.submitForm
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formikRef?.current?.values,
    formikRef?.current?.setFieldTouched,
    selectGitProviderRef?.current?.values,
    serviceIdentifier
  ])

  useEffect(() => {
    if (formikRef.current?.values) {
      if (!forwardRef) {
        return
      }
      if (typeof forwardRef === 'function') {
        return
      }
      if (formikRef.current.values) {
        forwardRef.current = {
          submitForm: formikRef?.current?.submitForm
        }
      }
    }
  }, [formikRef?.current?.values, forwardRef])

  const supportedManifestTypes = React.useMemo(
    () =>
      allowableManifestTypes?.map(manifest => ({
        label: getString(manifestTypeLabels[manifest]),
        icon: manifestTypeIcons[manifest] as IconName,
        value: manifest
      })),
    [getString]
  )

  const specifyManifestType = (formikProps: FormikProps<ConfigureServiceInterface>): JSX.Element | null => {
    return (
      <>
        <Layout.Vertical padding={{ top: 'xxlarge' }}>
          <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
            {getString('cd.getStartedWithCD.manifestTypeSelection')}
          </Text>
          <RadioButtonGroup
            name="manifest-type-selection"
            inline={true}
            selectedValue={formikProps?.values?.manifestData?.type}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              formikProps?.setFieldValue('manifestData.type', e.currentTarget.value)
            }}
            options={supportedManifestTypes}
            margin={{ bottom: 'small' }}
            asPills
            className={css.radioButton}
          />
        </Layout.Vertical>
        <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
      </>
    )
  }

  const onManifestStoreSelection = (type: ManifestStores | ConnectorInfoDTO['type']): void => {
    formikRef?.current?.setFieldValue('manifestStoreType', type)
    // reset connector details, artifact details
    setManifestStepStatus(DefaultManifestStepStatus)
    selectGitProviderRef.current = null
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'data.gitValues', {})
      set(draft, 'data.manifestStoreType', type)
      unset(draft, 'data.gitConnectionStatus')
      unset(draft, 'data.connectorRef')
      unset(draft, 'serviceDefinition.spec.manifest[0]')
      set(draft, 'serviceDefinition.spec.artifacts', newServiceState.serviceDefinition.spec.artifacts)
    })
    formikRef?.current?.setFieldValue('repository', undefined)
    formikRef?.current?.setFieldValue(
      'gitProvider',
      AllSaaSGitProviders.find(store => store.type === type) || undefined
    )
    saveServiceData(updatedContextService)
  }

  const selectManifestStore = (formikProps: FormikProps<ConfigureServiceInterface>): JSX.Element | null => {
    return (
      <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
        <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
          {getString('cd.getStartedWithCD.manifestTypeSelection')}
        </Text>
        <Layout.Horizontal>
          <Button
            className={css.authMethodBtn}
            round
            text={'In Harness FileStore'}
            onClick={() => {
              onManifestStoreSelection(ManifestStoreMap.Harness)
            }}
            padding="large"
            intent={formikProps?.values?.manifestStoreType === ManifestStoreMap.Harness ? 'primary' : 'none'}
          />

          <Container className={css.verticalSeparation} margin={{ left: 'medium' }} />
          {AllSaaSGitProviders.map(manifestStore => {
            return (
              <Button
                key={manifestStore.type}
                className={css.authMethodBtn}
                round
                inline
                text={getString(manifestStore.label)}
                onClick={() => {
                  onManifestStoreSelection(manifestStore.type)
                }}
                intent={formikProps?.values?.manifestStoreType === manifestStore.type ? 'primary' : 'none'}
              />
            )
          })}
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }

  const onRepositoryChange = async (repository: UserRepoResponse | undefined): Promise<void> => {
    if (repository) {
      formikRef.current?.setFieldValue('repository', repository)
      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        set(draft, 'data.repoValues', repository)
      })
      saveServiceData(updatedContextService)
      updateManifestStepStatus(['Repository'], StepStatus.Success)
      updateManifestStepStatus(['ManifestDetails'], StepStatus.InProgress)
    } else {
      updateManifestStepStatus(['Repository'], StepStatus.InProgress)
      updateManifestStepStatus(['ManifestDetails'], StepStatus.ToDo)
    }
  }

  const updateManifestStepStatus = React.useCallback((stepIds: string[], status: StepStatus) => {
    if (Array.isArray(stepIds)) {
      setManifestStepStatus((prevState: Map<string, StepStatus>) => {
        const clonedState = new Map(prevState)
        stepIds.forEach((item: string) => clonedState.set(item, status))
        return clonedState
      })
    }
  }, [])

  const onConnectorSuccess = (connectionStatus: number, conectorResponse: any): void => {
    const { validate } = selectGitProviderRef.current || {}
    if (validate?.()) {
      updateManifestStepStatus(['Connector'], StepStatus.Success)
      updateManifestStepStatus(['Repository'], StepStatus.InProgress)

      const gitValues = selectGitProviderRef?.current?.values
      const gitTestConnectionStatus = isEqual(get(serviceData, 'data.gitValues'), gitValues)
        ? get(serviceData, 'data.gitConnectionStatus')
        : connectionStatus
      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        set(draft, 'data.gitValues', gitValues)
        set(draft, 'data.gitConnectionStatus', gitTestConnectionStatus)
        set(draft, 'data.connectorRef', conectorResponse)
      })
      saveServiceData(updatedContextService)
    }
  }

  const getInitialValues = React.useCallback((): ConfigureServiceInterface => {
    const initialRepoValue = get(serviceData, 'data.repoValues')
    const manifestStoreType = get(serviceData, 'data.manifestStoreType', ManifestStoreMap.Harness)
    const manifestConfig = get(serviceData, 'serviceDefinition.spec.manifests[0]')
    const manifestData = get(serviceData, 'data.manifestData')
    const artifactConfig = get(serviceData, 'serviceDefinition.spec.artifacts.primary.sources[0].spec')
    const artifactData = get(serviceData, 'data.artifactData')
    const artifactType = get(serviceData, 'data.artifactType')

    return {
      serviceRef: defaultTo(get(serviceData, 'name'), ''),
      repository: initialRepoValue,
      manifestData: isEmpty(manifestData) ? { type: allowableManifestTypes[0] } : manifestData,
      manifestStoreType,
      artifactToDeploy: BinaryLabels.YES,
      artifactConfig,
      manifestConfig,
      artifactData,
      artifactType: defaultTo(artifactType, 'DockerRegistry'),
      fileNodesData: defaultTo(get(serviceData, 'data.fileNodesData'), [])
    }
  }, [get(serviceData, 'serviceDefinition.spec.manifests[0].manifest', {})])

  const onFileStoreSuccess = (): void => {
    updateManifestStepStatus(['Repository'], StepStatus.Success)
    updateManifestStepStatus(['ManifestDetails'], StepStatus.Success)
  }

  useEffect(() => {
    if (!isEmpty(serviceData?.data?.gitValues)) {
      updateManifestStepStatus(['Connector'], StepStatus.Success)
    }
    if (!isEmpty(serviceData?.data?.repoValues)) {
      updateManifestStepStatus(['Repository'], StepStatus.Success)
      updateManifestStepStatus(['ManifestDetails'], StepStatus.InProgress)
    }
  }, [serviceData, updateManifestStepStatus])

  return createLoading ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical width="70%">
      <Formik<ConfigureServiceInterface>
        initialValues={getInitialValues()}
        formName="cdWorkload-provider"
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Layout.Vertical width="70%">
                <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_600}>
                    {getString('cd.getStartedWithCD.configureService')}
                  </Text>
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    {editService ? (
                      <FormInput.Text name="serviceRef" className={css.formInput} style={{ marginBottom: 0 }} />
                    ) : (
                      <Text>{formikProps?.values?.serviceRef}</Text>
                    )}

                    <Button
                      icon={editService ? 'cross' : 'Edit'}
                      data-testid="edit-service-name"
                      // disabled={readonly}
                      onClick={() => setEditService(!editService)}
                      minimal
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
                <Container className={css.borderBottomClass} padding={{ top: 'large' }} />

                {specifyManifestType(formikProps)}
                {formikProps?.values?.manifestData?.type && selectManifestStore(formikProps)}
                {formikProps?.values?.manifestStoreType && (
                  <Container padding="xxlarge" className={moduleCss.connectorContainer}>
                    {formikProps?.values?.manifestStoreType === ManifestStoreMap.Harness ? (
                      <InHarnessFileStore onSuccess={onFileStoreSuccess} formikProps={formikProps} />
                    ) : (
                      <Layout.Vertical>
                        <Layout.Horizontal
                          margin={{ bottom: 'large' }}
                          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                        >
                          <Icon
                            name={
                              AllSaaSGitProviders.find(
                                provider => formikProps?.values?.manifestStoreType === provider.type
                              )?.icon || 'github'
                            }
                            size={28}
                            flex
                          />
                          <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'large' }}>
                            {`${getString('cd.getStartedWithCD.connectTo')} ${getString(
                              AllSaaSGitProviders.find(
                                provider => formikProps?.values?.manifestStoreType === provider.type
                              )?.label || 'common.repo_provider.githubLabel'
                            )}`}
                          </Text>
                        </Layout.Horizontal>
                        <ul className={moduleCss.progress}>
                          <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                            <SelectGitProvider
                              ref={selectGitProviderRef}
                              gitValues={get(serviceData, 'data.gitValues', {})}
                              selectedGitProvider={
                                AllSaaSGitProviders.find(
                                  store => store.type === formikProps?.values?.manifestStoreType
                                ) || undefined
                              }
                              connectionStatus={get(serviceData, 'data.gitConnectionStatus', TestStatus.NOT_INITIATED)}
                              onSuccess={onConnectorSuccess}
                            />
                          </li>
                          {manifestStepStatus.get('Repository') !== StepStatus.ToDo && (
                            <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                              <SelectRepository
                                selectedRepository={formikProps.values?.repository}
                                validatedConnectorRef={
                                  get(serviceData, 'data.gitValues.gitProvider.type') ||
                                  selectGitProviderRef.current?.values?.gitProvider?.type
                                }
                                onChange={onRepositoryChange}
                              />
                            </li>
                          )}
                          {manifestStepStatus.get('ManifestDetails') !== StepStatus.ToDo && (
                            <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                              <ProvideManifest
                                formikProps={formikProps}
                                initialValues={get(serviceData, 'serviceDefinition.spec.manifests[0].manifest', {})}
                              />
                            </li>
                          )}
                        </ul>
                      </Layout.Vertical>
                    )}
                  </Container>
                )}
                <>
                  <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
                  {/* ARTIFACT SELECTION */}
                  <ArtifactSelection
                    formikProps={formikProps}
                    enableNextBtn={enableNextBtn}
                    disableNextBtn={disableNextBtn}
                  />
                </>
              </Layout.Vertical>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const ConfigureService = React.forwardRef(ConfigureServiceRef)

// TODO:: stepStatus artifact update when coming back
