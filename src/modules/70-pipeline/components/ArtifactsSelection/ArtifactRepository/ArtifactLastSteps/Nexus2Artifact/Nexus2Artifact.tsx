/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState, useEffect, useMemo } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  SelectOption
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { merge, defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  DockerBuildDetailsDTO,
  useArtifactIds,
  useGetBuildDetailsForNexusArtifact,
  useGetGroupIds,
  useGetRepositories
} from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  getConnectorIdValue,
  getArtifactFormData,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns,
  canFetchAMITags
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  ImagePathProps,
  Nexus2InitialValuesType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { nexus2RepositoryFormatTypes, RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { isValueFixed } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'

import ArtifactImagePathTagView, { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import type { queryInterface } from '../Nexus3Artifact/Nexus3Artifact'
import { getRequestOptions } from '../helper'

import css from '../../ArtifactConnector.module.scss'

export function Nexus2Artifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  isMultiArtifactSource,
  formClassName = '',
  editArtifactModePrevStepData
}: StepProps<ConnectorConfigDTO> & ImagePathProps<Nexus2InitialValuesType>): React.ReactElement {
  const { getString } = useStrings()
  const { CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN } = useFeatureFlags()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const [lastQueryData, setLastQueryData] = useState<queryInterface>({ repositoryFormat: '', repository: '' })
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const [groupIds, setGroupIds] = useState<SelectOption[]>([])
  const [artifactIds, setArtifactIds] = useState<SelectOption[]>([])

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const schemaObject = {
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    }),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    repositoryFormat: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.repositoryFormat')),

    spec: Yup.object()
      .when('repositoryFormat', {
        is: RepositoryFormatTypes.Maven,
        then: Yup.object().shape({
          artifactId: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactId')),
          groupId: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.groupId'))
        })
      })
      .when('repositoryFormat', {
        is: repositoryFormat =>
          repositoryFormat === RepositoryFormatTypes.NPM || repositoryFormat === RepositoryFormatTypes.NuGet,
        then: Yup.object().shape({
          packageName: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.packageName'))
        })
      })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return defaultTo(modifiedPrevStepData?.connectorId?.value, modifiedPrevStepData?.identifier)
  }

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    data: repositoryDetails,
    refetch: refetchRepositoryDetails,
    loading: fetchingRepository,
    error: errorFetchingRepository
  } = useMutateAsGet(useGetRepositories, {
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: getConnectorRefQueryData(),
      repositoryFormat: ''
    }
  })

  const apiOptions = getRequestOptions({
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: getConnectorRefQueryData(),
    repository: lastQueryData.repository
  })

  const {
    data: groupIdData,
    loading: fetchingGroupIds,
    error: groupIdError,
    refetch: refetchGroupIds
  } = useMutateAsGet(useGetGroupIds, apiOptions)

  const {
    data: artifactIdData,
    loading: fetchingArtifactIds,
    error: artifactIdError,
    refetch: refetchArtifactIds
  } = useMutateAsGet(useArtifactIds, apiOptions)

  const selectRepositoryItems = useMemo(() => {
    return repositoryDetails?.data?.map(repository => ({
      value: defaultTo(repository.repositoryId, ''),
      label: defaultTo(repository.repositoryId, '')
    }))
  }, [repositoryDetails?.data])

  useEffect(() => {
    const groupOptions: SelectOption[] = (groupIdData?.data || [])?.map(group => {
      return {
        label: group,
        value: group
      } as SelectOption
    }) || [
      {
        label: getString('common.loadingFieldOptions', {
          fieldName: getString('pipeline.artifactsSelection.groupId')
        }),
        value: getString('common.loadingFieldOptions', {
          fieldName: getString('pipeline.artifactsSelection.groupId')
        })
      }
    ]
    setGroupIds(groupOptions)
  }, [groupIdData?.data])

  useEffect(() => {
    if (groupIdError) {
      setGroupIds([])
    }
  }, [groupIdError])

  useEffect(() => {
    if (artifactIdError) {
      setArtifactIds([])
    }
  }, [artifactIdError])

  useEffect(() => {
    const artifactOptions: SelectOption[] = (artifactIdData?.data || [])?.map(artifact => {
      return {
        label: artifact,
        value: artifact
      } as SelectOption
    }) || [
      {
        label: getString('common.loadingFieldOptions', {
          fieldName: getString('pipeline.artifactsSelection.artifactId')
        }),
        value: getString('common.loadingFieldOptions', {
          fieldName: getString('pipeline.artifactsSelection.artifactId')
        })
      }
    ]
    setArtifactIds(artifactOptions)
  }, [artifactIdData?.data])

  const getRepository = (): { label: string; value: string }[] => {
    if (fetchingRepository) {
      return [
        {
          label: getString('pipeline.artifactsSelection.loadingRepository'),
          value: getString('pipeline.artifactsSelection.loadingRepository')
        }
      ]
    }
    return defaultTo(selectRepositoryItems, [])
  }

  const {
    data,
    loading: nexusBuildDetailsLoading,
    refetch: refetchNexusTag,
    error: nexusTagError
  } = useGetBuildDetailsForNexusArtifact({
    queryParams: {
      // artifactPath: lastQueryData.artifactPath,
      ...lastQueryData,
      repository: lastQueryData.repository,
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchNexusTag()
    }
  }, [lastQueryData, refetchNexusTag])

  useEffect(() => {
    if (nexusTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList) && !fetchingRepository) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, nexusTagError])

  const canFetchTags = useCallback(
    (formikValues: Nexus2InitialValuesType): boolean => {
      return !!(formikValues.repositoryFormat === RepositoryFormatTypes.Maven
        ? lastQueryData.repositoryFormat !== formikValues.repositoryFormat ||
          lastQueryData.repository !== formikValues.repository ||
          lastQueryData.artifactId !== formikValues.spec.artifactId ||
          lastQueryData.groupId !== formikValues.spec.groupId ||
          lastQueryData.extension !== formikValues.spec.extension ||
          lastQueryData.classifier !== formikValues.spec.classifier ||
          shouldFetchFieldOptions(modifiedPrevStepData, [
            formikValues.repositoryFormat,
            formikValues.repository,
            formikValues.spec.artifactId || '',
            formikValues.spec.groupId || '',
            formikValues.spec.extension || '',
            formikValues.spec.classifier || ''
          ])
        : lastQueryData.repositoryFormat !== formikValues.repositoryFormat ||
          lastQueryData.repository !== formikValues.repository ||
          lastQueryData.packageName !== formikValues.spec.packageName ||
          shouldFetchFieldOptions(modifiedPrevStepData, [
            formikValues.repositoryFormat,
            formikValues.repository,
            formikValues.spec.packageName || ''
          ]))
    },
    [lastQueryData, modifiedPrevStepData]
  )
  const fetchTags = useCallback(
    (formikValues: Nexus2InitialValuesType): void => {
      if (canFetchTags(formikValues)) {
        let repositoryDependentFields: any = {}
        if (formikValues.repositoryFormat === RepositoryFormatTypes.Maven) {
          const optionalFields: any = {}
          if (formikValues.spec.extension) optionalFields.extension = formikValues.spec.extension

          if (formikValues.spec.classifier) optionalFields.classifier = formikValues.spec.classifier

          repositoryDependentFields = {
            artifactId: formikValues.spec.artifactId,
            groupId: formikValues.spec.groupId,
            ...optionalFields
          }
        } else {
          repositoryDependentFields = {
            packageName: formikValues.spec.packageName
          }
        }
        setLastQueryData({
          repository: formikValues.repository,
          repositoryFormat: formikValues.repositoryFormat,
          ...repositoryDependentFields
        })
      }
    },
    [canFetchTags]
  )
  const isTagDisabled = useCallback((formikValue: Nexus2InitialValuesType): boolean => {
    return formikValue.repositoryFormat === RepositoryFormatTypes.Maven
      ? !checkIfQueryParamsisNotEmpty([
          formikValue.repositoryFormat,
          formikValue.repository,
          formikValue.spec?.artifactId,
          formikValue.spec?.groupId
        ])
      : !checkIfQueryParamsisNotEmpty([
          formikValue.repositoryFormat,
          formikValue.repository,
          formikValue?.spec?.packageName
        ])
  }, [])

  const getInitialValues = (): Nexus2InitialValuesType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as Nexus2InitialValuesType
  }
  const submitFormData = (formData: Nexus2InitialValuesType & { connectorId?: string }): void => {
    // const artifactObj = getFinalArtifactObj(formData, context === ModalViewFor.SIDECAR)
    const specData =
      formData.repositoryFormat === RepositoryFormatTypes.Maven
        ? {
            artifactId: formData.spec.artifactId,
            groupId: formData.spec.groupId,
            extension: formData.spec.extension,
            classifier: formData.spec.classifier
          }
        : {
            packageName: formData.spec.packageName
          }
    const tagData =
      formData.tagType === 'value'
        ? {
            tag: defaultTo(formData.tag?.value, formData.tag)
          }
        : {
            tagRegex: formData.tagRegex
          }
    const formatedFormData = {
      spec: {
        connectorRef: formData.connectorId,
        repository: formData?.repository,
        repositoryFormat: formData?.repositoryFormat,
        ...tagData,
        spec: {
          ...specData
        }
      }
    }
    if (isIdentifierAllowed) {
      merge(formatedFormData, { identifier: formData?.identifier })
    }
    handleSubmit(formatedFormData)
  }

  const handleValidate = (formData: Nexus2InitialValuesType & { connectorId?: string }) => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        connectorId: getConnectorIdValue(modifiedPrevStepData)
      })
    }
  }
  const itemRenderer = memoize((item: { label: string }, { handleClick }, disabled) => (
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
  ))

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isMultiArtifactSource ? sidecarSchema : primarySchema}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData?.({
            ...modifiedPrevStepData,
            ...formData,
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          })
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <div className={cx(css.artifactForm, formClassName)}>
                {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                <div className={css.imagePathContainer}>
                  <FormInput.Select
                    name="repositoryFormat"
                    label={getString('common.repositoryFormat')}
                    items={nexus2RepositoryFormatTypes}
                    onChange={value => {
                      if (value.value === RepositoryFormatTypes.Maven) {
                        const optionalValues: { extension?: string; classifier?: string } = {}
                        if (formik.values?.spec?.classifier) {
                          optionalValues.classifier = formik.values?.spec?.classifier
                        }
                        if (formik.values?.spec?.extension) {
                          optionalValues.extension = formik.values?.spec?.extension
                        }
                        setLastQueryData({
                          repository: '',
                          repositoryFormat: RepositoryFormatTypes.Maven,
                          artifactId: '',
                          groupId: '',
                          ...optionalValues
                        })
                      } else {
                        setLastQueryData({
                          repository: '',
                          repositoryFormat: value.value as string,
                          packageName: ''
                        })
                      }
                    }}
                  />
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    selectItems={getRepository()}
                    disabled={isReadonly}
                    label={getString('repository')}
                    name="repository"
                    placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                    useValue
                    multiTypeInputProps={{
                      expressions,
                      allowableTypes,
                      selectProps: {
                        noResults: (
                          <NoTagResults
                            tagError={errorFetchingRepository}
                            isServerlessDeploymentTypeSelected={false}
                            defaultErrorText={getString('pipeline.artifactsSelection.errors.noRepositories')}
                          />
                        ),
                        itemRenderer: (item, props) => itemRenderer(item, props, fetchingRepository),
                        items: getRepository(),
                        allowCreatingNewItems: true
                      },
                      onChange: (val: any) => {
                        if (isValueFixed(val)) {
                          formik.setValues({
                            ...formik.values,
                            repository: val.value,
                            spec: {
                              ...formik.values.spec,
                              groupId: '',
                              artifactId: ''
                            }
                          })

                          setGroupIds([])
                          setArtifactIds([])
                        }
                      },
                      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                        if (
                          e?.target?.type !== 'text' ||
                          (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                          getMultiTypeFromValue(formik.values?.repositoryFormat) === MultiTypeInputType.RUNTIME
                        ) {
                          return
                        }
                        refetchRepositoryDetails({
                          queryParams: {
                            ...commonParams,
                            connectorRef: getConnectorRefQueryData(),
                            repositoryFormat: formik.values?.repositoryFormat
                          }
                        })
                      }
                    }}
                  />
                  {getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <SelectConfigureOptions
                        options={getRepository()}
                        loading={fetchingRepository}
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.repository as string}
                        type={getString('string')}
                        variableName="repository"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('repository', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
                {formik.values?.repositoryFormat === RepositoryFormatTypes.Maven ? (
                  <>
                    <div className={css.imagePathContainer}>
                      {CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN ? (
                        <>
                          <FormInput.MultiTypeInput
                            selectItems={groupIds}
                            useValue
                            label={getString('pipeline.artifactsSelection.groupId')}
                            name="spec.groupId"
                            placeholder={
                              fetchingGroupIds
                                ? getString('common.loadingFieldOptions', {
                                    fieldName: getString('pipeline.artifactsSelection.groupId')
                                  })
                                : getString('pipeline.artifactsSelection.groupIdPlaceholder')
                            }
                            multiTypeInputProps={{
                              expressions,
                              allowableTypes,
                              selectProps: {
                                allowCreatingNewItems: true,
                                itemRenderer: (item, props) => itemRenderer(item, props, fetchingGroupIds),
                                items: groupIds,
                                loadingItems: fetchingGroupIds,

                                noResults: !fetchingGroupIds ? (
                                  <NoTagResults
                                    tagError={groupIdError}
                                    isServerlessDeploymentTypeSelected={false}
                                    defaultErrorText={
                                      fetchingGroupIds
                                        ? getString('loading')
                                        : getString('common.filters.noResultsFound')
                                    }
                                  />
                                ) : null
                              },
                              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                                if (
                                  e?.target?.type !== 'text' ||
                                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                                  getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME ||
                                  getMultiTypeFromValue(formik.values?.spec?.groupId) === MultiTypeInputType.RUNTIME
                                ) {
                                  return
                                }

                                refetchGroupIds({
                                  queryParams: {
                                    ...commonParams,
                                    connectorRef: getConnectorRefQueryData(),
                                    repository: formik.values?.repository,
                                    repositoryFormat: formik.values?.repositoryFormat
                                  }
                                })
                              }
                            }}
                          />
                          {getMultiTypeFromValue(formik.values?.spec?.groupId) === MultiTypeInputType.RUNTIME && (
                            <div className={css.configureOptions}>
                              <SelectConfigureOptions
                                options={groupIds}
                                loading={fetchingGroupIds}
                                style={{ alignSelf: 'center' }}
                                value={formik.values?.spec?.groupId as string}
                                type={getString('string')}
                                variableName="spec.groupId"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => {
                                  formik.setFieldValue('spec.groupId', value)
                                }}
                                isReadonly={isReadonly}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <FormInput.MultiTextInput
                            label={getString('pipeline.artifactsSelection.groupId')}
                            name="spec.groupId"
                            placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                            multiTextInputProps={{ expressions, allowableTypes }}
                          />
                          {getMultiTypeFromValue(formik.values?.spec?.groupId) === MultiTypeInputType.RUNTIME && (
                            <div className={css.configureOptions}>
                              <ConfigureOptions
                                value={formik.values?.spec?.groupId || ''}
                                type="String"
                                variableName="spec.groupId"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => {
                                  formik.setFieldValue('spec.groupId', value)
                                }}
                                isReadonly={isReadonly}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={css.imagePathContainer}>
                      {CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN ? (
                        <>
                          <FormInput.MultiTypeInput
                            selectItems={artifactIds}
                            useValue
                            label={getString('pipeline.artifactsSelection.artifactId')}
                            name="spec.artifactId"
                            placeholder={
                              fetchingArtifactIds
                                ? getString('common.loadingFieldOptions', {
                                    fieldName: getString('pipeline.artifactsSelection.artifactId')
                                  })
                                : getString('pipeline.artifactsSelection.artifactIdPlaceholder')
                            }
                            multiTypeInputProps={{
                              expressions,
                              allowableTypes,
                              selectProps: {
                                noResults: !fetchingArtifactIds ? (
                                  <NoTagResults
                                    tagError={artifactIdError}
                                    defaultErrorText={
                                      fetchingArtifactIds
                                        ? getString('loading')
                                        : getString('common.filters.noResultsFound')
                                    }
                                  />
                                ) : null,
                                itemRenderer: (item, props) => itemRenderer(item, props, fetchingArtifactIds),
                                items: artifactIds,
                                loadingItems: fetchingArtifactIds,
                                allowCreatingNewItems: true
                              },
                              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                                if (
                                  e?.target?.type !== 'text' ||
                                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                                  getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME ||
                                  getMultiTypeFromValue(formik.values?.spec?.artifactId) === MultiTypeInputType.RUNTIME
                                ) {
                                  return
                                }

                                refetchArtifactIds({
                                  queryParams: {
                                    ...commonParams,
                                    connectorRef: getConnectorRefQueryData(),
                                    repository: formik.values?.repository,
                                    repositoryFormat: formik.values?.repositoryFormat,
                                    groupId: formik.values?.spec?.groupId,
                                    nexusSourceType: 'Nexus2Registry'
                                  }
                                })
                              }
                            }}
                          />
                          {getMultiTypeFromValue(formik.values?.spec?.artifactId) === MultiTypeInputType.RUNTIME && (
                            <div className={css.configureOptions}>
                              <SelectConfigureOptions
                                options={artifactIds}
                                loading={fetchingArtifactIds}
                                style={{ alignSelf: 'center' }}
                                value={formik.values?.spec?.artifactId as string}
                                type={getString('string')}
                                variableName="spec.artifactId"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => {
                                  formik.setFieldValue('spec.artifactId', value)
                                }}
                                isReadonly={isReadonly}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <FormInput.MultiTextInput
                            label={getString('pipeline.artifactsSelection.artifactId')}
                            name="spec.artifactId"
                            placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                            multiTextInputProps={{ expressions, allowableTypes }}
                          />
                          {getMultiTypeFromValue(formik.values?.spec?.artifactId) === MultiTypeInputType.RUNTIME && (
                            <div className={css.configureOptions}>
                              <ConfigureOptions
                                value={formik.values?.spec?.artifactId || ''}
                                type="String"
                                variableName="spec.artifactId"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => {
                                  formik.setFieldValue('spec.artifactId', value)
                                }}
                                isReadonly={isReadonly}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.artifactsSelection.extension')}
                        name="spec.extension"
                        placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
                        multiTextInputProps={{ expressions, allowableTypes }}
                      />
                      {getMultiTypeFromValue(formik.values?.spec?.extension) === MultiTypeInputType.RUNTIME && (
                        <div className={css.configureOptions}>
                          <ConfigureOptions
                            value={formik.values?.spec?.extension || ''}
                            type="String"
                            variableName="spec.extension"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={value => {
                              formik.setFieldValue('spec.extension', value)
                            }}
                            isReadonly={isReadonly}
                          />
                        </div>
                      )}
                    </div>
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.artifactsSelection.classifier')}
                        name="spec.classifier"
                        placeholder={getString('pipeline.artifactsSelection.classifierPlaceholder')}
                        multiTextInputProps={{ expressions, allowableTypes }}
                      />
                      {getMultiTypeFromValue(formik.values?.spec?.classifier) === MultiTypeInputType.RUNTIME && (
                        <div className={css.configureOptions}>
                          <ConfigureOptions
                            value={formik.values?.spec?.classifier || ''}
                            type="String"
                            variableName="spec.classifier"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={value => {
                              formik.setFieldValue('spec.classifier', value)
                            }}
                            isReadonly={isReadonly}
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.packageName')}
                      name="spec.packageName"
                      placeholder={getString('pipeline.manifestType.packagePlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.packageName) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.spec?.packageName || ''}
                          type="String"
                          variableName="spec.packageName"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.packageName', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}
                <ArtifactImagePathTagView
                  selectedArtifact={selectedArtifact as ArtifactType}
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  isReadonly={isReadonly}
                  connectorIdValue={getConnectorIdValue(modifiedPrevStepData)}
                  fetchTags={() => fetchTags(formik.values)}
                  buildDetailsLoading={nexusBuildDetailsLoading}
                  tagError={nexusTagError}
                  tagList={tagList}
                  setTagList={setTagList}
                  tagDisabled={isTagDisabled(formik?.values)}
                  isArtifactPath={false}
                  isImagePath={false}
                  canFetchTags={() =>
                    canFetchAMITags(
                      formik?.values?.repository,
                      formik?.values?.spec?.groupId,
                      formik?.values?.spec?.artifactId
                    )
                  }
                  tooltipId="nexus2-tag"
                />
              </div>
              {!hideHeaderAndNavBtns && (
                <Layout.Horizontal spacing="medium">
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(modifiedPrevStepData)}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              )}
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
