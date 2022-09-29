/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  StepProps,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, get, isEmpty } from 'lodash-es'
import {
  ConnectorConfigDTO,
  useGetAzureSubscriptions,
  useGetACRRegistriesBySubscription,
  useGetACRRepositories,
  AzureSubscriptionDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import type { AcrSpec } from 'services/pipeline-ng'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export function ACRArtifact({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<AcrSpec>): React.ReactElement {
  const { getString } = useStrings()
  const { registry, repository, subscriptionId } = initialValues
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [registries, setRegistries] = React.useState<SelectOption[]>([])
  const [repositories, setRepositories] = React.useState<SelectOption[]>([])

  const schemaObject = {
    subscriptionId: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: getString('pipeline.ACR.subscription') })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString('pipeline.ACR.subscription') })
            })
          }
          return true
        }
      })
    }),
    registry: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: getString('pipeline.ACR.registry') })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString('pipeline.ACR.registry') })
            })
          }
          return true
        }
      })
    }),
    repository: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('repository') }))
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString('repository') })
            })
          }
          return true
        }
      })
    })
  }

  const validationSchema = Yup.object().shape(schemaObject)

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const {
    data: subscriptionsData,
    loading: loadingSubscriptions,
    error: subscriptionsError
  } = useGetAzureSubscriptions({
    queryParams: {
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    setSubscriptions(
      defaultTo(subscriptionsData?.data?.subscriptions, []).reduce(
        (subscriptionValues: SelectOption[], subscription: AzureSubscriptionDTO) => {
          subscriptionValues.push({
            label: `${subscription.subscriptionName}: ${subscription.subscriptionId}`,
            value: subscription.subscriptionId
          })
          return subscriptionValues
        },
        []
      )
    )
  }, [subscriptionsData])

  const {
    data: registiresData,
    refetch: refetchRegistries,
    loading: loadingRegistries,
    error: registriesError
  } = useGetACRRegistriesBySubscription({
    queryParams: {
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      subscriptionId: initialValues?.subscriptionId as string
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    /* istanbul ignore else */
    refetchRegistries({
      queryParams: {
        connectorRef: getConnectorRefQueryData(),
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        subscriptionId: subscriptionId as string
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId, registry])

  useEffect(() => {
    const options =
      defaultTo(registiresData?.data?.registries, []).map(item => ({
        label: item.registry,
        value: item.registry
      })) || /* istanbul ignore next */ []

    setRegistries(options)
  }, [registiresData])

  const {
    data: repositoriesData,
    refetch: refetchRepositories,
    loading: loadingRepositories,
    error: repositoriesError
  } = useGetACRRepositories({
    queryParams: {
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      subscriptionId: subscriptionId as string
    },
    registry: registry as string,
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    /* istanbul ignore else */
    if (subscriptionId && registry) {
      refetchRepositories({
        queryParams: {
          connectorRef: getConnectorRefQueryData(),
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscriptionId
        },
        pathParams: {
          registry
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId, registry, repository])

  useEffect(() => {
    const options =
      defaultTo(repositoriesData?.data?.repositories, []).map(repo => ({
        label: repo.repository,
        value: repo.repository
      })) || /* istanbul ignore next */ []

    setRepositories(options)
  }, [repositoriesData])

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        formName="acrArtifact"
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
        enableReinitialize={true}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className={css.connectorForm}>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="subscriptionId"
                    selectItems={subscriptions}
                    multiTypeInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED],
                      onChange: selectedOption => {
                        const selectedValue = (selectedOption as SelectOption).value as string
                        if (selectedValue) {
                          refetchRegistries({
                            queryParams: {
                              connectorRef: getConnectorRefQueryData(),
                              accountIdentifier: accountId,
                              orgIdentifier,
                              projectIdentifier,
                              subscriptionId: selectedValue
                            }
                          })
                        } else {
                          setRegistries([])
                          setRepositories([])
                        }

                        setFieldValue('registry', '')
                        setFieldValue('repository', '')
                        setFieldValue('subscriptionId', selectedValue)
                      },
                      selectProps: {
                        items: subscriptions,
                        allowCreatingNewItems: true,
                        addClearBtn: !loadingSubscriptions,
                        noResults: (
                          <Text padding={'small'}>
                            {get(subscriptionsError, 'data.message', null) ||
                              getString('pipeline.ACR.subscriptionError')}
                          </Text>
                        )
                      }
                    }}
                    useValue
                    label={getString('pipeline.ACR.subscription')}
                    disabled={loadingSubscriptions}
                    placeholder={
                      loadingSubscriptions
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.subscriptionPlaceholder')
                    }
                  />
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="registry"
                    selectItems={registries}
                    disabled={loadingRegistries}
                    placeholder={
                      loadingRegistries
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.registryPlaceholder')
                    }
                    multiTypeInputProps={{
                      onChange: selectedOption => {
                        const selectedValue = (selectedOption as SelectOption).value as string
                        if (selectedValue) {
                          refetchRepositories({
                            queryParams: {
                              connectorRef: getConnectorRefQueryData(),
                              accountIdentifier: accountId,
                              orgIdentifier,
                              projectIdentifier,
                              subscriptionId: values.subscriptionId as string
                            },
                            pathParams: {
                              registry: selectedValue
                            }
                          })
                        } else {
                          setRepositories([])
                        }

                        setFieldValue('repository', '')
                        setFieldValue('registry', selectedValue)
                      },
                      selectProps: {
                        items: registries,
                        allowCreatingNewItems: true,
                        addClearBtn: !loadingRegistries,
                        noResults: (
                          <Text padding={'small'}>
                            {get(registriesError, 'data.message', null) || getString('pipeline.ACR.registryError')}
                          </Text>
                        )
                      },
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                    useValue
                    label={getString('pipeline.ACR.registry')}
                  />
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="repository"
                    selectItems={repositories}
                    disabled={loadingRepositories}
                    placeholder={
                      loadingRepositories
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.repositoryPlaceholder')
                    }
                    multiTypeInputProps={{
                      onChange: selectedOption => {
                        const selectedValue = (selectedOption as SelectOption).value as string
                        setFieldValue('repository', selectedValue)
                      },
                      selectProps: {
                        items: repositories,
                        allowCreatingNewItems: true,
                        addClearBtn: !loadingRepositories,
                        noResults: (
                          <Text padding={'small'}>
                            {get(repositoriesError, 'data.message', null) || getString('pipeline.ACR.repositoryError')}
                          </Text>
                        )
                      },
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                    useValue
                    label={getString('repository')}
                  />
                </div>
              </div>
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
