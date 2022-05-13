/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect } from 'react'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  StepProps,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Form, FormikContextType, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, get, isEmpty, isNil, merge } from 'lodash-es'
import {
  AcrBuildDetailsDTO,
  ConnectorConfigDTO,
  useGetBuildDetailsForACRRepository,
  useGetAzureSubscriptions,
  useGetACRRegistriesBySubscription,
  useGetACRRepositories,
  AzureSubscriptionDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useQueryParams } from '@common/hooks'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  getFinalArtifactObj,
  helperTextData,
  isFieldRuntime,
  resetTag,
  shouldFetchTags
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ACRArtifactType,
  ArtifactType,
  ACRArtifactProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import SideCarArtifactIdentifier from '../SideCarArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export function ACRArtifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact
}: StepProps<ConnectorConfigDTO> & ACRArtifactProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [tagList, setTagList] = React.useState([])
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [registries, setRegistries] = React.useState<SelectOption[]>([])
  const [repositories, setRepositories] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState<{
    subscriptionId: string
    registry: string
    repository: string
  }>({
    subscriptionId: '',
    registry: '',
    repository: ''
  })

  const formikRef = React.useRef<FormikContextType<ACRArtifactType>>()

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
    }),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sideCarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValue = (item: { label?: string; value?: string } | string | any): string => {
    /* istanbul ignore next */
    return typeof item === 'string' ? item : item?.value
  }

  const {
    data: acrBuildData,
    loading: acrBuildDetailsLoading,
    refetch: refetchAcrBuildData,
    error: acrTagError
  } = useGetBuildDetailsForACRRepository({
    queryParams: {
      subscriptionId: getValue(lastQueryData?.subscriptionId),
      registry: getValue(lastQueryData?.registry),
      repository: getValue(lastQueryData?.repository),
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })
  useEffect(() => {
    /* istanbul ignore next */
    if (acrTagError) {
      setTagList([])
    } /* istanbul ignore next */ else if (Array.isArray(acrBuildData?.data?.buildDetailsList)) {
      setTagList(acrBuildData?.data?.buildDetailsList as [])
    }
  }, [acrBuildData, acrTagError])

  useEffect(() => {
    /* istanbul ignore next */
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchAcrBuildData()
    }
  }, [lastQueryData, prevStepData, refetchAcrBuildData])

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

  useEffect(() => {
    const values = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as ACRArtifactType

    formikRef?.current?.setFieldValue('subscriptionId', getSubscription(values))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions])

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
    if (
      initialValues?.spec?.subscriptionId &&
      isFieldRuntime(initialValues?.spec?.subscriptionId) &&
      initialValues?.spec?.registry &&
      isFieldRuntime(initialValues?.spec?.registry)
    ) {
      refetchRegistries({
        queryParams: {
          connectorRef: getConnectorRefQueryData(),
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscriptionId: getValue(initialValues.spec.subscriptionId)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.spec?.subscriptionId, initialValues?.spec?.registry])

  useEffect(() => {
    const options =
      defaultTo(registiresData?.data?.registries, []).map(registry => ({
        label: registry.registry,
        value: registry.registry
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
      subscriptionId: initialValues?.spec?.subscriptionId
    },
    registry: initialValues?.spec?.registry,
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    /* istanbul ignore else */
    if (
      initialValues?.spec?.subscriptionId &&
      isFieldRuntime(initialValues?.spec?.subscriptionId) &&
      initialValues?.spec?.registry &&
      isFieldRuntime(initialValues?.spec?.registry) &&
      initialValues?.spec?.repository &&
      isFieldRuntime(initialValues?.spec?.repository)
    ) {
      refetchRepositories({
        queryParams: {
          connectorRef: getConnectorRefQueryData(),
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscriptionId: getValue(initialValues.spec.subscriptionId)
        },
        pathParams: {
          registry: getValue(initialValues.spec.registry)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.spec?.subscriptionId, initialValues?.spec?.registry, initialValues?.spec?.repository])

  useEffect(() => {
    const options =
      defaultTo(repositoriesData?.data?.repositories, []).map(repo => ({
        label: repo.repository,
        value: repo.repository
      })) || /* istanbul ignore next */ []

    setRepositories(options)
  }, [repositoriesData])

  const fetchTags = (subscriptionId = '', registry = '', repository = ''): void => {
    /* istanbul ignore next */
    if (canFetchTags(subscriptionId, registry, repository)) {
      setLastQueryData({ subscriptionId, registry, repository })
    }
  }
  const canFetchTags = useCallback(
    /* istanbul ignore next */
    (subscriptionId: string, registry: string, repository: string): boolean =>
      !!(
        (lastQueryData?.subscriptionId !== subscriptionId ||
          lastQueryData?.registry !== registry ||
          lastQueryData?.repository !== repository) &&
        shouldFetchTags(prevStepData, [subscriptionId, registry, repository])
      ),
    [lastQueryData, prevStepData]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue?.subscriptionId, formikValue?.registry, formikValue?.repository])
  }, [])

  const getSubscription = (values: ACRArtifactType): SelectOption | string | undefined => {
    const value = getValue(values?.subscriptionId) || getValue(formikRef?.current?.values?.subscriptionId)
    /* istanbul ignore else */
    if (value && getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
      return (
        subscriptions.find(subscription => subscription.value === value) || {
          label: value,
          value: value
        }
      )
    }

    return values?.subscriptionId
  }

  const getInitialValues = useCallback((): ACRArtifactType => {
    const values = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as ACRArtifactType

    /* istanbul ignore else */
    if (initialValues) {
      values.subscriptionId = getSubscription(values)

      const registry = getValue(values?.registry) || getValue(formikRef?.current?.values?.registry)
      /* istanbul ignore else */
      if (registry && getMultiTypeFromValue(registry) === MultiTypeInputType.FIXED) {
        values.registry = {
          label: registry,
          value: registry
        }
      }

      const repository = getValue(values?.repository) || getValue(formikRef?.current?.values?.repository)
      /* istanbul ignore else */
      if (repository && getMultiTypeFromValue(repository) === MultiTypeInputType.FIXED) {
        values.repository = {
          label: repository,
          value: repository
        }
      }

      values.identifier = values?.identifier || (formikRef?.current?.values?.identifier as string)
    }

    return values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, initialValues, selectedArtifact])

  const submitFormData = (formData: ACRArtifactType & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactObj(formData, context === ModalViewFor.SIDECAR)
    merge(artifactObj.spec, {
      subscriptionId: formData?.subscriptionId,
      registry: formData?.registry,
      repository: formData?.repository
    })
    handleSubmit(artifactObj)
  }

  const getSelectItems = useCallback(() => {
    return (tagList as AcrBuildDetailsDTO[])?.map(tag => ({ label: tag.tag, value: tag.tag })) as SelectOption[]
  }, [tagList])

  const tags = acrBuildDetailsLoading
    ? /* istanbul ignore next */ [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
    : getSelectItems()

  const resetTagList = (formik: FormikProps<ACRArtifactType>): void => {
    tagList.length && setTagList([])
    resetTag(formik)
  }

  useEffect(() => {
    /* istanbul ignore else */
    if (!isNil(formikRef?.current?.values?.tag)) {
      /* istanbul ignore else */
      if (getMultiTypeFromValue(formikRef?.current?.values?.tag) !== MultiTypeInputType.FIXED) {
        formikRef?.current?.setFieldValue('tagRegex', formikRef?.current?.values?.tag)
      } else {
        formikRef?.current?.setFieldValue('tagRegex', '')
      }
    }
  }, [formikRef?.current?.values?.tag])

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={context === ModalViewFor.SIDECAR ? sideCarSchema : primarySchema}
        formName="acrArtifact"
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue(prevStepData),
            subscriptionId: getValue(formData.subscriptionId),
            registry: getValue(formData.registry),
            repository: getValue(formData.repository)
          })
        }}
        enableReinitialize={true}
      >
        {formik => {
          formikRef.current = formik
          return (
            <Form>
              <div className={css.connectorForm}>
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="subscriptionId"
                    selectItems={subscriptions}
                    multiTypeInputProps={{
                      onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                        if (type === MultiTypeInputType.FIXED) {
                          if (getValue(value)) {
                            refetchRegistries({
                              queryParams: {
                                connectorRef: getConnectorRefQueryData(),
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier,
                                subscriptionId: getValue(value)
                              }
                            })
                          } else {
                            setRegistries([])
                            setRepositories([])
                          }

                          getMultiTypeFromValue(getValue(formik?.values?.registry)) === MultiTypeInputType.FIXED &&
                            formik.setFieldValue('registry', '')
                          getMultiTypeFromValue(getValue(formik?.values?.repository)) === MultiTypeInputType.FIXED &&
                            formik.setFieldValue('repository', '')
                        } else {
                          setRegistries([])
                          setRepositories([])
                        }

                        resetTagList(formik)
                      },
                      selectProps: {
                        defaultSelectedItem: formik.values.subscriptionId as SelectOption,
                        items: subscriptions,
                        allowCreatingNewItems: true,
                        addClearBtn: !(loadingSubscriptions || isReadonly),
                        noResults: (
                          <Text padding={'small'}>
                            {get(subscriptionsError, 'data.message', null) ||
                              getString('pipeline.ACR.subscriptionError')}
                          </Text>
                        )
                      }
                    }}
                    label={getString('pipeline.ACR.subscription')}
                    disabled={loadingSubscriptions || isReadonly}
                    placeholder={
                      loadingSubscriptions
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.subscriptionPlaceholder')
                    }
                  />

                  {getMultiTypeFromValue(getValue(formik.values.subscriptionId)) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values?.subscriptionId as string}
                        type="String"
                        variableName="subscriptionId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        isReadonly={isReadonly}
                        onChange={
                          /* istanbul ignore next */ value => {
                            formik.setFieldValue('subscriptionId', value)
                          }
                        }
                      />
                    </div>
                  )}
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="registry"
                    selectItems={registries}
                    disabled={loadingRegistries || isReadonly}
                    placeholder={
                      loadingRegistries
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.registryPlaceholder')
                    }
                    multiTypeInputProps={{
                      expressions,
                      disabled: isReadonly,
                      onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                        if (type === MultiTypeInputType.FIXED) {
                          if (getValue(value)) {
                            refetchRepositories({
                              queryParams: {
                                connectorRef: getConnectorRefQueryData(),
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier,
                                subscriptionId: getValue(formik.values.subscriptionId)
                              },
                              pathParams: {
                                registry: getValue(value)
                              }
                            })
                          } else {
                            setRepositories([])
                          }

                          getMultiTypeFromValue(getValue(formik?.values?.repository)) === MultiTypeInputType.FIXED &&
                            formik.setFieldValue('repository', '')
                        } else {
                          setRepositories([])
                        }
                        resetTagList(formik)
                      },
                      selectProps: {
                        defaultSelectedItem: formik.values.registry as SelectOption,
                        items: registries,
                        allowCreatingNewItems: true,
                        addClearBtn: !(loadingRegistries || isReadonly),
                        noResults: (
                          <Text padding={'small'}>
                            {get(registriesError, 'data.message', null) || getString('pipeline.ACR.registryError')}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                    label={getString('pipeline.ACR.registry')}
                  />
                  {getMultiTypeFromValue(getValue(formik.values.registry)) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values.registry as string}
                        type="String"
                        variableName="registry"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        isReadonly={isReadonly}
                        onChange={
                          /* istanbul ignore next */ value => {
                            formik.setFieldValue('registry', value)
                          }
                        }
                      />
                    </div>
                  )}
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="repository"
                    selectItems={repositories}
                    disabled={loadingRepositories || isReadonly}
                    placeholder={
                      loadingRepositories
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.repositoryPlaceholder')
                    }
                    multiTypeInputProps={{
                      expressions,
                      disabled: isReadonly,
                      onChange: /* istanbul ignore next */ () => resetTagList(formik),
                      selectProps: {
                        items: repositories,
                        allowCreatingNewItems: true,
                        defaultSelectedItem: formik.values.repository as SelectOption,
                        addClearBtn: !(loadingRepositories || isReadonly),
                        noResults: (
                          <Text padding={'small'}>
                            {get(repositoriesError, 'data.message', null) || getString('pipeline.ACR.repositoryError')}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                    label={getString('repository')}
                  />
                  {getMultiTypeFromValue(getValue(formik.values.repository)) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values.repository as string}
                        type="String"
                        variableName="repository"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        isReadonly={isReadonly}
                        onChange={
                          /* istanbul ignore next */ value => {
                            formik.setFieldValue('repository', value)
                          }
                        }
                      />
                    </div>
                  )}
                </div>
                <div className={css.tagGroup}>
                  <FormInput.RadioGroup
                    name="tagType"
                    radioGroup={{ inline: true }}
                    items={tagOptions}
                    className={css.radioGroup}
                  />
                </div>
                {formik.values?.tagType === 'value' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTypeInput
                      selectItems={tags}
                      disabled={isTagDisabled(formik?.values)}
                      helperText={
                        getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.FIXED &&
                        selectedArtifact &&
                        getHelpeTextForTags(
                          helperTextData(selectedArtifact, formik, getConnectorIdValue(prevStepData)),
                          getString
                        )
                      }
                      multiTypeInputProps={{
                        expressions,
                        allowableTypes,
                        selectProps: {
                          defaultSelectedItem: formik.values?.tag as SelectOption,
                          noResults: <NoTagResults tagError={acrTagError} />,
                          items: tags,
                          addClearBtn: true,
                          allowCreatingNewItems: true
                        },
                        onFocus: /* istanbul ignore next */ (e: React.FocusEvent<HTMLInputElement>) => {
                          if (
                            e?.target?.type !== 'text' ||
                            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                          ) {
                            return
                          }
                          fetchTags(
                            getValue(formik.values.subscriptionId),
                            getValue(formik.values.registry),
                            getValue(formik.values.repository)
                          )
                        }
                      }}
                      label={getString('tagLabel')}
                      name="tag"
                      className={css.tagInputButton}
                    />

                    {getMultiTypeFromValue(formik.values.tag) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values.tag as string}
                          type="String"
                          variableName="tag"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={
                            /* istanbul ignore next */ value => {
                              formik.setFieldValue('tag', value)
                            }
                          }
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {formik.values?.tagType === 'regex' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('tagRegex')}
                      name="tagRegex"
                      placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.tagRegex) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values.tagRegex as string}
                          type="String"
                          variableName="tagRegex"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={
                            /* istanbul ignore next */ value => {
                              formik.setFieldValue('tagRegex', value)
                            }
                          }
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
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
