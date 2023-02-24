/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get, memoize, merge, omit } from 'lodash-es'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import {
  BucketResponse,
  ConnectorConfigDTO,
  FilePaths,
  useGetFilePathsForS3,
  useGetV2BucketListForS3
} from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import {
  AmazonS3ArtifactProps,
  AmazonS3InitialValuesType,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import {
  ArtifactIdentifierValidation,
  ModalViewFor,
  tagOptions
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  checkIfQueryParamsisNotEmpty,
  defaultArtifactInitialValues,
  getConnectorIdValue,
  resetFieldValue,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export function AmazonS3(props: StepProps<ConnectorConfigDTO> & AmazonS3ArtifactProps): React.ReactElement {
  const {
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
    formClassName = ''
  } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState({ region: undefined, bucketName: '' })
  const [bucketList, setBucketList] = React.useState<BucketResponse[] | undefined>([])
  const [filePathList, setFilePathList] = React.useState<FilePaths[] | undefined>([])

  // Region related code
  const {
    data: regionData,
    loading: loadingRegions,
    error: errorRegions
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  const getConnectorRefQueryData = (): string => {
    return prevStepData?.connectorId?.value || prevStepData?.connectorId?.connector?.value || prevStepData?.identifier
  }

  // Bucket related code
  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetV2BucketListForS3({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: getConnectorRefQueryData(),
      region: lastQueryData.region
    },
    lazy: true
  })

  React.useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(omit(lastQueryData, ['region', 'bucketName'])))) {
      refetchBuckets()
    }
  }, [lastQueryData, refetchBuckets])

  React.useEffect(() => {
    if (error) {
      setBucketList([])
    } else if (Array.isArray(bucketData?.data)) {
      setBucketList(bucketData?.data)
    }
  }, [bucketData?.data, error])

  const canFetchBuckets = useCallback(
    (region: string): boolean => {
      return !!(lastQueryData.region !== region && shouldFetchFieldOptions(prevStepData, []))
    },
    [lastQueryData, prevStepData]
  )

  const fetchBuckets = useCallback(
    (region = ''): void => {
      if (canFetchBuckets(region)) {
        setLastQueryData({ region, bucketName: lastQueryData.bucketName })
      }
    },
    [canFetchBuckets, lastQueryData]
  )

  const isBucketNameDisabled = (): boolean => {
    return !checkIfQueryParamsisNotEmpty([getConnectorRefQueryData()])
  }

  const selectItems = React.useMemo(() => {
    return bucketList?.map(currBucket => ({
      label: currBucket.bucketName as string,
      value: currBucket.bucketName as string
    }))
  }, [bucketList])

  const buckets = React.useMemo((): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return defaultTo(selectItems, [])
  }, [loading, selectItems])

  // File Path related code
  const {
    data: filePathData,
    error: filePathError,
    loading: fetchingFilePaths,
    refetch: refetchFilePaths
  } = useGetFilePathsForS3({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: getConnectorRefQueryData(),
      region: lastQueryData.region,
      bucketName: lastQueryData.bucketName,
      filePathRegex: '*'
    },
    lazy: true
  })

  React.useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(omit(lastQueryData, ['region'])))) {
      refetchFilePaths()
    }
  }, [lastQueryData, refetchFilePaths])

  React.useEffect(() => {
    if (filePathError) {
      setFilePathList([])
    } else if (Array.isArray(filePathData?.data)) {
      setFilePathList(filePathData?.data)
    }
  }, [filePathData?.data, filePathError])

  const canFetchFilePaths = useCallback(
    (region: string, bucketName: string): boolean => {
      return (
        !!(lastQueryData.region !== region && shouldFetchFieldOptions(prevStepData, [])) ||
        !!(lastQueryData.bucketName !== bucketName && shouldFetchFieldOptions(prevStepData, [bucketName]))
      )
    },
    [lastQueryData, prevStepData]
  )

  const fetchFilePaths = useCallback(
    (region = '', bucketName = ''): void => {
      if (canFetchFilePaths(region, bucketName)) {
        setLastQueryData({ region, bucketName })
      }
    },
    [canFetchFilePaths]
  )

  const isFilePathDisabled = (): boolean => {
    return !checkIfQueryParamsisNotEmpty([getConnectorRefQueryData()])
  }

  const filePathSelectItems = React.useMemo(() => {
    return filePathList?.map(currFilePath => ({
      label: currFilePath.buildDetails?.number as string,
      value: currFilePath.buildDetails?.number as string
    }))
  }, [filePathList])

  const filePaths = React.useMemo((): { label: string; value: string }[] => {
    if (fetchingFilePaths) {
      const loadingFilePathOptionsText = getString('common.loadingFieldOptions', {
        fieldName: getString('common.git.filePath')
      })
      return [{ label: loadingFilePathOptionsText, value: loadingFilePathOptionsText }]
    }
    return defaultTo(filePathSelectItems, [])
  }, [fetchingFilePaths, filePathSelectItems])

  const schemaObject = {
    region: Yup.string(),
    bucketName: Yup.mixed().required(getString('pipeline.manifestType.bucketNameRequired')),
    tagType: Yup.string().required(),
    filePath: Yup.string().when('tagType', {
      is: 'value',
      then: Yup.string().required(getString('pipeline.manifestType.pathRequired'))
    }),
    filePathRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().required(getString('pipeline.artifactsSelection.validation.filePathRegex'))
    })
  }
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const primarySchema = Yup.object().shape(schemaObject)

  const getValidationSchema = useCallback(() => {
    if (isIdentifierAllowed) {
      return sidecarSchema
    }
    return primarySchema
  }, [context, primarySchema, sidecarSchema])

  const getInitialValues = React.useCallback((): AmazonS3InitialValuesType => {
    // Initia specValues
    const specValues = get(initialValues, 'spec', null)

    // if specValues is nil or selected type is not matching with initialValues.type then assume NEW
    if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
      return defaultArtifactInitialValues(defaultTo(selectedArtifact, 'AmazonS3'))
    }

    // Depending upon if filePath is present or not in specValues, decide typeType
    const artifactValues = {
      ...specValues,
      tagType: specValues.filePath ? TagTypes.Value : TagTypes.Regex
    }

    if (isIdentifierAllowed && initialValues?.identifier) {
      merge(artifactValues, { identifier: initialValues?.identifier })
    }
    return artifactValues
  }, [initialValues, selectedArtifact, isIdentifierAllowed])

  const submitFormData = (formData: AmazonS3InitialValuesType & { connectorId?: string }): void => {
    // Initial data
    let artifactObj = {
      spec: {
        connectorRef: formData.connectorId,
        bucketName: formData.bucketName,
        region: formData.region
      }
    }

    // Merge filePath or filePathRegex field value with initial data depending upon tagType selection
    const initialFilePathData =
      formData?.tagType === TagTypes.Value ? { filePath: formData.filePath } : { filePathRegex: formData.filePathRegex }

    artifactObj = {
      spec: {
        ...artifactObj.spec,
        ...initialFilePathData
      }
    }

    if (isIdentifierAllowed) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    // Submit the final object
    handleSubmit(artifactObj)
  }

  const handleValidate = (formData: AmazonS3InitialValuesType & { connectorId?: string }) => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...prevStepData,
        ...formData,
        connectorId: getConnectorIdValue(prevStepData)
      })
    }
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loading || fetchingFilePaths}
        onClick={handleClick}
      />
    </div>
  ))

  const renderS3BucketField = (formik: FormikProps<AmazonS3InitialValuesType>): JSX.Element => {
    if (
      getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED ||
      getMultiTypeFromValue(formik.values.region) !== MultiTypeInputType.FIXED
    ) {
      return (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.bucketName')}
            placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
            name="bucketName"
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center', marginBottom: 3 }}
                value={formik.values?.bucketName as string}
                type="String"
                variableName="bucketName"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('bucketName', value)}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      )
    }
    return (
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          selectItems={buckets}
          disabled={isBucketNameDisabled()}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
          name="bucketName"
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            onChange: selected => {
              if (formik.values.bucketName !== (selected as unknown as any).value) {
                resetFieldValue(formik, 'filePath')
              }
            },
            selectProps: {
              noResults: (
                <Text lineClamp={1} width={384} margin="small">
                  {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBucketsFound')}
                </Text>
              ),
              itemRenderer: itemRenderer,
              items: buckets,
              allowCreatingNewItems: true,
              addClearBtn: true
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!loading) {
                fetchBuckets(formik.values.region)
              }
            }
          }}
        />
        {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
          <div className={css.configureOptions}>
            <ConfigureOptions
              style={{ alignSelf: 'center', marginBottom: 3 }}
              value={formik.values?.bucketName as string}
              type="String"
              variableName="bucketName"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('bucketName', value)}
              isReadonly={isReadonly}
            />
          </div>
        )}
      </div>
    )
  }

  const renderS3FilePathField = (formik: FormikProps<AmazonS3InitialValuesType>): JSX.Element => {
    if (
      getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED ||
      getMultiTypeFromValue(formik.values.region) !== MultiTypeInputType.FIXED ||
      getMultiTypeFromValue(formik.values.bucketName) !== MultiTypeInputType.FIXED
    ) {
      return (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            key={'filePath'}
            label={getString('common.git.filePath')}
            name="filePath"
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.filePath) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center' }}
                value={formik.values?.filePath as string}
                type={getString('string')}
                variableName="filePath"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('filePath', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      )
    }
    return (
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          selectItems={filePaths}
          disabled={isFilePathDisabled()}
          label={getString('common.git.filePath')}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          name="filePath"
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              noResults: (
                <Text lineClamp={1} width={384} margin="small">
                  {getRBACErrorMessage(filePathError as RBACError) || getString('pipeline.noFilePathsFound')}
                </Text>
              ),
              itemRenderer: itemRenderer,
              items: filePaths,
              allowCreatingNewItems: true,
              addClearBtn: true
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!fetchingFilePaths) {
                fetchFilePaths(formik.values.region, formik.values.bucketName)
              }
            }
          }}
        />
        {getMultiTypeFromValue(formik.values?.filePath) === MultiTypeInputType.RUNTIME && (
          <div className={css.configureOptions}>
            <SelectConfigureOptions
              options={filePaths}
              style={{ alignSelf: 'center' }}
              value={formik.values?.filePath as string}
              type={getString('string')}
              variableName="filePath"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => {
                formik.setFieldValue('filePath', value)
              }}
              isReadonly={isReadonly}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik<AmazonS3InitialValuesType>
        initialValues={getInitialValues()}
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    onChange: selected => {
                      if (formik.values.region !== (selected as unknown as any).value) {
                        resetFieldValue(formik, 'bucketName')
                        resetFieldValue(formik, 'filePath')
                      }
                    },
                    selectProps: {
                      items: regions,
                      noResults: (
                        <Text lineClamp={1} width={384} margin="small">
                          {getRBACErrorMessage(errorRegions as RBACError) || getString('pipeline.noRegions')}
                        </Text>
                      )
                    }
                  }}
                  label={getString('optionalField', { name: getString('regionLabel') })}
                  placeholder={loadingRegions ? getString('loading') : getString('select')}
                />

                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <SelectConfigureOptions
                      options={regions}
                      loading={loadingRegions}
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.region as string}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('region', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              {renderS3BucketField(formik)}

              <div className={css.tagGroup}>
                <FormInput.RadioGroup
                  name="tagType"
                  radioGroup={{ inline: true }}
                  items={tagOptions}
                  className={css.radioGroup}
                  onChange={event => {
                    if (event.currentTarget.value === TagTypes.Regex) {
                      if (getMultiTypeFromValue(formik.values.filePath) !== MultiTypeInputType.FIXED) {
                        formik.setFieldValue('filePathRegex', formik.values.filePath)
                      } else {
                        formik.setFieldValue('filePathRegex', defaultTo(formik.values.filePathRegex, ''))
                      }
                    } else {
                      if (getMultiTypeFromValue(formik.values.filePathRegex) !== MultiTypeInputType.FIXED) {
                        formik.setFieldValue('filePath', formik.values.filePathRegex)
                      } else {
                        formik.setFieldValue('filePath', defaultTo(formik.values.filePath, ''))
                      }
                    }
                  }}
                />
              </div>

              {formik.values?.tagType === TagTypes.Value ? (
                renderS3FilePathField(formik)
              ) : (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    key={'filePathRegex'}
                    label={getString('pipeline.artifactsSelection.filePathRegexLabel')}
                    name="filePathRegex"
                    placeholder={getString('pipeline.artifactsSelection.filePathRegexPlaceholder')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                  />
                  {getMultiTypeFromValue(formik.values.filePathRegex) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.filePathRegex as string}
                        type={getString('string')}
                        variableName="filePathRegex"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('filePathRegex', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {!hideHeaderAndNavBtns && (
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
            )}
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
