/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Accordion,
  Layout,
  Button,
  FormInput,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  ButtonVariation,
  AllowedTypes,
  FormikForm,
  SelectOption
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper, useGetGCSBucketList } from 'services/cd-ng'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'

import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type { HelmWithGcsDataType, HelmWithGcsManifestLastStepPrevStepData } from '../../ManifestInterface'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'

import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  helmVersions,
  ManifestDataType,
  ManifestIdentifierValidation
} from '../../Manifesthelper'
import { filePathWidth, handleCommandFlagsSubmitData, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import DragnDropPaths from '../../DragnDropPaths'
import { useGetHelmChartVersionData } from '../CommonManifestDetails/useGetHelmChartVersionData'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface HelmWithGcsPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  deploymentType?: string
  editManifestModePrevStepData?: HelmWithGcsManifestLastStepPrevStepData
}

function HelmWithGcs({
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
}: StepProps<ConnectorConfigDTO> & HelmWithGcsPropType): React.ReactElement {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags
  const [selectedHelmVersion, setHelmVersion] = useState(initialValues?.spec?.helmVersion ?? 'V3')

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)
  const { chartVersions, loadingChartVersions, chartVersionsError, fetchChartVersions, setLastQueryData } =
    useGetHelmChartVersionData({ modifiedPrevStepData, fields: ['chartName', 'bucketName', 'folderPath'] })

  React.useEffect(() => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    setLastQueryData({
      chartName: defaultTo(initialValues?.spec?.chartName, ''),
      bucketName: defaultTo(specValues?.bucketName, ''),
      folderPath: defaultTo(specValues?.folderPath, '')
    })
  }, [initialValues])

  // Bucket Data
  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetGCSBucketList({
    lazy: true,
    debounce: 300
  })

  const bucketOptions = Object.keys(bucketData?.data || {}).map(item => ({
    label: item,
    value: item
  }))

  const onBucketNameFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    if (!bucketData?.data) {
      refetchBuckets({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: modifiedPrevStepData?.connectorRef?.value
        }
      })
    }
  }

  const getInitialValues = (): HelmWithGcsDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        helmVersion: initialValues.spec?.helmVersion,
        chartVersion: initialValues.spec?.chartVersion,
        chartName: initialValues.spec?.chartName,
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
        commandFlags: initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
          commandType: commandFlag.commandType,
          flag: commandFlag.flag
          // id: uuid(commandFlag, nameSpace())
        })) || [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
      }
    }
    return {
      identifier: '',
      helmVersion: 'V3',
      chartName: '',
      chartVersion: '',
      subChartPath: '',
      skipResourceVersioning: false,
      enableDeclarativeRollback: false,
      bucketName: '',
      folderPath: '/',
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
    }
  }
  const submitFormData = (formData: HelmWithGcsDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: ManifestDataType.HelmChart,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              bucketName: formData?.bucketName,
              folderPath: formData?.folderPath
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

  const itemRenderer = React.useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem
        item={item}
        itemProps={itemProps}
        disabled={loadingChartVersions || !!chartVersionsError}
        style={chartVersionsError ? { lineClamp: 1, width: 400, padding: 'small' } : {}}
      />
    ),
    [chartVersionsError, loadingChartVersions]
  )

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      {error && showError(getRBACErrorMessage(error as any))}
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="helmWithGcs"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            getString,
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueName')
          ),
          chartName: Yup.string().trim().required(getString('pipeline.manifestType.http.chartNameRequired')),
          helmVersion: Yup.string().trim().required(getString('pipeline.manifestType.helmVersionRequired')),
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
        {(formik: { setFieldValue: (a: string, b: string) => void; values: HelmWithGcsDataType }) => (
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
                {getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
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
                        style={{ alignSelf: 'center', marginBottom: 4 }}
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
                )}
                {getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) === MultiTypeInputType.FIXED && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTypeInput
                      selectItems={bucketOptions}
                      disabled={loading}
                      useValue
                      label={getString('pipeline.manifestType.bucketName')}
                      placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                      name="bucketName"
                      multiTypeInputProps={{
                        selectProps: {
                          items: bucketOptions,
                          allowCreatingNewItems: true
                        },
                        onFocus: onBucketNameFocus,
                        onChange: () => {
                          resetFieldValue(formik, 'chartVersion')
                        }
                      }}
                    />
                    {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
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
                )}
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
                    multiTextInputProps={{ expressions, allowableTypes }}
                    placeholder={getString('pipeline.manifestType.chartPathPlaceholder')}
                    name="folderPath"
                    isOptional={true}
                    onChange={() => {
                      resetFieldValue(formik, 'chartVersion')
                    }}
                  />
                  {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 4 }}
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
                      style={{ alignSelf: 'center', marginBottom: 4 }}
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
                        if (
                          e?.target?.type !== 'text' ||
                          (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                        ) {
                          return
                        }
                        !loadingChartVersions &&
                          fetchChartVersions({
                            folderPath: formik.values?.folderPath,
                            chartName: formik.values?.chartName,
                            helmVersion: formik.values?.helmVersion,
                            bucketName: defaultTo(
                              (formik.values?.bucketName as SelectOption)?.value,
                              formik.values?.bucketName
                            ) as string
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
                      onChange={value => formik.setFieldValue('chartVersion', value)}
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
              <div
                className={cx({
                  [helmcss.runtimeInput]:
                    getMultiTypeFromValue(formik.values?.valuesPaths) === MultiTypeInputType.RUNTIME
                })}
              >
                <DragnDropPaths
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  fieldPath="valuesPaths"
                  pathLabel={getString('pipeline.manifestType.valuesYamlPath')}
                  placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                  defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                  dragDropFieldWidth={filePathWidth}
                  allowSinglePathDeletion
                />
                {getMultiTypeFromValue(formik.values.valuesPaths) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.valuesPaths}
                    type={getString('string')}
                    variableName={'valuesPaths'}
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={val => formik?.setFieldValue('valuesPaths', val)}
                    isReadonly={isReadonly}
                  />
                )}
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
                      isReadonly={isReadonly}
                      deploymentType={deploymentType as string}
                      helmStore={modifiedPrevStepData?.store ?? ''}
                    />
                  }
                />
              </Accordion>
            </div>

            <Layout.Horizontal spacing="medium" className={css.saveBtn}>
              <Button
                text={getString('back')}
                variation={ButtonVariation.SECONDARY}
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

export default HelmWithGcs
