/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Text,
  FontVariation,
  Layout,
  CardSelect,
  Icon,
  Container,
  Formik,
  FormikForm as Form,
  Accordion,
  FormInput,
  useToaster,
  PageSpinner,
  FormError
} from '@harness/uicore'
import type { FormikContextType, FormikProps } from 'formik'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'

import {
  EnvironmentRequestDTO,
  InfrastructureRequestDTO,
  InfrastructureRequestDTORequestBody,
  useCreateEnvironmentV2,
  useCreateInfrastructure
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import { InfrastructureTypes, InfrastructureType } from '../DeployProvisioningWizard/Constants'
import {
  SelectAuthenticationMethod,
  SelectAuthenticationMethodInterface,
  SelectAuthenticationMethodRefInstance
} from './SelectAuthenticationMethod'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import {
  cleanEnvironmentDataUtil,
  getUniqueEntityIdentifier,
  newEnvironmentState,
  PipelineRefPayload
} from '../cdOnboardingUtils'
import defaultCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import css from './SelectInfrastructure.module.scss'

export interface SelectInfrastructureRefInstance {
  submitForm?: FormikProps<SelectInfrastructureInterface>['submitForm']
}
export interface SelectInfrastructureInterface extends SelectAuthenticationMethodInterface {
  infraType?: string
  envId?: string
  infraId?: string
  namespace?: string
}

interface SelectInfrastructureProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
  onSuccess?: (data: PipelineRefPayload) => void
}

export type SelectInfrastructureForwardRef =
  | ((instance: SelectInfrastructureRefInstance | null) => void)
  | React.MutableRefObject<SelectInfrastructureRefInstance | null>
  | null

const SelectInfrastructureRef = (
  props: SelectInfrastructureProps,
  forwardRef: SelectInfrastructureForwardRef
): React.ReactElement => {
  const { getString } = useStrings()
  const {
    saveEnvironmentData,
    saveInfrastructureData,
    state: { environment: environmentData, infrastructure: infrastructureData, service: serviceData }
  } = useCDOnboardingContext()

  const [infrastructureType, setInfrastructureType] = useState<InfrastructureType | undefined>(
    InfrastructureTypes.find((item: InfrastructureType) => item.value === infrastructureData?.type)
  )
  const formikRef = useRef<FormikContextType<SelectInfrastructureInterface>>()
  const selectAuthenticationMethodRef = React.useRef<SelectAuthenticationMethodRefInstance | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const [showPageLoader, setShowPageLoader] = useState<boolean>(false)
  const { mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const openSetUpDelegateAccordion = (): boolean => {
    const validate = selectAuthenticationMethodRef.current?.validate()
    if (validate && isEmpty(formikRef?.current?.errors)) {
      return true
    } else {
      props.disableNextBtn()
      return false
    }
  }

  const setForwardRef = (): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    forwardRef.current = {
      submitForm: formikRef?.current?.submitForm
    }
  }

  const { mutate: createInfrastructure } = useCreateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (formikRef.current?.values) {
      setForwardRef()
    }
  }, [formikRef?.current, formikRef?.current?.values])

  const { showSuccess, showError, clear } = useToaster()
  const handleSubmit = async (values: SelectInfrastructureInterface): Promise<SelectInfrastructureInterface> => {
    setShowPageLoader(true)
    const { envId, infraId, infraType, namespace, connectorIdentifier } = defaultTo(
      values,
      {} as SelectInfrastructureInterface
    )

    const environmentIdentifier = getUniqueEntityIdentifier(envId as string)
    const infraIdentifier = getUniqueEntityIdentifier(infraId as string)
    const updatedContextEnvironment = produce(newEnvironmentState.environment, draft => {
      set(draft, 'name', envId)
      set(draft, 'identifier', environmentIdentifier)
    })
    try {
      const cleanEnvironmentData = cleanEnvironmentDataUtil(updatedContextEnvironment as EnvironmentRequestDTO)
      const response = await createEnvironment({ ...cleanEnvironmentData, orgIdentifier, projectIdentifier })
      if (response.status === 'SUCCESS') {
        clear()
        showSuccess(getString('cd.environmentCreated'))
        envId && saveEnvironmentData(updatedContextEnvironment)
        const updatedContextInfra = produce(newEnvironmentState.infrastructure, draft => {
          set(draft, 'name', infraId)
          set(draft, 'identifier', getUniqueEntityIdentifier(infraId))
          set(draft, 'type', infraType)
          set(draft, 'environmentRef', envId)
          set(draft, 'infrastructureDefinition.spec.namespace', namespace)
          set(draft, 'infrastructureDefinition.spec.connectorRef', connectorIdentifier)
          set(draft, 'data.connectorAuthValues', values)
        })

        saveInfrastructureData(updatedContextInfra)
        const body: InfrastructureRequestDTORequestBody = {
          name: infraId,
          identifier: infraIdentifier,
          description: '',
          tags: {},
          orgIdentifier,
          projectIdentifier,
          type: infraType as InfrastructureRequestDTO['type'],
          environmentRef: environmentIdentifier
        }

        createInfrastructure({
          ...body,
          yaml: yamlStringify({
            infrastructureDefinition: {
              ...body,
              spec: get(updatedContextInfra, 'infrastructureDefinition.spec'),
              allowSimultaneousDeployments: false
            }
          })
        })
          .then(infraResponse => {
            const refsData = {
              serviceRef: serviceData?.identifier as string,
              environmentRef: environmentIdentifier,
              infraStructureRef: infraIdentifier,
              deploymentType: serviceData?.serviceDefinition?.type as string
            }
            if (infraResponse.status === 'SUCCESS') {
              props?.onSuccess?.(refsData)
              setShowPageLoader(false)
              showSuccess(
                getString('cd.infrastructure.created', {
                  identifier: infraResponse.data?.infrastructure?.identifier
                })
              )
              return Promise.resolve(values)
            } else {
              throw infraResponse
            }
          })
          .catch(e => {
            setShowPageLoader(false)
            throw e
          })

        return Promise.resolve(values)
      } else {
        throw response
      }
    } catch (error: any) {
      setShowPageLoader(false)
      showError(getRBACErrorMessage(error))
      return Promise.resolve({} as SelectInfrastructureInterface)
    }
  }

  const borderBottom = <div className={defaultCss.repoborderBottom} />

  if (showPageLoader) {
    return <PageSpinner />
  }

  const validationSchema = Yup.object().shape({
    envId: Yup.string()
      .required(getString('common.validation.fieldIsRequired', { name: getString('cd.getStartedWithCD.envName') }))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers),
    infraId: Yup.string()
      .required(getString('common.validation.fieldIsRequired', { name: getString('infrastructureText') }))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers),
    namespace: Yup.string()
      .required(getString('common.validation.fieldIsRequired', { name: getString('common.namespace') }))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers),
    connectorName: Yup.string()
      .required(getString('validation.nameRequired'))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers),
    delegateType: Yup.string().required(
      getString('connectors.chooseMethodForConnection', {
        name: getString('connectors.k8sConnection')
      })
    )
  })

  return (
    <Layout.Vertical width="80%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('cd.getStartedWithCD.workloadDeploy')}</Text>
      <Formik<SelectInfrastructureInterface>
        initialValues={{
          ...get(infrastructureData, 'data.connectorAuthValues'),
          authType: defaultTo(get(infrastructureData, 'data.connectorAuthValues.authType'), AuthTypes.USER_PASSWORD),
          delegateSelectors: [],
          infraType: defaultTo(get(infrastructureData, 'type'), ''),
          envId: defaultTo(get(environmentData, 'name'), ''),
          infraId: defaultTo(get(infrastructureData, 'name'), ''),
          namespace: defaultTo(get(infrastructureData, 'infrastructureDefinition.spec.namespace'), '')
        }}
        formName="cdInfrastructure"
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Container className={css.workloadType}>
                <CardSelect
                  data={InfrastructureTypes}
                  cornerSelected={true}
                  className={defaultCss.icons}
                  cardClassName={defaultCss.serviceDeploymentTypeCard}
                  renderItem={(item: InfrastructureType) => (
                    <>
                      <Layout.Vertical flex>
                        <Icon name={item.icon} size={30} flex className={defaultCss.serviceDeploymentTypeIcon} />

                        <Text font={{ variation: FontVariation.SMALL_SEMI }} padding={{ top: 'xxlarge' }} width={78}>
                          {getString(item.label)}
                        </Text>
                      </Layout.Vertical>
                    </>
                  )}
                  selected={infrastructureType}
                  onChange={(item: InfrastructureType) => {
                    formikProps.setFieldValue('infraType', item.value)
                    setInfrastructureType(item)
                  }}
                />
              </Container>
              {formikProps.touched.infraType && !formikProps.values.infraType ? (
                <FormError
                  name={'infraType'}
                  errorMessage={getString('common.getStarted.plsChoose', {
                    field: `${getString('infrastructureText')}`
                  })}
                  className={css.marginTop}
                />
              ) : null}
              <Layout.Horizontal className={css.infraInputs}>
                <FormInput.Text
                  tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                  label={getString('cd.getStartedWithCD.envName')}
                  name="envId"
                  className={defaultCss.formInput}
                />
                <FormInput.Text
                  // tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                  label={getString('infrastructureText')}
                  name="infraId"
                  className={defaultCss.formInput}
                />
                <FormInput.Text
                  tooltipProps={{ dataTooltipId: 'gcpInfraNamespace' }}
                  label={getString('common.namespace')}
                  placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                  name="namespace"
                  className={defaultCss.formInput}
                />
              </Layout.Horizontal>
              {borderBottom}
              {infrastructureType &&
              formikRef?.current?.values?.envId &&
              formikRef?.current?.values?.infraId &&
              formikRef?.current?.values?.namespace ? (
                <Accordion className={defaultCss.accordion} activeId={infrastructureType ? 'authMethod' : ''}>
                  <Accordion.Panel
                    id="authMethod"
                    summary={
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        <Text font={{ variation: FontVariation.H5 }}>{'Connect to your Kubernetes cluster'}</Text>
                        <Icon
                          name={openSetUpDelegateAccordion() ? 'success-tick' : 'danger-icon'}
                          size={20}
                          className={defaultCss.accordionStatus}
                        />
                      </Layout.Horizontal>
                    }
                    details={
                      <SelectAuthenticationMethod
                        formikProps={formikProps}
                        ref={selectAuthenticationMethodRef}
                        disableNextBtn={props.disableNextBtn}
                        enableNextBtn={props.enableNextBtn}
                      ></SelectAuthenticationMethod>
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

export const SelectInfrastructure = React.forwardRef(SelectInfrastructureRef)
