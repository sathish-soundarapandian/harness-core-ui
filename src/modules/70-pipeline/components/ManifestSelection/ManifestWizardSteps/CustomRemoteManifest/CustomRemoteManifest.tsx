/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Accordion,
  AllowedTypes,
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
import { useParams } from 'react-router-dom'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CustomManifestManifestDataType, ManifestTypes } from '../../ManifestInterface'
import {
  ManifestDataType,
  ManifestIdentifierValidation,
  cfCliVersions,
  getSkipResourceVersioningBasedOnDeclarativeRollback
} from '../../Manifesthelper'
import CustomRemoteAdvancedStepSection from './CustomRemoteAdvancedStepSection'
import DragnDropPaths from '../../DragnDropPaths'
import { filePathWidth, handleCommandFlagsSubmitData, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface CustomRemoteManifestPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  deploymentType?: string
}

const showValuesPaths = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.K8sManifest, ManifestDataType.HelmChart].includes(selectedManifest)
}
const showParamsPaths = (selectedManifest: ManifestTypes): boolean => {
  return selectedManifest === ManifestDataType.OpenshiftTemplate
}

const showTASAdditionalPaths = (selectedManifest: ManifestTypes): boolean => {
  return selectedManifest === ManifestDataType.TasManifest
}

const showSkipResourceVersion = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.K8sManifest, ManifestDataType.HelmChart, ManifestDataType.OpenshiftTemplate].includes(
    selectedManifest
  )
}

const showHelmVersion = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.HelmChart].includes(selectedManifest)
}

type PathsInterface = { path: string; uuid: string }

function CustomRemoteManifest({
  stepName,
  selectedManifest,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly,
  deploymentType
}: StepProps<ConnectorConfigDTO> & CustomRemoteManifestPropType): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const getInitialValues = (): CustomManifestManifestDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const valuesPaths = get(initialValues, 'spec.valuesPaths')
    const paramsPaths = get(initialValues, 'spec.paramsPaths')
    const varsPaths = get(initialValues, 'spec.varsPaths')
    const autoScalerPath = get(initialValues, 'spec.autoScalerPath')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning'),
        enableDeclarativeRollback: initialValues?.spec?.enableDeclarativeRollback,
        helmVersion: get(initialValues, 'spec.helmVersion'),
        valuesPaths:
          typeof valuesPaths === 'string'
            ? valuesPaths
            : removeEmptyFieldsFromStringArray(defaultTo(valuesPaths, []))?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),
        paramsPaths:
          typeof paramsPaths === 'string'
            ? paramsPaths
            : removeEmptyFieldsFromStringArray(defaultTo(paramsPaths, []))?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),

        commandFlags: initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
          commandType: commandFlag.commandType,
          flag: commandFlag.flag
        })) || [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }],
        ...(showTASAdditionalPaths(selectedManifest as ManifestTypes) && {
          cfCliVersion: get(initialValues, 'spec.cfCliVersion'),
          varsPaths:
            typeof varsPaths === 'string'
              ? varsPaths
              : removeEmptyFieldsFromStringArray(defaultTo(varsPaths, []))?.map((path: string) => ({
                  path,
                  uuid: uuid(path, nameSpace())
                })),
          autoScalerPath:
            typeof autoScalerPath === 'string'
              ? autoScalerPath
              : removeEmptyFieldsFromStringArray(defaultTo(autoScalerPath, []))?.map((path: string) => ({
                  path,
                  uuid: uuid(path, nameSpace())
                }))
        })
      }
    }
    return {
      identifier: '',
      filePath: '',
      extractionScript: '',
      skipResourceVersioning: false,
      enableDeclarativeRollback: false,
      valuesPaths: [{ path: '', uuid: uuid('', nameSpace()) } as PathsInterface],
      paramsPaths: [{ path: '', uuid: uuid('', nameSpace()) } as PathsInterface],
      helmVersion: 'V3',
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }],
      delegateSelectors: [],
      ...(showTASAdditionalPaths(selectedManifest as ManifestTypes) && { cfCliVersion: 'V7' })
    }
  }

  const submitFormData = (formData: CustomManifestManifestDataType & { store?: string }): void => {
    /* istanbul ignore else */
    if (formData) {
      const manifestObj: ManifestConfigWrapper = {
        manifest: {
          identifier: formData.identifier,
          type: selectedManifest as ManifestTypes,
          spec: {
            store: {
              type: formData.store,
              spec: {
                filePath: formData.filePath,
                extractionScript: formData.extractionScript,
                delegateSelectors: formData.delegateSelectors
              }
            }
          }
        }
      }
      if (showSkipResourceVersion(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.skipResourceVersioning',
          getSkipResourceVersioningBasedOnDeclarativeRollback(
            formData?.skipResourceVersioning,
            formData?.enableDeclarativeRollback
          )
        )
        set(manifestObj, 'manifest.spec.enableDeclarativeRollback', formData?.enableDeclarativeRollback)
      }
      if (showHelmVersion(selectedManifest as ManifestTypes)) {
        set(manifestObj, 'manifest.spec.helmVersion', formData?.helmVersion)
      }
      if (showValuesPaths(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.valuesPaths',
          typeof formData.valuesPaths === 'string'
            ? formData.valuesPaths
            : removeEmptyFieldsFromStringArray(
                defaultTo(formData.valuesPaths as Array<{ path: string }>, []).map(
                  (path: { path: string }) => path.path
                )
              )
        )
      }
      if (showParamsPaths(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.paramsPaths',
          typeof formData.paramsPaths === 'string'
            ? formData.paramsPaths
            : removeEmptyFieldsFromStringArray(
                defaultTo(formData.paramsPaths as Array<{ path: string }>, []).map(
                  (path: { path: string }) => path.path
                )
              )
        )
      }
      handleCommandFlagsSubmitData(manifestObj, formData)

      /* istanbul ignore else */ if (showTASAdditionalPaths(selectedManifest as ManifestTypes)) {
        set(
          manifestObj,
          'manifest.spec.varsPaths',
          typeof formData.varsPaths === 'string'
            ? formData.varsPaths
            : defaultTo(formData.varsPaths as Array<{ path: string }>, []).map((path: { path: string }) => path.path)
        )
        set(
          manifestObj,
          'manifest.spec.autoScalerPath',
          typeof formData.autoScalerPath === 'string'
            ? formData.autoScalerPath
            : defaultTo(formData.autoScalerPath as Array<{ path: string }>, []).map(
                (path: { path: string }) => path.path
              )
        )
        set(manifestObj, 'manifest.spec.cfCliVersion', formData?.cfCliVersion)
      }

      handleSubmit(manifestObj)
    }
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="customRemoteManifest"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            getString,
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueName')
          ),
          extractionScript: Yup.string()
            .trim()
            .required(
              getString('fieldRequired', { field: getString('pipeline.manifestType.customRemoteExtractionScript') })
            ),
          filePath: Yup.string()
            .trim()
            .required(
              getString('fieldRequired', {
                field: getString('pipeline.manifestType.customRemoteExtractedFileLocation')
              })
            ),
          paths: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
              return Yup.array().of(
                Yup.object().shape({
                  path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                })
              )
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          }),
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
            ...prevStepData,
            ...formData
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: CustomManifestManifestDataType }) => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <div className={css.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                    />
                  </div>
                  {showTASAdditionalPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <FormInput.Select
                        name="cfCliVersion"
                        label={getString('pipeline.manifestType.cfCliVersion')}
                        items={cfCliVersions as SelectOption[]}
                        disabled
                      />
                    </div>
                  )}
                  <div
                    className={cx(css.halfWidth, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.extractionScript) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <MultiTypeFieldSelector
                      name={'extractionScript'}
                      label={getString('pipeline.manifestType.customRemoteExtractionScript')}
                      allowedTypes={allowableTypes}
                      style={{ width: 450 }}
                      skipRenderValueInExpressionLabel
                      expressionRender={() => (
                        /* istanbul ignore next */
                        <MonacoTextField
                          name={'extractionScript'}
                          expressions={expressions}
                          height={80}
                          fullScreenAllowed
                          fullScreenTitle={getString('pipeline.manifestType.customRemoteExtractionScript')}
                        />
                      )}
                    >
                      <MonacoTextField
                        name={'extractionScript'}
                        expressions={expressions}
                        height={80}
                        fullScreenAllowed
                        fullScreenTitle={getString('pipeline.manifestType.customRemoteExtractionScript')}
                      />
                    </MultiTypeFieldSelector>
                    {getMultiTypeFromValue(get(formik, 'values.extractionScript')) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={get(formik, 'values.extractionScript') as string}
                        type="String"
                        variableName="extractionScript"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={/* istanbul ignore next */ value => formik.setFieldValue('filePath', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                  <div
                    className={cx(css.halfWidth, {
                      [css.runtimeInput]: getMultiTypeFromValue(formik.values?.filePath) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      multiTextInputProps={{ expressions, allowableTypes }}
                      label={getString('pipeline.manifestType.customRemoteExtractedFileLocation')}
                      placeholder={getString('pipeline.manifestType.customRemoteExtractedFileLocationPlaceholder')}
                      name="filePath"
                    />

                    {getMultiTypeFromValue(get(formik, 'values.filePath')) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={get(formik, 'values.filePath') as string}
                        type="String"
                        variableName="filePath"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={/* istanbul ignore next */ value => formik.setFieldValue('filePath', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>

                  {showTASAdditionalPaths(selectedManifest as ManifestTypes) && (
                    <>
                      <div
                        className={cx({
                          [css.runtimeInput]:
                            getMultiTypeFromValue(formik.values?.varsPaths as string) === MultiTypeInputType.RUNTIME
                        })}
                      >
                        <DragnDropPaths
                          formik={formik}
                          expressions={expressions}
                          allowableTypes={allowableTypes}
                          fieldPath="varsPaths"
                          pathLabel={getString('pipeline.manifestType.varsYAMLPath')}
                          placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                          defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                          dragDropFieldWidth={filePathWidth}
                        />
                        {getMultiTypeFromValue(formik.values.varsPaths as string) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formik.values.varsPaths as string}
                            type={getString('string')}
                            variableName={'varsPaths'}
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={/* istanbul ignore next */ val => formik?.setFieldValue('varsPaths', val)}
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                      <div
                        className={cx({
                          [css.runtimeInput]:
                            getMultiTypeFromValue(formik.values?.autoScalerPath as string) ===
                            MultiTypeInputType.RUNTIME
                        })}
                      >
                        <DragnDropPaths
                          formik={formik}
                          expressions={expressions}
                          allowableTypes={allowableTypes}
                          fieldPath="autoScalerPath"
                          pathLabel={getString('pipeline.manifestType.autoScalerYAMLPath')}
                          placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                          defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                          dragDropFieldWidth={filePathWidth}
                          allowOnlyOneFilePath={true}
                        />
                        {getMultiTypeFromValue(formik.values.autoScalerPath as string) ===
                          MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formik.values.autoScalerPath as string}
                            type={getString('string')}
                            variableName={'autoScalerPath'}
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={/* istanbul ignore next */ val => formik?.setFieldValue('autoScalerPath', val)}
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    </>
                  )}

                  <div className={css.halfWidth}>
                    <MultiTypeDelegateSelector
                      expressions={expressions}
                      name="delegateSelectors"
                      inputProps={{ projectIdentifier, orgIdentifier }}
                      allowableTypes={allowableTypes}
                      disabled={isReadonly}
                    />
                  </div>
                  {showValuesPaths(selectedManifest as ManifestTypes) && (
                    <div
                      className={cx({
                        [css.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.valuesPaths as string) === MultiTypeInputType.RUNTIME
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
                      />
                      {getMultiTypeFromValue(formik.values.valuesPaths as string) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values.valuesPaths as string}
                          type={getString('string')}
                          variableName={'valuesPaths'}
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={val => formik?.setFieldValue('valuesPaths', val)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}
                  {showParamsPaths(selectedManifest as ManifestTypes) && (
                    <div
                      className={cx({
                        [css.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.paramsPaths as string) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <DragnDropPaths
                        formik={formik}
                        expressions={expressions}
                        allowableTypes={allowableTypes}
                        fieldPath="paramsPaths"
                        pathLabel={getString('pipeline.manifestType.paramsYamlPath')}
                        placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                        defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                        dragDropFieldWidth={filePathWidth}
                      />
                      {getMultiTypeFromValue(formik.values.paramsPaths as string) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values.paramsPaths as string}
                          type={getString('string')}
                          variableName={'paramsPaths'}
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={val => formik?.setFieldValue('paramsPaths', val)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}
                  {showSkipResourceVersion(selectedManifest as ManifestTypes) && (
                    <Accordion
                      activeId={get(initialValues, 'spec.skipResourceVersioning') ? getString('advancedTitle') : ''}
                      className={css.advancedStepOpen}
                    >
                      <Accordion.Panel
                        id={getString('advancedTitle')}
                        addDomId={true}
                        summary={getString('advancedTitle')}
                        details={
                          <CustomRemoteAdvancedStepSection
                            formik={formik}
                            expressions={expressions}
                            allowableTypes={allowableTypes}
                            helmVersion={formik.values?.helmVersion}
                            deploymentType={deploymentType as string}
                            helmStore={prevStepData?.store ?? ''}
                            initialValues={initialValues}
                            selectedManifest={selectedManifest}
                          />
                        }
                      />
                    </Accordion>
                  )}
                </div>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
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
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default CustomRemoteManifest
