/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, merge } from 'lodash-es'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { Menu } from '@blueprintjs/core'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import produce from 'immer'
import {
  Text,
  Layout,
  Button,
  FormInput,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  ButtonVariation,
  AllowedTypes,
  FormikForm
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import {
  ConnectorConfigDTO,
  ManifestConfig,
  ManifestConfigWrapper,
  StoreConfig,
  useGetV2BucketListForS3
} from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import {
  checkIfQueryParamsisNotEmpty,
  shouldFetchFieldOptions
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { ECSWithS3DataType, ECSWithS3ManifestLastStepPrevStepData, ManifestTypes } from '../../ManifestInterface'
import { getConnectorRefOrConnectorId, ManifestIdentifierValidation } from '../../Manifesthelper'
import { filePathWidth } from '../ManifestUtils'
import DragnDropPaths from '../../DragnDropPaths'
import { shouldAllowOnlyOneFilePath } from '../CommonManifestDetails/utils'
import css from './ECSWithS3.module.scss'

const getConnectorRefFromPrevStep = (prevStepData?: ConnectorConfigDTO): string => {
  return (
    prevStepData?.connectorRef?.value || prevStepData?.connectorRef?.connector?.identifier || prevStepData?.identifier
  )
}

interface ECSWithS3PropsType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  deploymentType?: string
  selectedManifest: ManifestTypes | null
  showIdentifierField?: boolean
  editManifestModePrevStepData?: ECSWithS3ManifestLastStepPrevStepData
}

export function ECSWithS3({
  stepName,
  prevStepData,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  previousStep,
  manifestIdsList,
  isReadonly = false,
  selectedManifest,
  showIdentifierField = true,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & ECSWithS3PropsType): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [lastQueryData, setLastQueryData] = React.useState({ region: '' })

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  /* Code related to region */
  React.useEffect(() => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    if (!isEmpty(specValues?.region)) {
      setLastQueryData({ region: specValues.region })
    }
  }, [initialValues])

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const regions = useMemo(() => {
    return defaultTo(regionData?.resource, []).map(region => ({
      value: region.value,
      label: region.name as string
    }))
  }, [regionData?.resource])

  /* Code related to bucketName */
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
      connectorRef: getConnectorRefFromPrevStep(modifiedPrevStepData),
      region: lastQueryData.region
    },
    lazy: true
  })

  const buckets: SelectOption[] = useMemo(() => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    } else if (error) {
      return []
    } else if (Array.isArray(bucketData?.data)) {
      return defaultTo(
        bucketData?.data?.map(currBucket => ({
          label: currBucket.bucketName as string,
          value: currBucket.bucketName as string
        })),
        []
      )
    }
    return []
  }, [bucketData?.data, error, loading])

  React.useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchBuckets({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          connectorRef: getConnectorRefFromPrevStep(modifiedPrevStepData),
          region: lastQueryData.region
        }
      })
    }
  }, [lastQueryData, refetchBuckets, modifiedPrevStepData])

  const canFetchBuckets = useCallback(
    (region: string): boolean => {
      // modifiedPrevStepData?.connectorRef is passed to shouldFetchFieldOptions when connector selection is done in prev step
      // modifiedPrevStepData is passed to shouldFetchFieldOptions required when inline connector creation has been done in prev step
      return !!(
        lastQueryData.region !== region &&
        shouldFetchFieldOptions(
          !isEmpty(modifiedPrevStepData?.identifier)
            ? modifiedPrevStepData
            : { connectorId: { ...modifiedPrevStepData?.connectorRef } },
          [region]
        )
      )
    },
    [lastQueryData, modifiedPrevStepData]
  )

  const fetchBuckets = useCallback(
    (region = ''): void => {
      if (canFetchBuckets(region)) {
        setLastQueryData({ region })
      }
    },
    [canFetchBuckets]
  )

  const fetchBucketsByRegion = React.useCallback(
    (formik: FormikProps<ECSWithS3DataType>) => {
      if (!loading && formik.values?.region) {
        fetchBuckets(formik.values.region)
      }
    },
    [loading, fetchBuckets]
  )

  const itemRenderer = useCallback(
    (item: { label: string }, { handleClick }) => (
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
    ),
    [loading]
  )

  /** Calculating initialValues for formik form */
  const setBucketNameInitialValue = (values: ECSWithS3DataType, specValues: StoreConfig): void => {
    if (
      getMultiTypeFromValue(specValues?.bucketName) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(specValues?.region) === MultiTypeInputType.FIXED
    ) {
      merge(values, { bucketName: { label: specValues?.bucketName, value: specValues?.bucketName } })
    } else {
      merge(values, specValues?.bucketName)
    }
  }

  const getInitialValues = (): ECSWithS3DataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : specValues.paths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) }))
      }
      setBucketNameInitialValue(values, specValues)
      return values
    }
    return {
      identifier: '',
      bucketName: '',
      region: '',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }]
    }
  }

  /** Calculating final manifest object after Submit button is clicked */
  const submitFormData = (
    formData: ECSWithS3DataType & { region: SelectOption | string; store?: string; connectorRef?: string }
  ): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: selectedManifest as ManifestTypes,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              region: defaultTo((formData?.region as SelectOption)?.value, formData?.region),
              bucketName: defaultTo((formData?.bucketName as SelectOption)?.value, formData?.bucketName),
              paths:
                typeof formData?.paths === 'string'
                  ? formData?.paths
                  : formData?.paths?.map((path: { path: string }) => path.path)
            }
          }
        }
      }
    }

    handleSubmit(manifestObj)
  }

  const renderS3Bucket = (formik: FormikProps<ECSWithS3DataType>): JSX.Element => {
    if (
      getMultiTypeFromValue(formik.values?.region) !== MultiTypeInputType.FIXED ||
      getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
    ) {
      return (
        <div
          className={cx(css.halfWidth, {
            [css.runtimeInput]: getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
          })}
        >
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.bucketName')}
            placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
            name="bucketName"
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ alignSelf: 'center', marginBottom: 3 }}
              value={formik.values?.bucketName as string}
              type="String"
              variableName="bucketName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('bucketName', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
      )
    }
    return (
      <div
        className={cx(css.halfWidth, {
          [css.runtimeInput]: getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
        })}
      >
        <FormInput.MultiTypeInput
          selectItems={buckets}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
          name="bucketName"
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              noResults: (
                <Text lineClamp={1} width={400} height={100} padding="small">
                  {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBuckets')}
                </Text>
              ),
              itemRenderer: itemRenderer,
              items: buckets,
              allowCreatingNewItems: true
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              fetchBucketsByRegion(formik)
            }
          }}
        />
        {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            options={buckets}
            fetchOptions={fetchBucketsByRegion.bind(null, formik)}
            style={{ alignSelf: 'center', marginBottom: 3 }}
            value={formik.values?.bucketName as string}
            type="String"
            variableName="bucketName"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('bucketName', value)}
            isReadonly={isReadonly}
          />
        )}
      </div>
    )
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStoreDetails}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="ecsWithS3"
        validationSchema={Yup.object().shape({
          ...(showIdentifierField
            ? ManifestIdentifierValidation(
                getString,
                manifestIdsList,
                initialValues?.identifier,
                getString('pipeline.uniqueName')
              )
            : {}),
          region: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.region')),
          bucketName: Yup.string().trim().required(getString('pipeline.manifestType.bucketNameRequired')),
          paths: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as unknown as any) === MultiTypeInputType.FIXED) {
              return Yup.array().of(
                Yup.object().shape({
                  path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                })
              )
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          })
        })}
        onSubmit={(formData: ECSWithS3DataType) => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorRef: getConnectorRefOrConnectorId(modifiedPrevStepData)
          })
        }}
      >
        {(formik: FormikProps<ECSWithS3DataType>) => (
          <FormikForm>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <div className={css.manifestStepWidth}>
                {showIdentifierField && (
                  <div className={css.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                      isIdentifier={true}
                    />
                  </div>
                )}
                <div
                  className={cx(css.halfWidth, {
                    [css.runtimeInput]: getMultiTypeFromValue(formik.values?.region) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTypeInput
                    name="region"
                    selectItems={regions}
                    useValue
                    placeholder={getString('pipeline.regionPlaceholder')}
                    multiTypeInputProps={{
                      expressions,
                      allowableTypes,
                      onChange: selectedValue => {
                        const selectedValueString =
                          typeof selectedValue === 'string'
                            ? selectedValue
                            : ((selectedValue as SelectOption)?.value as string)
                        const updatedValues = produce(formik.values, draft => {
                          draft.region = selectedValueString
                          if (getMultiTypeFromValue(formik.values.bucketName) === MultiTypeInputType.FIXED) {
                            draft.bucketName = ''
                          }
                        })
                        formik.setValues(updatedValues)
                      }
                    }}
                    label={getString('regionLabel')}
                  />
                  {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                    <SelectConfigureOptions
                      options={regions}
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values?.region as string}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('region', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                {renderS3Bucket(formik)}

                <div
                  className={cx({
                    [css.runtimeInput]: getMultiTypeFromValue(formik.values?.paths) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <DragnDropPaths
                    formik={formik}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    fieldPath="paths"
                    pathLabel={getString('fileFolderPathText')}
                    placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                    defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                    dragDropFieldWidth={filePathWidth}
                    allowOnlyOneFilePath={selectedManifest ? shouldAllowOnlyOneFilePath(selectedManifest) : false}
                  />
                  {getMultiTypeFromValue(formik.values.paths) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values.paths}
                      type={getString('string')}
                      variableName={'paths'}
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={val => formik.setFieldValue('paths', val)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </div>
            </Layout.Vertical>

            <Layout.Horizontal spacing="medium" className={css.saveBtn}>
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
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
