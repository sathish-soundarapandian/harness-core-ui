/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'

import cx from 'classnames'
import {
  Text,
  Layout,
  CardSelect,
  Icon,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  PageSpinner,
  useToaster,
  FormError
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import type { FormikContextType, FormikProps } from 'formik'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { ServiceRequestDTO, useCreateServiceV2 } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import {
  WorkloadType,
  deploymentTypes,
  ServiceDeploymentTypes,
  WorkloadProviders
} from '../DeployProvisioningWizard/Constants'

import { useCDOnboardingContext } from '../CDOnboardingStore'
import { cleanServiceDataUtil, getUniqueEntityIdentifier, newServiceState } from '../CDOnboardingUtils'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface SelectWorkloadRefInstance {
  submitForm?: FormikProps<SelectWorkloadInterface>['submitForm']
}
export interface SelectWorkloadInterface {
  workloadType?: WorkloadType
  serviceDeploymentType?: ServiceDeploymentTypes
  serviceRef: string
}
interface SelectWorkloadProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
  onSuccess: () => void
}

export type SelectWorkloadForwardRef =
  | ((instance: SelectWorkloadRefInstance | null) => void)
  | React.MutableRefObject<SelectWorkloadRefInstance | null>
  | null

const SelectWorkloadRef = (props: SelectWorkloadProps, forwardRef: SelectWorkloadForwardRef): React.ReactElement => {
  const { getString } = useStrings()
  const { disableNextBtn, enableNextBtn, onSuccess } = props

  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()
  const [workloadType, setWorkloadType] = useState<WorkloadType | undefined>(
    WorkloadProviders.find((item: WorkloadType) => item.value === serviceData?.data?.workloadType)
  )
  const [serviceDeploymentType, setServiceDeploymnetType] = useState<ServiceDeploymentTypes | undefined>(
    deploymentTypes.find(item => item.value === serviceData?.serviceDefinition?.type)
  )

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { loading: createLoading, mutate: createService } = useCreateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const formikRef = useRef<FormikContextType<SelectWorkloadInterface>>()

  const { showSuccess, showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  useEffect(() => {
    if (formikRef.current?.values?.workloadType && formikRef?.current?.values?.serviceDeploymentType) {
      enableNextBtn()
    } else {
      disableNextBtn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikRef.current?.values])

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
  }, [formikRef?.current?.values])

  if (createLoading) {
    return <PageSpinner />
  }

  const handleSubmit = async (values: SelectWorkloadInterface): Promise<SelectWorkloadInterface> => {
    const { serviceRef } = defaultTo(values, {} as SelectWorkloadInterface)
    const isServiceNameUpdated =
      isEmpty(get(serviceData, 'serviceDefinition.type')) || get(serviceData, 'name') !== serviceRef

    if (isServiceNameUpdated) {
      const updatedContextService = produce(newServiceState, draft => {
        set(draft, 'name', serviceRef)
        set(
          draft,
          'identifier',
          isServiceNameUpdated ? getUniqueEntityIdentifier(serviceRef) : get(serviceData, 'identifier')
        )
        set(draft, 'serviceDefinition.type', serviceDeploymentType?.value)
        set(draft, 'data.workloadType', workloadType?.value)
      })

      const cleanServiceData = cleanServiceDataUtil(updatedContextService as ServiceRequestDTO)
      saveServiceData(updatedContextService)
      try {
        const response = await createService({ ...cleanServiceData, orgIdentifier, projectIdentifier })
        if (response.status === 'SUCCESS') {
          clear()
          showSuccess(getString('cd.serviceCreated'))
          onSuccess()
          return Promise.resolve(values)
        } else {
          throw response
        }
      } catch (error: any) {
        showError(getRBACErrorMessage(error))
        return Promise.resolve(error)
      }
    } else {
      // if service not updated
      onSuccess()
    }

    return Promise.resolve({} as SelectWorkloadInterface)
  }

  const validationSchema = Yup.object().shape({
    serviceRef: Yup.string()
      .required(getString('validation.identifierRequired'))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers)
  })

  return (
    <Layout.Vertical width="70%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('cd.getStartedWithCD.workloadDeploy')}</Text>
      <Formik<SelectWorkloadInterface>
        initialValues={{
          workloadType: defaultTo(get(serviceData, 'data.workloadType'), undefined),
          serviceDeploymentType: defaultTo(get(serviceData, 'serviceDefinition.type'), undefined),
          serviceRef: defaultTo(get(serviceData, 'name'), '')
        }}
        formName="cdWorkload-provider"
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Container className={css.containerPadding}>
                <CardSelect
                  data={WorkloadProviders}
                  cornerSelected={true}
                  className={css.icons}
                  cardClassName={css.workloadTypeCard}
                  renderItem={(item: WorkloadType) => (
                    <>
                      <Layout.Vertical flex>
                        <Icon name={item.icon} size={25} flex className={css.workloadTypeIcon} />
                        <Text font={{ variation: FontVariation.BODY2 }} className={css.text}>
                          {getString(item.label)}
                        </Text>
                      </Layout.Vertical>
                    </>
                  )}
                  selected={workloadType}
                  onChange={(item: WorkloadType) => {
                    formikProps.setFieldValue('workloadType', item.value)
                    setWorkloadType(item)
                  }}
                />
                {formikProps.touched.workloadType && !formikProps.values.workloadType ? (
                  <FormError
                    name={'workloadType'}
                    errorMessage={getString('common.getStarted.plsChoose', {
                      field: `${getString('infrastructureText')}`
                    })}
                  />
                ) : null}
                <Container className={cx({ [css.borderBottom]: workloadType })} />
              </Container>

              {workloadType?.label === 'service' ? (
                <Layout.Horizontal>
                  <Container padding={{ bottom: 'xxlarge' }}>
                    <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'xlarge' }}>
                      {getString('cd.getStartedWithCD.serviceDeploy')}
                    </Text>
                    <Container className={css.containerPadding}>
                      <CardSelect
                        data={deploymentTypes}
                        cornerSelected={true}
                        className={css.icons}
                        cardClassName={css.serviceDeploymentTypeCard}
                        renderItem={(item: ServiceDeploymentTypes) => (
                          <>
                            <Layout.Vertical flex>
                              <Icon name={item.icon} size={30} flex className={css.serviceDeploymentTypeIcon} />
                              <Text font={{ variation: FontVariation.BODY2 }} className={css.text1}>
                                {getString(item.label)}
                              </Text>
                            </Layout.Vertical>
                          </>
                        )}
                        selected={serviceDeploymentType}
                        onChange={(item: ServiceDeploymentTypes) => {
                          formikProps.setFieldValue('serviceDeploymentType', item.value)
                          setServiceDeploymnetType(item)
                        }}
                      />
                      {formikProps.touched.serviceDeploymentType && !formikProps.values.serviceDeploymentType ? (
                        <FormError
                          name={'serviceDeploymentType'}
                          errorMessage={getString('common.getStarted.plsChoose', {
                            field: `${getString('infrastructureText')}`
                          })}
                        />
                      ) : null}
                      <Container className={cx({ [css.borderBottom]: serviceDeploymentType })} />
                    </Container>
                    {serviceDeploymentType ? (
                      <Container padding={{ bottom: 'xsmall' }}>
                        <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'xlarge' }}>
                          {getString('cd.getStartedWithCD.serviceHeading')}
                        </Text>

                        <FormInput.Text
                          tooltipProps={{ dataTooltipId: 'specifyYourService' }}
                          label={getString('cd.serviceName')}
                          name="serviceRef"
                          className={css.formInput}
                        />
                      </Container>
                    ) : null}
                  </Container>
                </Layout.Horizontal>
              ) : null}
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const SelectWorkload = React.forwardRef(SelectWorkloadRef)
