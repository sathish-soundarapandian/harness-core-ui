/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Layout,
  Button,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  ButtonVariation,
  SelectOption,
  AllowedTypes
} from '@harness/uicore'
import cx from 'classnames'

import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { FieldArray, FormikValues } from 'formik'
import { defaultTo, get, isBoolean } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ManifestConfig, useHelmCmdFlags } from 'services/cd-ng'
import { useDeepCompareEffect } from '@common/hooks'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import type { CommandFlags, HelmVersionOptions, ManifestTypes } from '../../ManifestInterface'
import { allowedManifestForDeclarativeRollback, helmVersions, ManifestDataType } from '../../Manifesthelper'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'
import css from './CustomRemoteAdvancedStepSection.module.scss'
interface CustomRemoteAdvancedStepProps {
  expressions: string[]
  allowableTypes: AllowedTypes
  formik: FormikValues
  isReadonly?: boolean
  deploymentType: string
  helmVersion: HelmVersionOptions
  helmStore: string
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
}

function CustomRemoteAdvancedStepSection({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  deploymentType,
  helmVersion,
  helmStore,
  initialValues,
  selectedManifest
}: CustomRemoteAdvancedStepProps): React.ReactElement {
  const { getString } = useStrings()
  const defaultValueToReset = [{ commandType: '', flag: '', id: uuid('', nameSpace()) }]
  const [commandFlagOptions, setCommandFlagOptions] = useState<Record<string, SelectOption[]>>({ V2: [], V3: [] })

  const [selectedHelmVersion, setHelmVersion] = useState(get(initialValues, 'spec.helmVersion') ?? 'V2')
  const isSkipVersioningDisabled =
    isBoolean(formik?.values?.enableDeclarativeRollback) && !!formik?.values?.enableDeclarativeRollback
  const { data: commandFlags, refetch: refetchCommandFlags } = useHelmCmdFlags({
    queryParams: {
      serviceSpecType: deploymentType as string,
      version: helmVersion,
      storeType: helmStore
    },
    lazy: true
  })

  useEffect(() => {
    if (!commandFlagOptions[helmVersion]?.length && selectedManifest !== ManifestDataType.K8sManifest) {
      refetchCommandFlags()
    }
  }, [helmVersion])

  useDeepCompareEffect(() => {
    const commandFlagSelectOption = {
      ...commandFlagOptions,
      [helmVersion]: commandFlags?.data?.map(commandFlag => ({ label: commandFlag, value: commandFlag }))
    }
    setCommandFlagOptions(commandFlagSelectOption as Record<string, SelectOption[]>)
  }, [commandFlags?.data])

  const commandFlagLabel = (): React.ReactElement => {
    return (
      <Layout.Horizontal flex spacing="small">
        <String tagName="div" stringID="pipeline.manifestType.helmCommandFlagLabel" />
      </Layout.Horizontal>
    )
  }

  return (
    <div className={helmcss.helmAdvancedSteps}>
      {allowedManifestForDeclarativeRollback(selectedManifest) && (
        <Layout.Horizontal
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          width={'90%'}
          margin={{ bottom: 'small' }}
        >
          <FormMultiTypeCheckboxField
            name="enableDeclarativeRollback"
            label={getString('pipeline.manifestType.enableDeclarativeRollback')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            className={cx(helmcss.checkbox, css.checkboxWidth)}
          />
          {getMultiTypeFromValue(formik.values?.enableDeclarativeRollback) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={(formik.values?.enableDeclarativeRollback || '') as string}
              type="String"
              variableName="enableDeclarativeRollback"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('enableDeclarativeRollback', value)}
              style={{ alignSelf: 'center', marginTop: 11 }}
              className={css.addmarginTop}
              isReadonly={isReadonly}
            />
          )}
        </Layout.Horizontal>
      )}
      <Layout.Horizontal width={'90%'} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <FormMultiTypeCheckboxField
          key={isSkipVersioningDisabled.toString()}
          name="skipResourceVersioning"
          label={getString('skipResourceVersion')}
          className={cx(helmcss.checkbox, css.checkboxWidth)}
          multiTypeTextbox={{ expressions, allowableTypes, disabled: isSkipVersioningDisabled }}
          disabled={isSkipVersioningDisabled}
        />
        {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={defaultTo(formik.values?.skipResourceVersioning, '') as string}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced
            onChange={/* istanbul ignore next */ value => formik.setFieldValue('skipResourceVersioning', value)}
            style={{ alignSelf: 'center', marginTop: 11 }}
            className={cx(css.addmarginTop)}
            isReadonly={isReadonly}
          />
        )}
        {selectedManifest !== ManifestDataType.K8sManifest ? (
          <FormInput.Select
            name="helmVersion"
            label={getString('helmVersion')}
            items={helmVersions}
            onChange={
              /* istanbul ignore next */ value => {
                if (value?.value !== selectedHelmVersion) {
                  formik.setFieldValue('commandFlags', [
                    { commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }
                  ] as any)
                  setHelmVersion(value)
                }
              }
            }
            className={helmcss.halfWidth}
          />
        ) : (
          <></>
        )}
      </Layout.Horizontal>

      {commandFlagOptions[helmVersion]?.length > 0 && (
        <div className={css.commandFlags}>
          <MultiTypeFieldSelector
            defaultValueToReset={defaultValueToReset}
            name={'commandFlags'}
            label={commandFlagLabel()}
            disableTypeSelection
          >
            <FieldArray
              name="commandFlags"
              render={({ push, remove }) => (
                <Layout.Vertical>
                  {formik.values?.commandFlags?.map((commandFlag: CommandFlags, index: number) => (
                    <Layout.Horizontal key={commandFlag.id} margin={{ top: 'medium' }}>
                      <div
                        className={cx(css.commandType, {
                          [css.commandFlagType]: index !== 0
                        })}
                      >
                        <FormInput.Select
                          name={`commandFlags[${index}].commandType`}
                          label={index === 0 ? getString('pipeline.fieldLabels.commandType') : ''}
                          items={commandFlagOptions[helmVersion]}
                          placeholder={getString('pipeline.fieldPlaceholders.commandType')}
                          className={css.commandTypeSelect}
                        />
                      </div>
                      <div
                        className={cx({
                          [css.commandFlags]: index !== 0
                        })}
                      >
                        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                          <MultiTypeFieldSelector
                            name={`commandFlags[${index}].flag`}
                            label={index === 0 ? getString('flag') : ''}
                            allowedTypes={allowableTypes}
                            style={{ width: 450 }}
                            skipRenderValueInExpressionLabel
                            expressionRender={() => (
                              /* istanbul ignore next */
                              <MonacoTextField
                                name={`commandFlags[${index}].flag`}
                                expressions={expressions}
                                height={80}
                                fullScreenAllowed
                                fullScreenTitle={getString('flag')}
                              />
                            )}
                          >
                            <MonacoTextField
                              name={`commandFlags[${index}].flag`}
                              expressions={expressions}
                              height={80}
                              fullScreenAllowed
                              fullScreenTitle={getString('flag')}
                            />
                          </MultiTypeFieldSelector>

                          {index !== 0 && (
                            <Button
                              minimal
                              icon="main-trash"
                              className={cx({
                                [css.delBtn]: index === 0
                              })}
                              onClick={() => remove(index)}
                            />
                          )}
                        </Layout.Horizontal>
                      </div>
                    </Layout.Horizontal>
                  ))}
                  {!!(formik.values?.commandFlags?.length < commandFlagOptions[helmVersion].length) && (
                    <span>
                      <Button
                        minimal
                        text={getString('add')}
                        variation={ButtonVariation.PRIMARY}
                        onClick={() => push({ commandType: '', flag: '', id: uuid('', nameSpace()) })}
                      />
                    </span>
                  )}
                </Layout.Vertical>
              )}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
    </div>
  )
}

export default CustomRemoteAdvancedStepSection
