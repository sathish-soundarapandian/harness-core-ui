/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikValues } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { defaultTo, get, isEmpty, merge } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import {
  Text,
  Accordion,
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
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  ConnectorConfigDTO,
  ManifestConfig,
  ManifestConfigWrapper,
  StoreConfig,
  useGetBucketListForS3
} from 'services/cd-ng'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useListAwsRegions } from 'services/portal'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { HelmWithGcsDataType, HelmWithS3ManifestLastStepPrevStepData } from '../../ManifestInterface'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'

import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  helmVersions,
  ManifestDataType,
  ManifestIdentifierValidation
} from '../../Manifesthelper'
import { handleCommandFlagsSubmitData, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import DragnDropPaths from '../../DragnDropPaths'
import { useGetHelmChartVersionData } from '../CommonManifestDetails/useGetHelmChartVersionData'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface HelmWithHttpPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  deploymentType?: string
  editManifestModePrevStepData?: HelmWithS3ManifestLastStepPrevStepData
}

function HelmWithS3({
  stepName,
  prevStepData,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  previousStep,
  manifestIdsList,
  isReadonly = false,
  deploymentType,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & HelmWithHttpPropType): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [regions, setRegions] = useState<SelectOption[]>([])

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)
  const { chartVersions, loadingChartVersions, chartVersionsError, fetchChartVersions, setLastQueryData } =
    useGetHelmChartVersionData({ modifiedPrevStepData, fields: ['region', 'chartName', 'bucketName', 'folderPath'] })

  React.useEffect(() => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    /* istanbul ignore next */
    setLastQueryData({
      region: defaultTo(specValues?.region, ''),
      chartName: defaultTo(initialValues?.spec?.chartName, ''),
      bucketName: defaultTo(specValues?.bucketName, ''),
      folderPath: defaultTo(specValues?.folderPath, '')
    })
  }, [initialValues])

  /* Code related to region */
  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    const regionValues = defaultTo(regionData?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])
  /* Code related to region */

  /* Code related to bucketName */

  const fetchBucket = (regionValue: string): void => {
    refetchBuckets({
      queryParams: {
        connectorRef: modifiedPrevStepData?.connectorRef?.value,
        region: regionValue,
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier
      }
    })
  }
  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetBucketListForS3({
    lazy: true,
    debounce: 300
  })

  const getSelectItems = useCallback(() => {
    return Object.keys(defaultTo(bucketData?.data, [])).map(bucket => ({
      value: bucket,
      label: bucket
    }))
  }, [bucketData?.data])

  const getBuckets = (): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return getSelectItems()
  }
  const itemRenderer = React.useCallback(
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

  /* Code related to bucketName */

  const isActiveAdvancedStep: boolean = defaultTo(
    initialValues?.spec?.skipResourceVersioning,
    initialValues?.spec?.commandFlags
  )
  const [selectedHelmVersion, setHelmVersion] = useState(defaultTo(initialValues?.spec?.helmVersion, 'V3'))

  const setBucketNameInitialValue = (
    values: HelmWithGcsDataType & { region: SelectOption | string },
    specValues: StoreConfig
  ): void => {
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
  const getInitialValues = (): HelmWithGcsDataType & { region: SelectOption | string } => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        folderPath: specValues.folderPath,
        region: specValues?.region,
        helmVersion: initialValues.spec?.helmVersion,
        chartName: initialValues.spec?.chartName,
        chartVersion: initialValues.spec?.chartVersion,
        subChartPath: initialValues.spec?.subChartPath,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        enableDeclarativeRollback: initialValues?.spec?.enableDeclarativeRollback,
        valuesPaths:
          typeof initialValues?.spec?.valuesPaths === 'string'
            ? initialValues?.spec?.valuesPaths
            : removeEmptyFieldsFromStringArray(initialValues?.spec?.valuesPaths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),
        commandFlags: defaultTo(
          initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
            commandType: commandFlag.commandType,
            flag: commandFlag.flag
            // id: uuid(commandFlag, nameSpace())
          })),
          [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
        )
      }
      setBucketNameInitialValue(values, specValues)
      return values
    }
    return {
      identifier: '',
      bucketName: '',
      region: '',
      folderPath: '/',
      helmVersion: 'V3',
      chartName: '',
      chartVersion: '',
      subChartPath: '',
      skipResourceVersioning: false,
      enableDeclarativeRollback: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
    }
  }

  const submitFormData = (
    formData: HelmWithGcsDataType & { region: SelectOption | string; store?: string; connectorRef?: string }
  ): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: ManifestDataType.HelmChart,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              bucketName: defaultTo((formData?.bucketName as SelectOption)?.value, formData?.bucketName),
              folderPath: formData?.folderPath,
              region: defaultTo((formData?.region as SelectOption)?.value, formData?.region)
            }
          },
          valuesPaths:
            typeof formData?.valuesPaths === 'string'
              ? formData?.valuesPaths
              : removeEmptyFieldsFromStringArray(formData?.valuesPaths?.map((path: { path: string }) => path.path)),
          chartName: formData?.chartName,
          chartVersion: formData?.chartVersion,
          subChartPath: formData?.subChartPath,
          helmVersion: formData?.helmVersion,
          skipResourceVersioning: getSkipResourceVersioningBasedOnDeclarativeRollback(
            formData?.skipResourceVersioning,
            formData?.enableDeclarativeRollback
          ),
          enableDeclarativeRollback: formData?.enableDeclarativeRollback
        }
      }
    }

    handleCommandFlagsSubmitData(manifestObj, formData)
    handleSubmit(manifestObj)
  }

  const renderS3Bucket = (formik: FormikValues): JSX.Element => {
    if (
      getMultiTypeFromValue(formik.values?.region) !== MultiTypeInputType.FIXED ||
      getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
    ) {
      return (
        <div
          className={cx(helmcss.halfWidth, {
            [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
          })}
        >
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.bucketName')}
            placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
            name="bucketName"
            multiTextInputProps={{ expressions, allowableTypes }}
            onChange={() => {
              resetFieldValue(formik, 'chartVersion')
            }}
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
        className={cx(helmcss.halfWidth, {
          [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
        })}
      >
        <FormInput.MultiTypeInput
          selectItems={getBuckets()}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
          name="bucketName"
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              noResults: (
                <Text lineClamp={1}>{getRBACErrorMessage(error as RBACError) || getString('pipeline.noBuckets')}</Text>
              ),
              itemRenderer: itemRenderer,
              items: getBuckets(),
              allowCreatingNewItems: true
            },
            onFocus: () => {
              if (!bucketData?.data && (formik.values?.region || formik.values?.region?.value)) {
                fetchBucket(defaultTo(formik.values?.region.value, formik.values?.region))
              }
            },
            onChange: () => resetFieldValue(formik, 'chartVersion')
          }}
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
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="helmWithS3"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            getString,
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueName')
          ),
          folderPath: Yup.string().trim().required(getString('pipeline.manifestType.chartPathRequired')),
          chartName: Yup.string().trim().required(getString('pipeline.manifestType.http.chartNameRequired')),
          helmVersion: Yup.string().trim().required(getString('pipeline.manifestType.helmVersionRequired')),
          region: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.region')),
          bucketName: Yup.mixed().required(getString('pipeline.manifestType.bucketNameRequired')),
          commandFlags: Yup.array().of(
            Yup.object().shape({
              flag: Yup.string().when('commandType', {
                is: val => !isEmpty(val),
                then: Yup.string().required(getString('pipeline.manifestType.commandFlagRequired'))
              })
            })
          )
        })}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorRef: modifiedPrevStepData?.connectorRef
              ? getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? modifiedPrevStepData?.connectorRef
                : modifiedPrevStepData?.connectorRef?.value
              : modifiedPrevStepData?.identifier
              ? modifiedPrevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: FormikValues) => (
          <FormikForm>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.Text
                    name="identifier"
                    label={getString('pipeline.manifestType.manifestIdentifier')}
                    placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                    isIdentifier={true}
                  />
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.region) === MultiTypeInputType.RUNTIME
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
                      onChange: () => {
                        if (getMultiTypeFromValue(formik.values.bucketName) === MultiTypeInputType.FIXED) {
                          formik.setFieldValue('bucketName', '')
                        }
                        resetFieldValue(formik, 'chartVersion')
                      }
                    }}
                    label={getString('regionLabel')}
                  />

                  {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
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
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('chartPath')}
                    placeholder={getString('pipeline.manifestType.chartPathPlaceholder')}
                    name="folderPath"
                    multiTextInputProps={{ expressions, allowableTypes }}
                    onChange={() => {
                      resetFieldValue(formik, 'chartVersion')
                    }}
                  />
                  {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values?.folderPath as string}
                      type="String"
                      variableName="folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('folderPath', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.chartName) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    name="chartName"
                    multiTextInputProps={{ expressions, allowableTypes }}
                    label={getString('pipeline.manifestType.http.chartName')}
                    placeholder={getString('pipeline.manifestType.http.chartNamePlaceHolder')}
                    onChange={() => {
                      resetFieldValue(formik, 'chartVersion')
                    }}
                  />
                  {getMultiTypeFromValue(formik.values?.chartName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values?.chartName as string}
                      type="String"
                      variableName="chartName"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('chartName', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.chartVersion) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTypeInput
                    name="chartVersion"
                    selectItems={chartVersions}
                    disabled={isReadonly}
                    useValue
                    label={getString('pipeline.manifestType.http.chartVersion')}
                    placeholder={
                      loadingChartVersions
                        ? getString('loading')
                        : getString('pipeline.manifestType.http.chartVersionPlaceHolder')
                    }
                    isOptional={true}
                    multiTypeInputProps={{
                      expressions,
                      disabled: isReadonly,
                      allowableTypes,
                      selectProps: {
                        noResults: (
                          <Text lineClamp={1}>
                            {getRBACErrorMessage(chartVersionsError as RBACError) ||
                              getString('pipeline.manifestType.http.noResultsChartVersion')}
                          </Text>
                        ),
                        addClearBtn: !(loadingChartVersions || isReadonly),
                        items: chartVersions,
                        allowCreatingNewItems: true,
                        itemRenderer: itemRenderer
                      },
                      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                        /* istanbul ignore else */ /* istanbul ignore next */ if (
                          e?.target?.type !== 'text' ||
                          (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                        ) {
                          return
                        }
                        !loadingChartVersions &&
                          fetchChartVersions({
                            region: formik.values?.region,
                            bucketName: defaultTo(
                              (formik.values?.bucketName as SelectOption)?.value,
                              formik.values?.bucketName
                            ),
                            folderPath: formik.values?.folderPath,
                            chartName: formik.values?.chartName,
                            helmVersion: formik.values?.helmVersion
                          })
                      }
                    }}
                  />
                  {getMultiTypeFromValue(formik.values?.chartVersion) === MultiTypeInputType.RUNTIME && (
                    <SelectConfigureOptions
                      options={chartVersions}
                      style={{ alignSelf: 'center', marginBottom: 3 }}
                      value={formik.values?.chartVersion as string}
                      type="String"
                      variableName="chartVersion"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={/* istanbul ignore next */ value => formik.setFieldValue('chartVersion', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <div className={helmcss.halfWidth}>
                  <FormInput.Select
                    name="helmVersion"
                    label={getString('helmVersion')}
                    items={helmVersions}
                    onChange={value => {
                      if (value !== selectedHelmVersion) {
                        formik.setFieldValue('commandFlags', [
                          { commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }
                        ] as any)
                        setHelmVersion(value)
                      }
                    }}
                  />
                </div>
              </Layout.Horizontal>
              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.subChartPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('pipeline.manifestType.subChart')}
                    placeholder={getString('pipeline.manifestType.subChartPlaceholder')}
                    name="subChartPath"
                    multiTextInputProps={{ expressions, allowableTypes }}
                    isOptional
                  />
                  {getMultiTypeFromValue(formik.values?.subChartPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 5 }}
                      value={formik.values?.subChartPath as string}
                      type="String"
                      variableName="subChartPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('subChartPath', value)}
                      isReadonly={isReadonly}
                      allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    />
                  )}
                </div>
              </Layout.Horizontal>
              <div className={helmcss.halfWidth}>
                <DragnDropPaths
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  fieldPath="valuesPaths"
                  pathLabel={getString('pipeline.manifestType.valuesYamlPath')}
                  placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                  defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                  allowSinglePathDeletion
                />
              </div>

              <Accordion
                activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                className={cx({
                  [helmcss.advancedStepOpen]: isActiveAdvancedStep
                })}
              >
                <Accordion.Panel
                  id={getString('advancedTitle')}
                  addDomId={true}
                  summary={getString('advancedTitle')}
                  details={
                    <HelmAdvancedStepSection
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      helmVersion={formik.values?.helmVersion}
                      deploymentType={deploymentType as string}
                      helmStore={defaultTo(modifiedPrevStepData?.store, '')}
                    />
                  }
                />
              </Accordion>
            </div>

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

export default HelmWithS3
