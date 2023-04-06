/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useEffect, useRef, useState } from 'react'

import {
  Text,
  Layout,
  Container,
  Formik,
  useToaster,
  FormInput,
  Button,
  RadioButtonGroup,
  IconName,
  Icon,
  FormikForm,
  HarnessDocTooltip,
  ButtonVariation
} from '@harness/uicore'

import { FontVariation, Color } from '@harness/design-system'
import type { FormikContextType, FormikProps } from 'formik'
import { cloneDeep, cloneDeepWith, defaultTo, get, isEmpty, isEqual, omit, set, unset } from 'lodash-es'
import produce from 'immer'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { HelpPanel } from '@harness/help-panel'
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
import {
  ManifestDataType,
  ManifestStoreMap,
  manifestTypeIcons
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { Connectors } from '@connectors/constants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { FeatureFlag } from '@common/featureFlags'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  BinaryValue,
  cleanServiceDataUtil,
  CustomType,
  defaultManifestConfig,
  DeploymentType,
  getUniqueEntityIdentifier,
  newServiceState,
  ONBOARDING_PREFIX,
  ServiceDataType
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import InHarnessFileStore from './ManifestRepoTypes/InHarnessFileStore/InHarnessFileStore'
import { SelectGitProvider, SelectGitProviderRefInstance } from './ManifestRepoTypes/SelectGitProvider'
import { AllSaaSGitProviders, StepStatus } from '../DeployProvisioningWizard/Constants'
import { SelectRepository } from './ManifestRepoTypes/SelectRepository'
import { ProvideManifest } from './ManifestRepoTypes/ProvideManifest'
import ArtifactSelection from './ArtifactSelection/ArtifactSelection'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import moduleCss from './ConfigureService.module.scss'
export interface ConfigureServiceRefInstance {
  submitForm?: FormikProps<ConfigureServiceInterface>['submitForm']
}

export interface ConfigureServiceInterface {
  serviceRef: string
  manifestData: ManifestConfig
  manifestStoreType: ManifestStores
  repository?: UserRepoResponse
  manifestConfig: ManifestConfigWrapper
  artifactToDeploy: string
  artifactData: ArtifactListConfig
  artifactType: ArtifactSource['type'] | CustomType
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

const allowableManifestTypes = [ManifestDataType.K8sManifest, ManifestDataType.HelmChart] as ManifestTypes[]
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
  const { trackEvent } = useTelemetry()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { disableNextBtn, enableNextBtn, onSuccess } = props
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  const isHelpEnabled = useFeatureFlag(FeatureFlag.CD_ONBOARDING_HELP_ENABLED)
  const {
    state: { service: serviceData, delegate: delegateData },
    saveServiceData
  } = useCDOnboardingContext()

  const [manifestStepStatus, setManifestStepStatus] = useState<Map<string, StepStatus>>(DefaultManifestStepStatus)
  const [serviceIdentifier, setServiceIdentifier] = useState<string | undefined>(get(serviceData, 'identifier'))
  const [editService, setEditService] = useState(false)
  const [isServiceStepComplete, setIsServiceStepComplete] = React.useState(false)
  const [isArtifactStepComplete, setIsArtifactStepComplete] = React.useState(false)

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

  React.useEffect(() => {
    if (isServiceStepComplete && isArtifactStepComplete) {
      enableNextBtn()
    } else {
      disableNextBtn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServiceStepComplete, isArtifactStepComplete])

  const updateManifestStepStatus = React.useCallback((stepIds: string[], status: StepStatus) => {
    if (Array.isArray(stepIds)) {
      setManifestStepStatus((prevState: Map<string, StepStatus>) => {
        const clonedState = new Map(prevState)
        stepIds.forEach((item: string) => clonedState.set(item, status))
        return clonedState
      })
    }
  }, [])

  const formikRef = useRef<FormikContextType<ConfigureServiceInterface>>()
  const selectGitProviderRef = React.useRef<SelectGitProviderRefInstance | null>(null)

  const validationSchema = Yup.object().shape({
    serviceRef: Yup.string()
      .required(getString('validation.identifierRequired'))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers)
  })

  const createServiceOnLoad = async (): Promise<void> => {
    const serviceRef = formikRef?.current?.values?.serviceRef
    const isServiceNameUpdated = isEmpty(get(serviceData, 'identifier'))

    if (isServiceNameUpdated && !isEmpty(delegateData?.environmentEntities?.infrastructure)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (): Promise<ConfigureServiceInterface> => {
    const manifestConfig = formikRef?.current?.values?.manifestConfig
    const manifestType = formikRef?.current?.values?.manifestData?.type as ManifestTypes
    try {
      const artifactObj = get(serviceData, 'serviceDefinition.spec.artifacts') as ArtifactListConfig
      const updatedArtifactObj = produce(artifactObj, draft => {
        if (draft) {
          const artifactType =
            formikRef?.current?.values?.artifactType === CustomType.Custom
              ? ENABLED_ARTIFACT_TYPES.DockerRegistry
              : formikRef?.current?.values?.artifactType
          if (isSvcEnvEnabled) {
            set(draft, 'primary.sources[0].type', artifactType)
            set(draft, 'primary.sources[0].spec', formikRef?.current?.values?.artifactConfig?.spec)
            set(draft, 'primary.primaryArtifactRef', formikRef?.current?.values?.artifactConfig?.identifier)
            unset(draft, 'primary.spec')
            unset(draft, 'primary.identifier')
          } else {
            set(draft, 'primary.type', artifactType)
            set(draft, 'primary.spec', formikRef?.current?.values?.artifactConfig?.spec)
            set(draft, 'primary.identifier', formikRef?.current?.values?.artifactConfig?.identifier)
            unset(draft, 'primary.primaryArtifactRef')
            unset(draft, 'primary.sources')
          }
        }
      })

      const helmVersionPath = 'serviceDefinition.spec.manifests[0].manifest.spec.helmVersion'
      const serviceRef = formikRef?.current?.values?.serviceRef
      const serviceRefIdentifier = getUniqueEntityIdentifier(serviceRef)
      // setting default value
      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        set(draft, 'serviceDefinition.spec.manifests[0]', manifestConfig)
        manifestType === 'K8sManifest' ? unset(draft, helmVersionPath) : set(draft, helmVersionPath, 'V2')
        // omit artifactConfig if artifact to deploy is no
        formikRef.current?.values?.artifactToDeploy !== BinaryValue.YES
          ? set(draft, 'serviceDefinition.spec.artifacts', updatedArtifactObj)
          : unset(draft, 'serviceDefinition.spec.artifacts')
        set(draft, 'identifier', defaultTo(serviceIdentifier, serviceRefIdentifier))
        set(draft, 'data.artifactType', formikRef?.current?.values?.artifactType)
        set(draft, 'data.artifactToDeploy', formikRef?.current?.values?.artifactToDeploy)
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
      set(draft, 'data.artifactToDeploy', formikRef?.current?.values?.artifactToDeploy)
      set(draft, 'data.manifestData', formikRef?.current?.values?.manifestData)
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
  }, [serviceIdentifier])

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

  useEffect(() => {
    if (!isEmpty(serviceData?.data?.gitValues?.gitAuthenticationMethod)) {
      updateManifestStepStatus(['Connector'], StepStatus.Success)
      if (!isEmpty(serviceData?.data?.repoValues)) {
        updateManifestStepStatus(['Repository'], StepStatus.Success)
        updateManifestStepStatus(['ManifestDetails'], StepStatus.InProgress)
      }
    } else {
      setManifestStepStatus(DefaultManifestStepStatus)
    }
  }, [serviceData, updateManifestStepStatus])

  const supportedManifestTypes = React.useMemo(
    () =>
      allowableManifestTypes?.map(manifest => ({
        label: getString(manifestTypeLabels[manifest]),
        icon: manifestTypeIcons[manifest] as IconName,
        value: manifest
      })),
    [getString]
  )

  const isSelectedManifestTypeHelm = (): boolean =>
    formikRef?.current?.values?.manifestData?.type === ManifestDataType.HelmChart

  const onManifestTypeSelection = (type: ManifestTypes): void => {
    formikRef?.current?.setFieldValue('manifestData.type', type)
    if (
      type === ManifestDataType.HelmChart &&
      formikRef?.current?.values?.manifestStoreType === ManifestStoreMap.Harness
    ) {
      setIsServiceStepComplete(false)
      formikRef?.current?.setFieldValue('manifestStoreType', Connectors.GITHUB)
      trackEvent(CDOnboardingActions.SelectManifestType, { manifestType: type, deployment_type: DeploymentType.K8s })
      formikRef?.current?.setFieldValue('artifactType', ENABLED_ARTIFACT_TYPES.DockerRegistry)
    }
  }

  const specifyManifestType = (formikProps: FormikProps<ConfigureServiceInterface>): JSX.Element | null => {
    return (
      <>
        <Layout.Vertical padding={{ top: 'large' }}>
          <Text
            font={{ size: 'medium', weight: 'semi-bold' }}
            padding={{ bottom: 'large' }}
            color={Color.GREY_600}
            data-tooltip-id="cdOnboardingManifestType"
          >
            {getString('typeLabel')}
            <HarnessDocTooltip tooltipId="cdOnboardingManifestType" useStandAlone={true} />
          </Text>
          <RadioButtonGroup
            name="manifest-type-selection"
            inline={true}
            selectedValue={formikProps?.values?.manifestData?.type}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              onManifestTypeSelection(e.currentTarget.value as ManifestTypes)
            }}
            options={supportedManifestTypes}
            margin={{ bottom: 'small' }}
            asPills
            className={css.radioButton}
          />
        </Layout.Vertical>
      </>
    )
  }

  const onManifestStoreSelection = (type: ManifestStores | ConnectorInfoDTO['type']): void => {
    formikRef?.current?.setFieldValue('manifestStoreType', type)
    trackEvent(CDOnboardingActions.SelectManifestStore, { manifestStore: type, deployment_type: DeploymentType.K8s })
    // reset connector details, artifact details
    setIsServiceStepComplete(false)
    setManifestStepStatus(DefaultManifestStepStatus)
    selectGitProviderRef.current = null
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'data.manifestStoreType', type)
      unset(draft, 'data.gitValues')
      unset(draft, 'data.repovalues')
      unset(draft, 'data.gitConnectionStatus')
      unset(draft, 'data.connectorRef')
      set(draft, 'serviceDefinition.spec.artifacts', newServiceState.serviceDefinition.spec.artifacts)
    })
    formikRef?.current?.setFieldValue('manifestConfig', defaultManifestConfig)
    formikRef?.current?.setFieldValue('repository', undefined)
    formikRef?.current?.setFieldValue(
      'gitProvider',
      AllSaaSGitProviders.find(store => store.type === type) || undefined
    )
    saveServiceData(updatedContextService)
  }

  const selectManifestStore = (formikProps: FormikProps<ConfigureServiceInterface>): JSX.Element | null => {
    return (
      <Layout.Vertical padding={{ top: 'xlarge', bottom: 'xxlarge' }}>
        <Text
          font={{ size: 'medium', weight: 'semi-bold' }}
          padding={{ bottom: 'large' }}
          color={Color.GREY_600}
          data-tooltip-id="cdOnboardingManifestLocation"
        >
          {getString('cd.azureArm.location')}
          <HarnessDocTooltip tooltipId="cdOnboardingManifestLocation" useStandAlone={true} />
        </Text>
        <Layout.Horizontal>
          <Button
            className={css.authMethodBtn}
            round
            text={getString('cd.getStartedWithCD.sampleManifest')}
            onClick={() => {
              onManifestStoreSelection(ManifestStoreMap.Harness)
              formikProps?.setFieldValue('artifactToDeploy', BinaryValue.YES)
              formikProps?.setFieldValue('artifactType', CustomType.Custom)
            }}
            padding="large"
            intent={formikProps?.values?.manifestStoreType === ManifestStoreMap.Harness ? 'primary' : 'none'}
            disabled={isSelectedManifestTypeHelm()}
          />

          <Container className={css.verticalSeparation} margin={{ left: 'medium' }} />
          <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_500} className={moduleCss.manifestLabel}>
            {getString('cd.getStartedWithCD.useOwnManifest')}
          </Text>
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
                  accessNextBtnOnStoreChange()
                  formikProps?.setFieldValue('artifactType', ENABLED_ARTIFACT_TYPES.DockerRegistry)
                }}
                intent={formikProps?.values?.manifestStoreType === manifestStore.type ? 'primary' : 'none'}
              />
            )
          })}
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }

  const accessNextBtnOnStoreChange = (): void => {
    if (formikRef?.current?.values?.manifestStoreType !== ManifestStoreMap.Harness) {
      setIsServiceStepComplete(!isEmpty(formikRef?.current?.values?.repository))
    }
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
    const manifestConfig = get(serviceData, 'serviceDefinition.spec.manifests[0]', defaultManifestConfig)
    const manifestData = get(serviceData, 'data.manifestData')
    const artifactConfig = get(serviceData, 'serviceDefinition.spec.artifacts.primary.sources[0].spec')
    const artifactData = get(serviceData, 'data.artifactData')
    const artifactType = get(serviceData, 'data.artifactType')

    return {
      serviceRef: defaultTo(get(serviceData, 'name'), ''),
      repository: initialRepoValue,
      manifestData: isEmpty(manifestData) ? { type: allowableManifestTypes[0] } : manifestData,
      manifestStoreType,
      artifactToDeploy: get(serviceData, 'data.artifactToDeploy') || BinaryValue.YES,
      artifactConfig,
      manifestConfig,
      artifactData,
      artifactType: defaultTo(artifactType, CustomType.Custom),
      fileNodesData: defaultTo(get(serviceData, 'data.fileNodesData'), [])
    }
  }, [get(serviceData, 'serviceDefinition.spec.manifests[0].manifest', {})])

  const onFileStoreSuccess = (): void => {
    updateManifestStepStatus(['Repository'], StepStatus.Success)
    updateManifestStepStatus(['ManifestDetails'], StepStatus.Success)
    setIsServiceStepComplete(true)
  }

  const getValidConnectorRef = (): string =>
    get(serviceData, 'data.connectorRef.identifier') ||
    `${selectGitProviderRef.current?.values?.gitProvider?.type}_${ONBOARDING_PREFIX}`

  useEffect(() => {
    if (formikRef?.current?.values?.manifestStoreType !== ManifestStoreMap.Harness) {
      setIsServiceStepComplete(manifestStepStatus.get('ManifestDetails') !== StepStatus.ToDo)
    }
  }, [manifestStepStatus])

  return createLoading ? (
    <ContainerSpinner />
  ) : (
    <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
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
              <FormikForm>
                <Layout.Vertical width="70%" padding={{ bottom: 'huge' }}>
                  <Layout.Vertical>
                    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text
                        font={{ variation: FontVariation.H3 }}
                        color={Color.GREY_600}
                        data-tooltip-id="cdOnboardingConfigureService"
                      >
                        {getString('common.configureService')}
                        <HarnessDocTooltip tooltipId="cdOnboardingConfigureService" useStandAlone={true} />
                      </Text>
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        {editService ? (
                          <FormInput.Text name="serviceRef" className={css.formInput} style={{ marginBottom: 0 }} />
                        ) : (
                          <Text>{formikProps?.values?.serviceRef}</Text>
                        )}

                        <Button
                          icon={editService ? 'tick' : 'Edit'}
                          data-testid="edit-service-name"
                          onClick={() => setEditService(!editService)}
                          variation={ButtonVariation.LINK}
                        />
                      </Layout.Horizontal>
                    </Layout.Horizontal>
                    <Text font="normal" padding={{ top: 'medium' }}>
                      {getString('cd.getStartedWithCD.serviceDescription')}
                    </Text>
                  </Layout.Vertical>

                  <Container className={css.borderBottomClass} padding={{ top: 'medium' }} />

                  {/* Manifest Section */}
                  <Layout.Vertical>
                    <Text
                      font={{ variation: FontVariation.H4 }}
                      padding={{ bottom: 'medium', top: 'xxlarge' }}
                      color={Color.GREY_600}
                      data-tooltip-id="cdOnboardingManifestSection"
                    >
                      {getString('manifestsText')}
                      <HarnessDocTooltip tooltipId="cdOnboardingManifestSection" useStandAlone={true} />
                    </Text>
                    <Text font="normal" margin={{ bottom: 'large' }}>
                      {getString('cd.getStartedWithCD.manifestDescription')}
                    </Text>
                  </Layout.Vertical>
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
                              {getString('cd.getStartedWithCD.connectTo', {
                                entity: getString(
                                  AllSaaSGitProviders.find(
                                    provider => formikProps?.values?.manifestStoreType === provider.type
                                  )?.label || 'common.repo_provider.githubLabel'
                                )
                              })}
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
                                connectionStatus={get(
                                  serviceData,
                                  'data.gitConnectionStatus',
                                  TestStatus.NOT_INITIATED
                                )}
                                onSuccess={onConnectorSuccess}
                              />
                            </li>
                            {manifestStepStatus.get('Repository') !== StepStatus.ToDo && (
                              <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                                <SelectRepository
                                  selectedRepository={formikProps.values?.repository}
                                  validatedConnectorRef={getValidConnectorRef()}
                                  onChange={onRepositoryChange}
                                />
                              </li>
                            )}
                            {manifestStepStatus.get('ManifestDetails') !== StepStatus.ToDo && (
                              <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                                <ProvideManifest />
                              </li>
                            )}
                          </ul>
                        </Layout.Vertical>
                      )}
                    </Container>
                  )}
                  <>
                    <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
                    <ArtifactSelection isStepComplete={setIsArtifactStepComplete} />
                  </>
                </Layout.Vertical>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
      <Container className={css.helpPanelContainer}>
        {isHelpEnabled && <HelpPanel referenceId="cdOnboardConfigureService" />}
      </Container>
    </Container>
  )
}

export const Configure = React.forwardRef(ConfigureServiceRef)
