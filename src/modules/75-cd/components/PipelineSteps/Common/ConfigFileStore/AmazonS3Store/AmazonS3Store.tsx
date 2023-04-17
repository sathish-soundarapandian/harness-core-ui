/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, memoize } from 'lodash-es'

import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Heading,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { BucketResponse, ConnectorConfigDTO, useGetV2BucketListForS3 } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import DragnDropPaths from '@pipeline/components/ManifestSelection/DragnDropPaths'
import {
  AmazonS3StoreDataType,
  amazonS3ValidationSchema,
  formatInitialValues,
  formatOnSubmitData,
  getConnectorRef,
  getFieldPathName,
  shouldFetchFieldOptions
} from './AmazonS3StoreHelper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AmazonS3Store.module.scss'

interface AmazonS3FormProps {
  onSubmitCallBack: (data: AmazonS3StoreDataType, prevStepData?: any) => void
  allowableTypes: AllowedTypes
  isReadonly: boolean
  isConfig?: boolean
  isBackendConfig?: boolean
  isTerraformPlan?: boolean
  specFieldPath?: string
  fieldPath?: string
}

export function AmazonS3Store(props: StepProps<ConnectorConfigDTO> & AmazonS3FormProps): React.ReactElement {
  const {
    previousStep,
    prevStepData,
    onSubmitCallBack,
    isConfig,
    allowableTypes,
    isBackendConfig = false,
    specFieldPath,
    fieldPath,
    isTerraformPlan,
    isReadonly
  } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()

  const specFieldPathName = getFieldPathName(specFieldPath, isConfig, isBackendConfig)

  const connectorRefValue = getConnectorRef(prevStepData, specFieldPath, isConfig, isBackendConfig)

  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState({ region: undefined, bucketName: '' })
  const [bucketList, setBucketList] = React.useState<BucketResponse[] | undefined>([])

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
      connectorRef: connectorRefValue,
      region: lastQueryData.region
    },
    lazy: true
  })

  React.useEffect(() => {
    if (getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED && !isEmpty(lastQueryData.region)) {
      refetchBuckets()
    }
  }, [connectorRefValue, lastQueryData, refetchBuckets])

  React.useEffect(() => {
    if (error) {
      setBucketList([])
    } else if (Array.isArray(bucketData?.data)) {
      setBucketList(bucketData?.data)
    }
  }, [bucketData?.data, error])

  const canFetchBuckets = useCallback(
    (region: string): boolean => {
      return !!(lastQueryData.region !== region && shouldFetchFieldOptions(connectorRefValue, []))
    },
    [connectorRefValue, lastQueryData.region]
  )

  const fetchBuckets = useCallback(
    (region = ''): void => {
      if (canFetchBuckets(region)) {
        setLastQueryData({ region, bucketName: lastQueryData.bucketName })
      }
    },
    [canFetchBuckets, lastQueryData]
  )

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

  const getInitialValues = formatInitialValues(
    prevStepData,
    specFieldPath,
    fieldPath,
    isConfig,
    isBackendConfig,
    isTerraformPlan
  )

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

  const renderS3BucketField = (formik: FormikProps<AmazonS3StoreDataType>): JSX.Element => {
    if (
      getMultiTypeFromValue(connectorRefValue) !== MultiTypeInputType.FIXED ||
      getMultiTypeFromValue(get(formik.values, `${specFieldPathName}.region`)) !== MultiTypeInputType.FIXED
    ) {
      return (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.bucketName')}
            placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
            name={`${specFieldPathName}.bucketName`}
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(get(formik.values, `${specFieldPathName}.bucketName`)) ===
            MultiTypeInputType.RUNTIME && (
            <div>
              <ConfigureOptions
                style={{ alignSelf: 'center', marginBottom: 3 }}
                value={get(formik.values, `${specFieldPathName}.bucketName`) as string}
                type="String"
                variableName={`${specFieldPathName}.bucketName`}
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue(`${specFieldPathName}.bucketName`, value)}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      )
    }
    return (
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.MultiTypeInput
          selectItems={buckets}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
          name={`${specFieldPathName}.bucketName`}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            onChange: selected => {
              if (get(formik.values, `${specFieldPathName}.bucketName`) !== (selected as unknown as any)?.value) {
                resetFieldValue(formik, `${specFieldPathName}.filePath`)
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
              allowCreatingNewItems: true
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!loading) {
                fetchBuckets(get(formik.values, `${specFieldPathName}.region`))
              }
            }
          }}
        />
        {getMultiTypeFromValue(get(formik.values, `${specFieldPathName}.bucketName`)) ===
          MultiTypeInputType.RUNTIME && (
          <div>
            <SelectConfigureOptions
              value={get(formik.values, `${specFieldPathName}.bucketName`) as string}
              type="String"
              variableName={`${specFieldPathName}.bucketName`}
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue(`${specFieldPathName}.bucketName`, value)
              }}
              isReadonly={isReadonly}
              options={buckets}
              loading={loading}
              style={{ alignSelf: 'center' }}
              className={css.configureOptions}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.tfVarStore}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }}>
        {isConfig
          ? getString('cd.configFileDetails')
          : isBackendConfig
          ? getString('cd.backendConfigFileDetails')
          : getString('cd.varFileDetails')}
      </Heading>
      <Formik
        initialValues={getInitialValues}
        formName="s3form"
        validationSchema={amazonS3ValidationSchema(getString, fieldPath, isConfig, isBackendConfig, isTerraformPlan)}
        onSubmit={(values: AmazonS3StoreDataType) => {
          if (isConfig || isBackendConfig) {
            onSubmitCallBack(values, prevStepData)
          } else {
            const varFiles = {
              varFile: {
                type: values.varFile?.type,
                identifier: values.varFile?.identifier,
                spec: {
                  ...values.varFile?.spec,
                  store: {
                    ...values.varFile?.spec?.store,
                    spec: {
                      ...values.varFile?.spec?.store?.spec,
                      paths:
                        typeof values.varFile?.spec?.store?.spec?.paths === 'string'
                          ? values.varFile?.spec?.store?.spec?.paths
                          : values.varFile?.spec?.store?.spec?.paths?.map((path: { path: string }) => path.path)
                    }
                  }
                }
              }
            }
            const data = formatOnSubmitData(varFiles, prevStepData, connectorRefValue)
            onSubmitCallBack(data)
          }
        }}
      >
        {formik => (
          <FormikForm>
            <div className={css.tfAmazonS3StepTwo}>
              {!isConfig && !isBackendConfig && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTypeInput
                  name={`${specFieldPathName}.region`}
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    onChange: selected => {
                      if (get(formik.values, `${specFieldPathName}.region`) !== (selected as unknown as any)?.value) {
                        resetFieldValue(formik, `${specFieldPathName}.bucketName`)
                        resetFieldValue(formik, `${specFieldPathName}.specFieldPath`)
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
                  label={getString('regionLabel')}
                  placeholder={loadingRegions ? getString('loading') : getString('select')}
                />

                {getMultiTypeFromValue(get(formik.values, `${specFieldPathName}.region`)) ===
                  MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={regions}
                    loading={loadingRegions}
                    style={{ alignSelf: 'center' }}
                    value={get(formik.values, `${specFieldPathName}.region`) as string}
                    type="String"
                    variableName={`${specFieldPathName}.region`}
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue(`${specFieldPathName}.region`, value)
                    }}
                    className={css.configureOptions}
                    isReadonly={isReadonly}
                  />
                )}
              </div>

              {renderS3BucketField(formik)}

              {isConfig ? (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('common.git.folderPath')}
                    placeholder={getString('pipeline.manifestType.folderPathPlaceholder')}
                    name={`${specFieldPathName}.folderPath`}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                  />
                  {getMultiTypeFromValue(get(formik.values, `${specFieldPathName}.folderPath`)) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={get(formik.values, `${specFieldPathName}.folderPath`) as string}
                      type={getString('string')}
                      variableName={`${specFieldPathName}.folderPath`}
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue(`${specFieldPathName}.folderPath`, value)
                      }}
                      isReadonly={isReadonly}
                      className={css.configureOptions}
                      style={{ alignSelf: 'center' }}
                    />
                  )}
                </div>
              ) : (
                <DragnDropPaths
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  pathLabel={getString('common.git.filePath')}
                  defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                  fieldPath={`${specFieldPathName}.paths`}
                  placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                  dragDropFieldWidth={600}
                  allowOnlyOneFilePath={!!isBackendConfig}
                />
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
