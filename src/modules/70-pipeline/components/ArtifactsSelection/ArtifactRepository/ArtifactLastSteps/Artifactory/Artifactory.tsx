/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption,
  FormikForm
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import type { FormikProps, FormikValues } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get, isEqual, memoize, merge, filter } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ArtifactoryImagePath,
  ConnectorConfigDTO,
  DockerBuildDetailsDTO,
  Failure,
  Error,
  useGetBuildDetailsForArtifactoryArtifact,
  useGetImagePathsForArtifactory,
  ServiceDefinition
} from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  defaultArtifactInitialValues,
  getArtifactFormData,
  getArtifactPathToFetchTags,
  getConnectorIdValue,
  getFinalArtifactFormObj,
  resetTag,
  shouldFetchFieldOptions,
  helperTextData,
  getConnectorRefQueryData,
  shouldHideHeaderAndNavBtns,
  isTemplateView
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  getHelpeTextForTags,
  isAzureWebAppDeploymentType,
  isAzureWebAppOrSshWinrmGenericDeploymentType,
  isCustomDeploymentType,
  isServerlessDeploymentType,
  isSshOrWinrmDeploymentType,
  isTASDeploymentType,
  repositoryFormats,
  RepositoryFormatTypes,
  isAWSLambdaDeploymentType
} from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type {
  ArtifactType,
  ImagePathProps,
  ImagePathTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults, selectItemsMapper } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import ServerlessArtifactoryRepository from './ServerlessArtifactoryRepository'
import css from '../../ArtifactConnector.module.scss'

const getRepositoryValue = (
  formData: ImagePathTypes & { connectorId?: string },
  isGenericArtifactory = false
): string => {
  if (isGenericArtifactory) {
    if ((formData?.repository as SelectOption)?.value) {
      return (formData?.repository as SelectOption)?.value as string
    }
  }
  return formData?.repository as string
}

const getRepositoryFormat = (values: ImagePathTypes & { spec?: any }): string | undefined => {
  return defaultTo(values?.spec?.repositoryFormat, values?.repositoryFormat)
}

function Artifactory({
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
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const isArtifactTemplate = isTemplateView(context)
  const [lastQueryData, setLastQueryData] = useState({ artifactPath: '', repository: '' })
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const [error, setError] = useState<boolean>(false)
  const isServerlessDeploymentTypeSelected = isServerlessDeploymentType(selectedDeploymentType)
  const isSSHWinRmDeploymentType = isSshOrWinrmDeploymentType(selectedDeploymentType)
  const isAzureWebAppDeploymentTypeSelected = isAzureWebAppDeploymentType(selectedDeploymentType)
  const isCustomDeploymentTypeSelected = isCustomDeploymentType(selectedDeploymentType)
  const isTasDeploymentTypeSelected = isTASDeploymentType(selectedDeploymentType)
  const isAWSLambdaDeploymentTypeSelected = isAWSLambdaDeploymentType(selectedDeploymentType)
  const CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY = useFeatureFlag(FeatureFlag.CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY)

  const showRepositoryFormatForAllowedTypes =
    isSSHWinRmDeploymentType ||
    isAzureWebAppDeploymentTypeSelected ||
    isCustomDeploymentTypeSelected ||
    isTasDeploymentTypeSelected ||
    isArtifactTemplate

  // For Serverless and AWS Lambda, there is not dropdown for repositoryFormat to select from
  // By default, UI should be rendered assuming repositoryFormat is Generic
  const shouldChooseGenericAsDefault = isServerlessDeploymentTypeSelected || isAWSLambdaDeploymentTypeSelected

  const [repositoryFormat, setRepositoryFormat] = useState<string | undefined>(
    get(
      initialValues,
      'spec.repositoryFormat',
      showRepositoryFormatForAllowedTypes || shouldChooseGenericAsDefault
        ? RepositoryFormatTypes.Generic
        : RepositoryFormatTypes.Docker
    )
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const isAzureWebAppGenericTypeSelected = isAzureWebAppOrSshWinrmGenericDeploymentType(
    selectedDeploymentType,
    getRepositoryFormat(initialValues)
  )
  const [isAzureWebAppGeneric, setIsAzureWebAppGeneric] = useState<boolean>(isAzureWebAppGenericTypeSelected)

  const isGenericArtifactory = React.useMemo(() => {
    return repositoryFormat === RepositoryFormatTypes.Generic
  }, [repositoryFormat])

  useEffect(() => {
    let repoFormat = RepositoryFormatTypes.Docker
    if (shouldChooseGenericAsDefault) repoFormat = RepositoryFormatTypes.Generic
    if (showRepositoryFormatForAllowedTypes) {
      const repoFormatFromValues = getRepositoryFormat(initialValues) as RepositoryFormatTypes
      repoFormat = repoFormatFromValues ? repoFormatFromValues : RepositoryFormatTypes.Generic
    }
    setRepositoryFormat(repoFormat)
  }, [])

  const schemaObject = {
    artifactPath: Yup.lazy(value =>
      typeof value === 'object'
        ? Yup.object().required(getString('pipeline.artifactsSelection.validation.artifactPath')) // typeError is necessary here, otherwise we get a bad-looking yup error
        : Yup.string().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    ),
    repository: Yup.lazy(value =>
      typeof value === 'object'
        ? Yup.object().required(getString('common.git.validation.repoRequired')) // typeError is necessary here, otherwise we get a bad-looking yup error
        : Yup.string().required(getString('common.git.validation.repoRequired'))
    ),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    }),
    ...(CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY && {
      repositoryUrl: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryUrl'))
    })
  }

  const serverlessArtifactorySchema = {
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    artifactDirectory: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.artifactDirectory')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPathFilter'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)

  const serverlessPrimarySchema = Yup.object().shape(serverlessArtifactorySchema)

  const connectorRef = getConnectorIdValue(modifiedPrevStepData)

  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const serverlessSidecarSchema = Yup.object().shape({
    ...serverlessArtifactorySchema,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const isArtifactDisabled = (formik: FormikProps<ImagePathTypes>) => {
    if (
      getMultiTypeFromValue(formik?.values?.repository) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(modifiedPrevStepData?.connectorId) === MultiTypeInputType.RUNTIME
    )
      return true
    return !(
      (formik.values?.repository as SelectOption)?.value?.toString()?.length ||
      formik.values?.repository?.toString()?.length
    )
  }

  const {
    data,
    loading: artifactoryBuildDetailsLoading,
    refetch: refetchArtifactoryTag,
    error: artifactoryTagError
  } = useGetBuildDetailsForArtifactoryArtifact({
    queryParams: {
      artifactPath: lastQueryData.artifactPath,
      repository: lastQueryData.repository,
      repositoryFormat,
      connectorRef: getConnectorRefQueryData(modifiedPrevStepData),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  const {
    data: imagePathData,
    loading: imagePathLoading,
    refetch: refetchImagePathData,
    error: imagePathError
  } = useGetImagePathsForArtifactory({
    queryParams: {
      repository: lastQueryData.repository,
      connectorRef: getConnectorRefQueryData(modifiedPrevStepData),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (imagePathLoading) {
      setArtifactPaths([{ label: getString('loading'), value: getString('loading') }])
    }
    if ((imagePathError?.data as Failure)?.status === 'ERROR') {
      const errorMessage = (imagePathError?.data as Failure)?.message as string
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    } else if ((imagePathError?.data as Failure)?.status === 'FAILURE') {
      const erroObj = (imagePathError?.data as Failure)?.errors?.[0]
      const errorMessage =
        erroObj?.fieldId && erroObj?.error ? `${erroObj?.fieldId} ${erroObj?.error}` : getString('somethingWentWrong')
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    }
  }, [imagePathLoading, imagePathError])

  useEffect(() => {
    if (imagePathData) {
      setArtifactPaths(
        imagePathData.data?.imagePaths?.map((imagePath: ArtifactoryImagePath) => ({
          label: imagePath.imagePath || '',
          value: imagePath.imagePath || ''
        })) || []
      )
    }
  }, [imagePathData, connectorRef])

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchArtifactoryTag()
    }
  }, [lastQueryData, refetchArtifactoryTag])
  useEffect(() => {
    if (artifactoryTagError && !error) {
      setError(true)
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList) && !isEqual(data?.data?.buildDetailsList, tagList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, artifactoryTagError, error, tagList])

  const canFetchTags = useCallback(
    (artifactPath: string, repository: string): boolean => {
      return !!(
        (lastQueryData.artifactPath !== artifactPath || lastQueryData.repository !== repository) &&
        shouldFetchFieldOptions(modifiedPrevStepData, [artifactPath, repository])
      )
    },
    [lastQueryData, modifiedPrevStepData]
  )
  const fetchTags = useCallback(
    (artifactPath = '', repository = ''): void => {
      if (canFetchTags(artifactPath, repository)) {
        setLastQueryData({ artifactPath, repository })
      }
    },
    [canFetchTags]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactPath, formikValue.repository])
  }, [])

  const isArtifactPathDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactDirectory, formikValue.repository])
  }, [])

  const getInitialValues = useCallback((): ImagePathTypes => {
    const artifactFormDataValues = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed,
      selectedDeploymentType as ServiceDefinition['type'],
      isGenericArtifactory
    ) as ImagePathTypes
    if (
      getMultiTypeFromValue(artifactFormDataValues.artifactPath) === MultiTypeInputType.FIXED &&
      (artifactFormDataValues.artifactPath as string)?.length
    ) {
      artifactFormDataValues.artifactPath = {
        label: artifactFormDataValues?.artifactPath,
        value: artifactFormDataValues?.artifactPath
      } as SelectOption
    }
    return artifactFormDataValues
  }, [initialValues, selectedArtifact, isIdentifierAllowed, isGenericArtifactory])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactFormObj(formData, isIdentifierAllowed, isGenericArtifactory)
    merge(artifactObj.spec, {
      repository: getRepositoryValue(formData, isGenericArtifactory),
      repositoryUrl: formData?.repositoryUrl,
      repositoryFormat: defaultTo(formData.repositoryFormat, repositoryFormat)
    })

    if (isAzureWebAppGeneric) {
      delete artifactObj?.spec?.repositoryUrl
    }

    handleSubmit(artifactObj)
  }

  const handleValidate = (formData: ImagePathTypes & { connectorId?: string }) => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        repository: defaultTo((formData?.repository as SelectOption)?.value, formData?.repository) as string,
        artifactPath: defaultTo((formData?.artifactPath as SelectOption)?.value, formData?.artifactPath) as string,
        tag: defaultTo(formData?.tag?.value, formData?.tag),
        connectorId: getConnectorIdValue(modifiedPrevStepData)
      })
    }
  }

  const getValidationSchema = useCallback(() => {
    if (isGenericArtifactory) {
      if (isIdentifierAllowed) {
        return serverlessSidecarSchema
      }
      return serverlessPrimarySchema
    }
    if (isIdentifierAllowed) {
      return sidecarSchema
    }
    return primarySchema
  }, [context, isGenericArtifactory, primarySchema, serverlessPrimarySchema, sidecarSchema])

  const loadingPlaceholderText = shouldChooseGenericAsDefault
    ? getString('pipeline.artifactsSelection.loadingArtifactPaths')
    : getString('pipeline.artifactsSelection.loadingTags')

  const getSelectItems = useCallback(selectItemsMapper.bind(null, tagList, isGenericArtifactory), [
    tagList,
    isGenericArtifactory
  ])

  const tags = React.useMemo(
    () =>
      artifactoryBuildDetailsLoading
        ? [{ label: loadingPlaceholderText, value: loadingPlaceholderText }]
        : defaultTo(
            filter(getSelectItems(), (option: SelectOption) => option?.label && option?.value),
            []
          ),
    [artifactoryBuildDetailsLoading, loadingPlaceholderText, getSelectItems]
  ) as SelectOption[]

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={artifactoryBuildDetailsLoading} />
  ))

  const imagePathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => {
    const isDisabled =
      imagePathLoading ||
      (imagePathError?.data as Error)?.status === 'ERROR' ||
      (imagePathError?.data as Failure)?.status === 'FAILURE'
    return <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={isDisabled} />
  })

  const onTagInputFocus = (e: React.FocusEvent<HTMLInputElement>, formik: FormikValues): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    const artifactPathValue: SelectOption | string = getArtifactPathToFetchTags(formik, true, isGenericArtifactory)
    fetchTags(
      defaultTo((artifactPathValue as SelectOption)?.value, artifactPathValue),
      defaultTo(formik.values?.repository?.value, formik.values?.repository)
    )
  }

  const getTagFieldHelperText = (formikForm: FormikProps<ImagePathTypes>) => {
    return (
      getMultiTypeFromValue(formikForm.values?.tag) === MultiTypeInputType.FIXED &&
      getHelpeTextForTags(
        helperTextData(selectedArtifact, formikForm, getConnectorIdValue(modifiedPrevStepData)),
        getString,
        isGenericArtifactory
      )
    )
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
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            repository: defaultTo((formData?.repository as SelectOption)?.value, formData?.repository) as string,
            artifactPath: defaultTo((formData?.artifactPath as SelectOption)?.value, formData?.artifactPath) as string,
            tag: defaultTo(formData?.tag?.value, formData?.tag),
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          })
        }}
      >
        {formik => {
          const onChangeImageArtifactPath = (): void => {
            tagList?.length && setTagList([])
            resetTag(formik)
          }
          return (
            <FormikForm>
              <div className={cx(css.artifactForm, formClassName)}>
                {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                {showRepositoryFormatForAllowedTypes && (
                  <div className={css.imagePathContainer}>
                    <FormInput.Select
                      name="repositoryFormat"
                      label={getString('common.repositoryFormat')}
                      items={repositoryFormats}
                      onChange={selectedRepoFormatValue => {
                        setTagList([])
                        setArtifactPaths([])
                        setRepositoryFormat(selectedRepoFormatValue?.value as string)
                        if (selectedArtifact) {
                          formik.setValues({
                            ...defaultArtifactInitialValues(selectedArtifact),
                            identifier: formik.values.identifier,
                            repositoryFormat: selectedRepoFormatValue?.value
                          })
                        }
                        setIsAzureWebAppGeneric(
                          showRepositoryFormatForAllowedTypes &&
                            selectedRepoFormatValue?.value === RepositoryFormatTypes.Generic
                        )
                      }}
                    />
                  </div>
                )}

                <ServerlessArtifactoryRepository
                  connectorRef={getConnectorIdValue(modifiedPrevStepData)}
                  isReadonly={isReadonly}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  formik={formik}
                  repoFormat={repositoryFormat}
                  fieldName={'repository'}
                  stepViewType={StepViewType.Edit}
                  onChange={(value: SelectOption) => {
                    if (
                      value.value !== formik.values.repository &&
                      getMultiTypeFromValue(value) === MultiTypeInputType.FIXED &&
                      value
                    ) {
                      setArtifactPaths([])
                      setTagList([])
                      if (isGenericArtifactory) {
                        formik.setValues({
                          ...formik.values,
                          repository: value.value as string,
                          artifactDirectory:
                            getMultiTypeFromValue(get(formik.values, 'artifactDirectory', '')) ===
                            MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'artifactDirectory', ''),
                          tag:
                            getMultiTypeFromValue(get(formik.values, 'tag', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tag', ''),
                          tagRegex:
                            getMultiTypeFromValue(get(formik.values, 'tagRegex', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tagRegex', '')
                        })
                      } else {
                        formik.setValues({
                          ...formik.values,
                          repository: value.value as string,
                          artifactPath:
                            getMultiTypeFromValue(get(formik.values, 'artifactPath', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'artifactPath', ''),
                          tag:
                            getMultiTypeFromValue(get(formik.values, 'tag', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tag', ''),
                          tagRegex:
                            getMultiTypeFromValue(get(formik.values, 'tagRegex', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tagRegex', '')
                        })
                      }
                    }
                  }}
                />

                {isGenericArtifactory && (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.artifactDirectory')}
                      name="artifactDirectory"
                      placeholder={getString('pipeline.artifactsSelection.artifactDirectoryPlaceholder')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                      onChange={() => {
                        resetTag(formik)
                      }}
                    />

                    {getMultiTypeFromValue(formik.values.artifactDirectory) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.artifactDirectory as string}
                          type={getString('string')}
                          variableName="artifactDirectory"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('artifactDirectory', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}

                {isGenericArtifactory ? null : (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTypeInput
                      selectItems={artifactPaths}
                      helperText={
                        getMultiTypeFromValue(formik?.values?.artifactPath) === MultiTypeInputType.FIXED &&
                        getHelpeTextForTags(
                          {
                            repository: formik.values?.repository as string,
                            connectorRef: getConnectorIdValue(modifiedPrevStepData)
                          },
                          getString,
                          isGenericArtifactory,
                          getString('pipeline.artifactOrImagePathDependencyRequired')
                        )
                      }
                      multiTypeInputProps={{
                        onChange: () => {
                          onChangeImageArtifactPath()
                        },
                        expressions,
                        allowableTypes,
                        selectProps: {
                          items: artifactPaths,
                          addClearBtn: true,
                          itemRenderer: imagePathItemRenderer,
                          allowCreatingNewItems: true,
                          addTooltip: true
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                          if (
                            e?.target?.type !== 'text' ||
                            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                          ) {
                            return
                          }
                          if (!isArtifactDisabled(formik)) {
                            refetchImagePathData({
                              queryParams: {
                                repository: (formik.values?.repository as string) || '',
                                connectorRef: getConnectorRefQueryData(modifiedPrevStepData),
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier
                              }
                            })
                          }
                        }
                      }}
                      label={getString('pipeline.artifactImagePathLabel')}
                      name="artifactPath"
                      placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                      className={css.tagInputButton}
                    />
                    {getMultiTypeFromValue(formik.values?.artifactPath) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.artifactPath as string}
                          type="String"
                          variableName="artifactPath"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('artifactPath', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}
                {!isGenericArtifactory && (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('repositoryUrlLabel')}
                      name="repositoryUrl"
                      placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                      isOptional={!CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY}
                    />
                    {getMultiTypeFromValue(formik.values.repositoryUrl) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.repositoryUrl as string}
                          type={getString('string')}
                          variableName="repositoryUrl"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('repositoryUrl', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className={cx(css.tagGroup, css.marginBottom)}>
                  <FormInput.RadioGroup
                    label={isGenericArtifactory ? getString('pipeline.artifactsSelection.artifactDetails') : undefined}
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
                      disabled={
                        isGenericArtifactory ? isArtifactPathDisabled(formik?.values) : isTagDisabled(formik?.values)
                      }
                      helperText={getTagFieldHelperText(formik)}
                      multiTypeInputProps={{
                        expressions,
                        allowableTypes,
                        selectProps: {
                          defaultSelectedItem: formik.values?.tag,
                          noResults: (
                            <NoTagResults
                              tagError={artifactoryTagError}
                              isServerlessDeploymentTypeSelected={isGenericArtifactory}
                            />
                          ),
                          items: tags,
                          addClearBtn: true,
                          itemRenderer: itemRenderer,
                          allowCreatingNewItems: true,
                          addTooltip: true
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => onTagInputFocus(e, formik)
                      }}
                      label={isGenericArtifactory ? getString('pipeline.artifactPathLabel') : getString('tagLabel')}
                      name="tag"
                      className={css.tagInputButton}
                    />

                    {getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.tag}
                          type="String"
                          variableName="tag"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('tag', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {formik.values?.tagType === 'regex' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={
                        isGenericArtifactory ? getString('pipeline.artifactPathFilterLabel') : getString('tagRegex')
                      }
                      name="tagRegex"
                      placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.tagRegex) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.tagRegex}
                          type="String"
                          variableName="tagRegex"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('tagRegex', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
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
export default Artifactory
