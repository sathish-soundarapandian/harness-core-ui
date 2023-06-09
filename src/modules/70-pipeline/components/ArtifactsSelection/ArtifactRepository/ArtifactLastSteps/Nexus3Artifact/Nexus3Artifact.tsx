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
  ServiceDefinition,
  useArtifactIds,
  useGetBuildDetailsForNexusArtifact,
  useGetGroupIds,
  useGetRepositories
} from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  ArtifactType,
  ImagePathProps,
  Nexus2InitialValuesType,
  RepositoryPortOrServer
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { RepositoryFormatTypes, getAllowedRepoOptions } from '@pipeline/utils/stageHelpers'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { isValueFixed } from '@common/utils/utils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'

import { ArtifactIdentifierValidation, ModalViewFor, repositoryPortOrServer } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'

import ArtifactImagePathTagView, { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { getRequestOptions } from '../helper'

import css from '../../ArtifactConnector.module.scss'

export interface specInterface {
  artifactId?: string
  groupId?: string
  group?: string
  extension?: string
  classifier?: string
  packageName?: string
  repositoryUrl?: string
  repositoryPort?: string
  artifactPath?: string
  tag?: string
  tagRegex?: string
}
export interface queryInterface extends specInterface {
  repository: string
  repositoryFormat: string
  connectorRef?: string
}

export function Nexus3Artifact({
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
  selectedDeploymentType = '',
  isMultiArtifactSource,
  formClassName = '',
  editArtifactModePrevStepData
}: StepProps<ConnectorConfigDTO> & ImagePathProps<Nexus2InitialValuesType>): React.ReactElement {
  const { getString } = useStrings()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const { CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN } = useFeatureFlags()

  const [lastQueryData, setLastQueryData] = useState<queryInterface>({ repositoryFormat: '', repository: '' })
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [groupIds, setGroupIds] = useState<SelectOption[]>([
    {
      label: getString('common.loadingFieldOptions', {
        fieldName: getString('pipeline.artifactsSelection.groupId')
      }),
      value: getString('common.loadingFieldOptions', {
        fieldName: getString('pipeline.artifactsSelection.groupId')
      })
    }
  ])
  const [artifactIds, setArtifactIds] = useState<SelectOption[]>([
    {
      label: getString('common.loadingFieldOptions', {
        fieldName: getString('pipeline.artifactsSelection.artifactId')
      }),
      value: getString('common.loadingFieldOptions', {
        fieldName: getString('pipeline.artifactsSelection.artifactId')
      })
    }
  ])
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const schemaObject = {
    tagType: Yup.string(),
    tagRegex: Yup.string().when('tagType', {
      is: val => val === 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.string().when('tagType', {
      is: val => val === 'value',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tag'))
    }),
    repositoryFormat: Yup.string().required(getString('pipeline.artifactsSelection.validation.repositoryFormat')),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    spec: Yup.object()
      .when('repositoryFormat', {
        is: RepositoryFormatTypes.Maven,
        then: Yup.object().shape({
          artifactId: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactId')),
          groupId: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.groupId'))
        })
      })
      .when('repositoryFormat', {
        is: RepositoryFormatTypes.Raw,
        then: Yup.object().shape({
          group: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.group'))
        })
      })
      .when('repositoryFormat', {
        is: val => val === RepositoryFormatTypes.NPM || val === RepositoryFormatTypes.NuGet,
        then: Yup.object().shape({
          packageName: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.packageName'))
        })
      })
      .when('repositoryFormat', {
        is: RepositoryFormatTypes.Docker,
        then: Yup.object().shape({
          artifactPath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPath')),
          repositoryUrl: Yup.string().when('repositoryPortorRepositoryURL', {
            is: RepositoryPortOrServer.RepositoryUrl,
            then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryUrl'))
          }),
          repositoryPort: Yup.string().when('repositoryPortorRepositoryURL', {
            is: RepositoryPortOrServer.RepositoryPort,
            then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryPort'))
          })
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

  const {
    data,
    loading: nexusBuildDetailsLoading,
    refetch: refetchNexusTag,
    error: nexusTagError
  } = useGetBuildDetailsForNexusArtifact({
    queryParams: {
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
    refetch: refetchArtifacts
  } = useMutateAsGet(useArtifactIds, apiOptions)

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

  const selectRepositoryItems = useMemo(() => {
    return repositoryDetails?.data?.map(repository => ({
      value: defaultTo(repository.repositoryId, ''),
      label: defaultTo(repository.repositoryId, '')
    }))
  }, [repositoryDetails?.data])

  const getRepository = (): { label: string; value: string }[] => {
    /* istanbul ignore next */
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

  useEffect(() => {
    /* istanbul ignore next */
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchNexusTag()
    }
  }, [lastQueryData, refetchNexusTag])

  useEffect(() => {
    /* istanbul ignore next */
    if (nexusTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, nexusTagError])

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
        : formikValues.repositoryFormat === RepositoryFormatTypes.Docker
        ? lastQueryData.repositoryFormat !== formikValues.repositoryFormat ||
          lastQueryData.repository !== formikValues.repository ||
          lastQueryData.artifactPath !== formikValues.spec.artifactPath ||
          lastQueryData.repositoryUrl !== formikValues.spec.repositoryUrl ||
          lastQueryData.repositoryPort !== formikValues.spec.repositoryPort ||
          shouldFetchFieldOptions(modifiedPrevStepData, [
            formikValues.repositoryFormat,
            formikValues.repository,
            formikValues.spec.artifactPath || '',
            formikValues.spec.repositoryUrl || '',
            formikValues.spec.repositoryPort || ''
          ])
        : formikValues.repositoryFormat === RepositoryFormatTypes.Raw
        ? lastQueryData.repositoryFormat !== formikValues.repositoryFormat ||
          lastQueryData.repository !== formikValues.repository ||
          lastQueryData.group !== formikValues.spec.group ||
          shouldFetchFieldOptions(modifiedPrevStepData, [
            formikValues.repositoryFormat,
            formikValues.repository,
            formikValues.spec.group || ''
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
        let repositoryDependentFields = {}
        const optionalFields: specInterface = {}
        if (formikValues.repositoryFormat === RepositoryFormatTypes.Maven) {
          if (formikValues.spec.extension) optionalFields.extension = formikValues.spec.extension

          if (formikValues.spec.classifier) optionalFields.classifier = formikValues.spec.classifier

          repositoryDependentFields = {
            artifactId: formikValues.spec.artifactId,
            groupId: formikValues.spec.groupId,
            ...optionalFields
          }
        } else if (formikValues.repositoryFormat === RepositoryFormatTypes.Docker) {
          if (formikValues.spec.extension) optionalFields.repositoryUrl = formikValues.spec.repositoryUrl
          if (formikValues.spec.classifier) optionalFields.repositoryPort = formikValues.spec.repositoryPort

          repositoryDependentFields = {
            artifactPath: formikValues.spec.artifactPath,
            ...optionalFields
          }
        } else if (formikValues.repositoryFormat === RepositoryFormatTypes.Raw) {
          repositoryDependentFields = {
            group: formikValues.spec.group
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
          formikValue.spec.artifactId,
          formikValue.spec.groupId
        ])
      : formikValue.repositoryFormat === RepositoryFormatTypes.Docker
      ? !checkIfQueryParamsisNotEmpty([
          formikValue.repositoryFormat,
          formikValue.repository,
          formikValue.spec.artifactPath
        ])
      : formikValue.repositoryFormat === RepositoryFormatTypes.Raw
      ? !checkIfQueryParamsisNotEmpty([formikValue.repositoryFormat, formikValue.repository, formikValue.spec.group])
      : !checkIfQueryParamsisNotEmpty([
          formikValue.repositoryFormat,
          formikValue.repository,
          formikValue.spec.packageName
        ])
  }, [])

  const getInitialValues = (): Nexus2InitialValuesType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed,
      selectedDeploymentType as ServiceDefinition['type'],
      false
    ) as Nexus2InitialValuesType
  }
  const submitFormData = (formData: Nexus2InitialValuesType & { connectorId?: string }): void => {
    let specData: specInterface =
      formData.repositoryFormat === RepositoryFormatTypes.Maven
        ? {
            artifactId: formData.spec.artifactId,
            groupId: formData.spec.groupId,
            extension: formData.spec.extension,
            classifier: formData.spec.classifier
          }
        : formData.repositoryFormat === RepositoryFormatTypes.Docker
        ? {
            artifactPath: formData.spec.artifactPath
          }
        : formData.repositoryFormat === RepositoryFormatTypes.Raw
        ? {
            group: formData.spec.group
          }
        : {
            packageName: formData.spec.packageName
          }
    if (formData.repositoryFormat === RepositoryFormatTypes.Docker) {
      specData =
        formData.spec?.repositoryPortorRepositoryURL === 'repositoryUrl'
          ? {
              ...specData,
              repositoryUrl: formData.spec.repositoryUrl
            }
          : {
              ...specData,
              repositoryPort: formData.spec.repositoryPort
            }
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
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              <div className={css.imagePathContainer}>
                <FormInput.Select
                  name="repositoryFormat"
                  label={getString('common.repositoryFormat')}
                  items={getAllowedRepoOptions(selectedDeploymentType, hideHeaderAndNavBtns, selectedArtifact)}
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
                        tag: '',
                        tagRegex: '',
                        ...optionalValues
                      })
                    } else if (value.value === RepositoryFormatTypes.Raw) {
                      setLastQueryData({
                        repository: '',
                        repositoryFormat: value.value as string,
                        group: '',
                        tag: '',
                        tagRegex: ''
                      })
                    } else {
                      setLastQueryData({
                        repository: '',
                        repositoryFormat: value.value as string,
                        packageName: '',
                        tag: '',
                        tagRegex: ''
                      })
                    }

                    if (isValueFixed(formik.values.repository)) {
                      formik.setFieldValue('repository', '')
                    }

                    if (isValueFixed(formik.values.tag)) {
                      formik.setFieldValue('tag', '')
                    }

                    if (isValueFixed(formik.values.tagRegex)) {
                      formik.setFieldValue('tagRegex', '')
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
                          repository:
                            getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME
                              ? val
                              : val.value,
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
                    <ConfigureOptions
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
              {formik.values?.repositoryFormat === RepositoryFormatTypes.Maven && (
                <>
                  <div className={css.imagePathContainer}>
                    {CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN ? (
                      <>
                        <FormInput.MultiTypeInput
                          selectItems={groupIds}
                          disabled={isReadonly}
                          label={getString('pipeline.artifactsSelection.groupId')}
                          name="spec.groupId"
                          placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                          useValue
                          multiTypeInputProps={{
                            expressions,
                            allowableTypes,
                            selectProps: {
                              itemRenderer: (item, props) => itemRenderer(item, props, fetchingGroupIds),
                              items: groupIds,
                              allowCreatingNewItems: true,
                              noResults: (
                                <NoTagResults
                                  tagError={groupIdError}
                                  defaultErrorText={getString('common.filters.noResultsFound')}
                                />
                              )
                            },

                            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                              if (
                                e?.target?.type !== 'text' ||
                                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                                getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME
                              ) {
                                return
                              }
                              setGroupIds([
                                {
                                  label: getString('common.loadingFieldOptions', {
                                    fieldName: getString('pipeline.artifactsSelection.groupId')
                                  }),
                                  value: getString('common.loadingFieldOptions', {
                                    fieldName: getString('pipeline.artifactsSelection.groupId')
                                  })
                                }
                              ])
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
                          placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                          multiTypeInputProps={{
                            expressions,
                            allowableTypes,
                            selectProps: {
                              noResults: (
                                <NoTagResults
                                  tagError={artifactIdError}
                                  defaultErrorText={getString('common.filters.noResultsFound')}
                                />
                              ),
                              itemRenderer: (item, props) => itemRenderer(item, props, fetchingArtifactIds),
                              items: artifactIds,
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
                              setArtifactIds([
                                {
                                  label: getString('common.loadingFieldOptions', {
                                    fieldName: getString('pipeline.artifactsSelection.artifactId')
                                  }),
                                  value: getString('common.loadingFieldOptions', {
                                    fieldName: getString('pipeline.artifactsSelection.artifactId')
                                  })
                                }
                              ])
                              refetchArtifacts({
                                queryParams: {
                                  ...commonParams,
                                  connectorRef: getConnectorRefQueryData(),
                                  repository: formik.values?.repository,
                                  repositoryFormat: formik.values?.repositoryFormat,
                                  groupId: formik.values?.spec?.groupId,
                                  nexusSourceType: 'Nexus3Registry'
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
              )}
              {formik.values?.repositoryFormat === RepositoryFormatTypes.Docker && (
                <>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactPathLabel')}
                      name="spec.artifactPath"
                      placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.artifactPath) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.spec?.artifactPath || ''}
                          type="String"
                          variableName="spec.artifactPath"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.artifactPath', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                  <div className={css.tagGroup}>
                    <FormInput.RadioGroup
                      name="spec.repositoryPortorRepositoryURL"
                      radioGroup={{ inline: true }}
                      items={repositoryPortOrServer}
                      className={css.radioGroup}
                    />
                  </div>

                  {formik.values?.spec?.repositoryPortorRepositoryURL === RepositoryPortOrServer.RepositoryUrl && (
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('repositoryUrlLabel')}
                        name="spec.repositoryUrl"
                        placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes
                        }}
                      />

                      {getMultiTypeFromValue(formik.values.spec?.repositoryUrl) === MultiTypeInputType.RUNTIME && (
                        <div className={css.configureOptions}>
                          <ConfigureOptions
                            style={{ alignSelf: 'center' }}
                            value={formik.values?.spec?.repositoryUrl as string}
                            type={getString('string')}
                            variableName="repositoryUrl"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={value => {
                              formik.setFieldValue('spec.repositoryUrl', value)
                            }}
                            isReadonly={isReadonly}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {formik.values?.spec?.repositoryPortorRepositoryURL === RepositoryPortOrServer.RepositoryPort && (
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.artifactsSelection.repositoryPort')}
                        name="spec.repositoryPort"
                        placeholder={getString('pipeline.artifactsSelection.repositoryPortPlaceholder')}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes
                        }}
                      />

                      {getMultiTypeFromValue(formik.values.spec?.repositoryPort) === MultiTypeInputType.RUNTIME && (
                        <div className={css.configureOptions}>
                          <ConfigureOptions
                            style={{ alignSelf: 'center' }}
                            value={formik.values?.spec?.repositoryPort as unknown as string}
                            type={getString('string')}
                            variableName="repositoryPort"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={value => {
                              formik.setFieldValue('spec.repositoryPort', value)
                            }}
                            isReadonly={isReadonly}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {formik.values?.repositoryFormat === RepositoryFormatTypes.Raw && (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('rbac.group')}
                    name="spec.group"
                    placeholder={getString('pipeline.artifactsSelection.groupPlaceholder')}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.spec?.group) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values?.spec?.group || ''}
                        type="String"
                        variableName="spec.group"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.group', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              )}
              {(formik.values?.repositoryFormat === RepositoryFormatTypes.NPM ||
                formik.values?.repositoryFormat === RepositoryFormatTypes.NuGet) && (
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
                tooltipId="nexus3-tag"
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
        )}
      </Formik>
    </Layout.Vertical>
  )
}
