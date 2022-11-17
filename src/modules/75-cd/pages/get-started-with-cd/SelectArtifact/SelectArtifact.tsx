/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Text,
  Layout,
  CardSelect,
  Icon,
  Container,
  Formik,
  FormikForm as Form,
  Accordion,
  FormError,
  useToaster,
  PageSpinner
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikContextType, FormikProps } from 'formik'
import { cloneDeep, defaultTo, get, isEmpty, isEqual, omit, set } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { ManifestConfigWrapper, UserRepoResponse, useUpdateServiceV2 } from 'services/cd-ng'
import { GitRepoName, ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import type { SelectGitProviderRefInstance } from './SelectGitProvider'
import { ACCOUNT_SCOPE_PREFIX, ArtifactProviders, ArtifactType, Hosting } from '../DeployProvisioningWizard/Constants'

import { SelectGitProvider } from './SelectGitProvider'
import { SelectRepository } from './SelectRepository'
import { ProvideManifest } from './ProvideManifest'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { getStoreType, ServiceDataType } from '../CDOnboardingUtils'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface SelectArtifactRefInstance {
  submitForm?: FormikProps<SelectArtifactInterface>['submitForm']
  resetForm?: FormikProps<SelectArtifactInterface>['resetForm']
}
export interface SelectArtifactInterface {
  artifactType?: ArtifactType
  identifier?: string
  branch?: string
  commitId?: string
  gitFetchType?: 'Branch' | 'Commit'
  paths?: string[] | any
  valuesPaths?: string[] | any
  repository?: UserRepoResponse // SelectRepo data
}

interface SelectArtifactProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
  onSuccess?: () => void
}

export type SelectArtifactForwardRef =
  | ((instance: SelectArtifactRefInstance | null) => void)
  | React.MutableRefObject<SelectArtifactRefInstance | null>
  | null

const SelectArtifactRef = (props: SelectArtifactProps, forwardRef: SelectArtifactForwardRef): React.ReactElement => {
  const { getString } = useStrings()
  const { disableNextBtn, enableNextBtn } = props
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()

  const [artifactType, setArtifactType] = useState<ArtifactType | undefined>(
    ArtifactProviders.find((item: ArtifactType) => item.value === serviceData?.data?.artifactType)
  )
  const formikRef = useRef<FormikContextType<SelectArtifactInterface>>()
  const selectGitProviderRef = React.useRef<SelectGitProviderRefInstance | null>(null)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { mutate: updateService, loading } = useUpdateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  useEffect(() => {
    const gitValues = selectGitProviderRef?.current?.values
    const manifestValues = omit(formikRef?.current?.values, 'repository')
    const gitTestConnectionStatus = isEqual(get(serviceData, 'data.gitValues'), gitValues)
      ? get(serviceData, 'data.gitConnectionStatus')
      : selectGitProviderRef.current?.testConnectionStatus
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'data.gitValues', gitValues)
      set(draft, 'data.manifestValues', manifestValues)
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
  }, [formikRef?.current?.values, formikRef?.current?.setFieldTouched, selectGitProviderRef?.current?.values])

  const openSelectRepoAccordion = (): boolean | undefined => {
    const { validate, testConnectionStatus } = selectGitProviderRef.current || {}
    if (validate?.() && testConnectionStatus === TestStatus.SUCCESS) {
      return true
    } else {
      disableNextBtn()
      return false
    }
  }

  const openProvideManifestAccordion = React.useCallback((): boolean | undefined => {
    if (formikRef?.current?.values?.repository?.name) {
      return true
    } else {
      return false
    }
  }, [formikRef?.current?.values?.repository])

  const validateProvideManifestDetails = React.useCallback((): boolean => {
    if (isEmpty(formikRef?.current?.errors)) {
      openSelectRepoAccordion() && openProvideManifestAccordion() && enableNextBtn()
      return true
    } else {
      disableNextBtn()
      return false
    }
  }, [])

  const { showError, showSuccess } = useToaster()
  const handleSubmit = async (values: SelectArtifactInterface): Promise<SelectArtifactInterface> => {
    const gitValues = selectGitProviderRef?.current?.values
    const manifestValues = formikRef?.current?.values
    try {
      const getManifestDetails = (): ManifestConfigWrapper => {
        const { branch, commitId, gitFetchType, identifier, paths, valuesPaths, repository } =
          formikRef?.current?.values || {}

        const selectedManifest = ManifestDataType.K8sManifest as ManifestTypes

        const manifestObj: ManifestConfigWrapper = {
          manifest: {
            identifier: defaultTo(identifier, ''),
            type: selectedManifest, // fixed for initial designs
            spec: {
              store: {
                spec: {
                  gitFetchType: gitFetchType,
                  paths: typeof paths === 'string' ? paths : paths?.map((path: { path: string }) => path.path)
                }
              },
              valuesPaths:
                typeof valuesPaths === 'string' ? valuesPaths : valuesPaths?.map((path: { path: string }) => path.path)
            }
          }
        }
        if (manifestObj?.manifest?.spec?.store) {
          if (gitFetchType === 'Branch') {
            set(manifestObj, 'manifest.spec.store.spec.branch', branch)
          } else if (gitFetchType === 'Commit') {
            set(manifestObj, 'manifest.spec.store.spec.commitId', commitId)
          }
        }

        if (selectedManifest === ManifestDataType.K8sManifest) {
          set(manifestObj, 'manifest.spec.skipResourceVersioning', false)
        }
        if (connectionType === GitRepoName.Account) {
          set(manifestObj, 'manifest.spec.store.spec.repoName', repository?.name)
        }

        set(manifestObj, 'manifest.spec.store.type', getStoreType(gitValues?.gitProvider?.type))
        set(
          manifestObj,
          'manifest.spec.store.spec.connectorRef',
          `${ACCOUNT_SCOPE_PREFIX}${gitValues?.gitProvider?.type}`
        )
        return manifestObj
      }

      const connectionType = GitRepoName.Account
      // setting default value

      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        set(draft, 'serviceDefinition.spec.manifests[0]', getManifestDetails())
        set(draft, 'data.artifactType', values?.artifactType)
        set(draft, 'data.gitValues', gitValues)
        set(draft, 'data.manifestValues', manifestValues)
      })

      saveServiceData(updatedContextService)

      const serviceBody = { service: { ...omit(cloneDeep(updatedContextService), 'data') } }
      if (isEqual(serviceBody, { service: { ...omit(serviceData, 'data') } })) {
        props?.onSuccess?.()
        return Promise.resolve(values)
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
      showSuccess('Service updated successfully')
      props?.onSuccess?.()
      return Promise.resolve(values)
    } catch (e: any) {
      showError(e?.data?.message || e?.message || getString('commonError'))
      return Promise.resolve({} as SelectArtifactInterface)
    }
  }

  const getInitialValues = React.useCallback((): SelectArtifactInterface => {
    const initialValues = get(serviceData, 'serviceDefinition.spec.manifests[0].manifest', {})
    const initialRepoValue = get(serviceData, 'data.repoValues')
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : specValues.paths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) })),
        valuesPaths:
          typeof initialValues?.spec?.valuesPaths === 'string'
            ? initialValues?.spec?.valuesPaths
            : initialValues?.spec?.valuesPaths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) })),
        artifactType: defaultTo(get(serviceData, 'data.artifactType'), undefined),
        repository: initialRepoValue
      }
    }
    return {
      identifier: '',
      gitFetchType: 'Branch',
      branch: undefined,
      commitId: undefined,
      paths: [{ path: '', uuid: uuid('', nameSpace()) }],
      valuesPaths: [],
      artifactType: defaultTo(get(serviceData, 'data.artifactType'), undefined),
      repository: initialRepoValue
    }
  }, [get(serviceData, 'serviceDefinition.spec.manifests[0].manifest', {})])

  const validationSchema = Yup.object().shape({
    identifier: Yup.string().required(getString('validation.nameRequired')),
    branch: Yup.string().when('gitFetchType', {
      is: 'Branch',
      then: Yup.string().trim().required(getString('validation.branchName'))
    }),
    commitId: Yup.string().when('gitFetchType', {
      is: 'Commit',
      then: Yup.string().trim().required(getString('validation.commitId'))
    }),
    paths: Yup.lazy((_value): Yup.Schema<unknown> => {
      return Yup.array().of(
        Yup.object().shape({
          path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
        })
      )
    }),
    valuesPaths: Yup.lazy((_value): Yup.Schema<unknown> => {
      return Yup.array().of(
        Yup.object().shape({
          path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
        })
      )
    })
  })
  if (loading) {
    return <PageSpinner />
  }

  const onRepositoryChange = async (repository: UserRepoResponse): Promise<void> => {
    if (repository) {
      formikRef.current?.setFieldValue('repository', repository)
      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        set(draft, 'data.repoValues', repository)
      })
      saveServiceData(updatedContextService)
    }
  }
  return (
    <Layout.Vertical width="80%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('cd.getStartedWithCD.artifactLocation')}</Text>
      <Formik<SelectArtifactInterface>
        formName="cdArtifactDetails"
        initialValues={getInitialValues()}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Container padding={{ top: 'xxlarge', bottom: 'xxxlarge' }}>
                <CardSelect
                  cornerSelected={true}
                  data={ArtifactProviders}
                  cardClassName={css.artifactTypeCard}
                  renderItem={(item: ArtifactType) => (
                    <>
                      <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between' }}>
                        <Layout.Vertical spacing="medium">
                          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                            <Icon name={item.icon} size={20} />
                            <Text font={{ variation: FontVariation.H5 }}>{getString(item.label)}</Text>
                          </Layout.Horizontal>
                          <Text font={{ variation: FontVariation.SMALL }}>{getString(item.details)}</Text>
                        </Layout.Vertical>
                      </Layout.Vertical>
                    </>
                  )}
                  selected={artifactType}
                  onChange={(item: ArtifactType) => {
                    formikProps.setFieldValue('artifactType', item.value)
                    setArtifactType(item)
                  }}
                />
                {formikProps.touched.artifactType && !formikProps.values.artifactType ? (
                  <FormError
                    name={'artifactType'}
                    errorMessage={getString('common.getStarted.plsChoose', {
                      field: `your ${getString('pipeline.artifactsSelection.artifactType')}`
                    })}
                  />
                ) : null}
              </Container>

              <div className={css.repoborderBottom} />

              {artifactType ? (
                <Accordion className={css.accordion} activeId={artifactType ? 'codeRepo' : ''}>
                  <Accordion.Panel
                    id="codeRepo"
                    summary={
                      <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
                        <Text font={{ variation: FontVariation.H5 }}>{getString('cd.getStartedWithCD.codeRepos')}</Text>
                        {openSelectRepoAccordion() ? (
                          <Icon name="success-tick" size={20} className={css.accordionStatus} />
                        ) : selectGitProviderRef?.current?.showValidationErrors ? (
                          <Icon name="danger-icon" size={20} className={css.accordionStatus} />
                        ) : null}
                      </Layout.Horizontal>
                    }
                    details={
                      <SelectGitProvider
                        ref={selectGitProviderRef}
                        gitValues={get(serviceData, 'data.gitValues', {})}
                        connectionStatus={get(serviceData, 'data.gitConnectionStatus', TestStatus.NOT_INITIATED)}
                        disableNextBtn={props.disableNextBtn}
                        enableNextBtn={props.enableNextBtn}
                        selectedHosting={Hosting.SaaS}
                      ></SelectGitProvider>
                    }
                  />
                  <Accordion.Panel
                    id="selectYourRepo"
                    summary={
                      <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
                        <Text font={{ variation: FontVariation.H5 }}>{getString('common.selectYourRepo')}</Text>
                        <Icon
                          name={formikProps?.values?.repository?.name ? 'success-tick' : 'danger-icon'}
                          size={20}
                          className={css.accordionStatus}
                        />
                      </Layout.Horizontal>
                    }
                    details={
                      <SelectRepository
                        selectedRepository={formikProps.values?.repository}
                        validatedConnectorRef={
                          get(serviceData, 'data.gitValues.gitProvider.type') ||
                          selectGitProviderRef.current?.values?.gitProvider?.type
                        }
                        onChange={onRepositoryChange}
                        disableNextBtn={props.disableNextBtn}
                        enableNextBtn={props.enableNextBtn}
                      ></SelectRepository>
                    }
                  />
                  <Accordion.Panel
                    id="provideManifest"
                    summary={
                      <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
                        <Text font={{ variation: FontVariation.H5 }}>
                          {getString('cd.getStartedWithCD.provideManifest')}
                        </Text>
                        <Icon
                          name={validateProvideManifestDetails() ? 'success-tick' : 'danger-icon'}
                          size={20}
                          className={css.accordionStatus}
                        />
                      </Layout.Horizontal>
                    }
                    details={
                      <ProvideManifest
                        formikProps={formikProps}
                        initialValues={get(serviceData, 'serviceDefinition.spec.manifests[0].manifest', {})}
                      />
                    }
                  />
                </Accordion>
              ) : null}
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const SelectArtifact = React.forwardRef(SelectArtifactRef)
