/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import type { FormikValues } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get, memoize, merge } from 'lodash-es'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'

import {
  Button,
  ButtonVariation,
  FontVariation,
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
import { useStrings } from 'framework/strings'
import { BucketResponse, ConnectorConfigDTO, useGetV2BucketListForS3 } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
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
  defaultArtifactInitialValues,
  getConnectorIdValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useListAwsRegions } from 'services/portal'
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
    isMultiArtifactSource
  } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource

  const [regions, setRegions] = React.useState<SelectOption[]>([])

  const {
    data: regionData,
    loading: loadingRegions,
    error: errorRegions
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetV2BucketListForS3({
    lazy: true,
    debounce: 300
  })

  const fetchBuckets = (region: string): void => {
    refetchBuckets({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        connectorRef: prevStepData?.connectorId?.value || prevStepData?.identifier,
        region: region
      }
    })
  }

  const selectItems = useMemo(() => {
    return bucketData?.data?.map((bucket: BucketResponse) => ({
      value: defaultTo(bucket.bucketName, ''),
      label: defaultTo(bucket.bucketName, '')
    }))
  }, [bucketData?.data])

  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  const getBuckets = (): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return defaultTo(selectItems, [])
  }

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
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const primarySchema = Yup.object().shape(schemaObject)

  const getValidationSchema = useCallback(() => {
    if (context === ModalViewFor.SIDECAR) {
      return sidecarSchema
    }
    return primarySchema
  }, [context, primarySchema, sidecarSchema])

  const getInitialValues = (): AmazonS3InitialValuesType => {
    // Initia specValues
    const specValues = get(initialValues, 'spec', null)
    // if specValues is nil or selected type is not matching with initialValues.type then assume NEW
    if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
      return defaultArtifactInitialValues(defaultTo(selectedArtifact, 'AmazonS3'))
    }
    // Depending upon if filePath is present or not in specValues, decide typeType
    merge(specValues, { tagType: specValues.filePath ? TagTypes.Value : TagTypes.Regex })
    // If sidecar then merge identifier value to specValues
    if (isIdentifierAllowed && initialValues?.identifier) {
      merge(specValues, { identifier: initialValues?.identifier })
    }
    return specValues
  }

  const submitFormData = (formData: AmazonS3InitialValuesType & { connectorId?: string }): void => {
    // Initial data
    const artifactObj = {
      spec: {
        connectorRef: formData.connectorId,
        bucketName: formData.bucketName,
        region: formData.region
      }
    }

    // Merge filePath or filePathRegex field value with initial data depending upon tagType selection
    const filePathData =
      formData?.tagType === TagTypes.Value ? { filePath: formData.filePath } : { filePathRegex: formData.filePathRegex }
    merge(artifactObj.spec, filePathData)
    // If sidecar artifact then merge identifier value with initial value
    if (isIdentifierAllowed) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    // Submit the final object
    handleSubmit(artifactObj)
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loading}
        onClick={handleClick}
      />
    </div>
  ))

  const renderS3BucketField = (formik: FormikValues): JSX.Element => {
    if (getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED) {
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
          selectItems={getBuckets()}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
          name="bucketName"
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              noResults: (
                <Text lineClamp={1} width={500} height={100}>
                  {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBuckets')}
                </Text>
              ),
              itemRenderer: itemRenderer,
              items: getBuckets(),
              allowCreatingNewItems: true
            },
            onFocus: () => {
              fetchBuckets(formik?.values?.region)
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

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
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
            <div className={css.connectorForm}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    onChange: () => {
                      formik.values?.bucketName &&
                        getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.FIXED &&
                        formik.setFieldValue('bucketName', '')
                    },
                    selectProps: {
                      items: regions,
                      noResults: (
                        <Text lineClamp={1} width={500} height={100}>
                          {getRBACErrorMessage(errorRegions as RBACError) || getString('pipeline.noRegions')}
                        </Text>
                      )
                    }
                  }}
                  label={getString('regionLabel')}
                  placeholder={loadingRegions ? getString('loading') : getString('select')}
                />

                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
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
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
