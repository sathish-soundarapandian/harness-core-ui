/*
 * Copyright 2023 Harness Inc. All rights reserved.
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
  AllowedTypes,
  Container
} from '@harness/uicore'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { FieldArray, FormikValues } from 'formik'
import { isBoolean } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useKustomizeCmdFlags } from 'services/cd-ng'
import { useDeepCompareEffect } from '@common/hooks'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import type { CommandFlags } from '../ManifestInterface'
import { ManifestStoreMap } from '../Manifesthelper'
import helmcss from './HelmWithGIT/HelmWithGIT.module.scss'
import css from './ManifestWizardSteps.module.scss'

interface HelmAdvancedStepProps {
  expressions: string[]
  allowableTypes: AllowedTypes
  formik: FormikValues
  storeType: string
  isReadonly?: boolean
}

function KustomizeAdvancedStepSelection({
  formik,
  expressions,
  allowableTypes,
  storeType,
  isReadonly
}: HelmAdvancedStepProps): React.ReactElement {
  const { getString } = useStrings()
  const defaultValueToReset = [{ commandType: '', flag: '', id: uuid('', nameSpace()) }]
  const [commandFlagOptions, setCommandFlagOptions] = useState<SelectOption[]>([])
  const isSkipVersioningDisabled =
    isBoolean(formik?.values?.enableDeclarativeRollback) && !!formik?.values?.enableDeclarativeRollback

  const { data: commandFlags, refetch: refetchCommandFlags } = useKustomizeCmdFlags({
    lazy: true
  })

  useEffect(() => {
    if (!commandFlagOptions?.length) {
      refetchCommandFlags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDeepCompareEffect(() => {
    setCommandFlagOptions(
      (commandFlags?.data || [])?.map(commandFlag => ({ label: commandFlag, value: commandFlag })) as SelectOption[]
    )
  }, [commandFlags?.data])

  const commandFlagLabel = (): React.ReactElement => {
    return (
      <Layout.Horizontal flex spacing="small">
        <String tagName="div" stringID="pipeline.manifestType.kustomizeCommandFlagLabel" />
      </Layout.Horizontal>
    )
  }

  return (
    <Container className={cx(css.advancesSteps)}>
      {storeType !== ManifestStoreMap.Harness && (
        <Layout.Vertical margin={{ bottom: 'small' }}>
          <FormInput.CheckBox
            name="optimizedKustomizeManifestCollection"
            label={getString('pipeline.manifestType.optimizedKustomizeManifestCollection')}
          />
          {!!formik.values.optimizedKustomizeManifestCollection && (
            <Layout.Horizontal
              flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
              margin={{ left: 'xlarge' }}
              width={430}
            >
              <FormInput.MultiTextInput
                className={css.kustomizeYamlFolderPath}
                label={getString('pipeline.manifestType.kustomizeYamlFolderPath')}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                name="kustomizeYamlFolderPath"
                multiTextInputProps={{ expressions, allowableTypes }}
              />
              {getMultiTypeFromValue(formik.values?.kustomizeYamlFolderPath) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ alignSelf: 'center', marginBottom: 4 }}
                  value={formik.values?.kustomizeYamlFolderPath || ''}
                  type="String"
                  variableName="kustomizeYamlFolderPath"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={/* istanbul ignore next */ value => formik.setFieldValue('kustomizeYamlFolderPath', value)}
                  isReadonly={isReadonly}
                />
              )}
            </Layout.Horizontal>
          )}
        </Layout.Vertical>
      )}
      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} margin={{ bottom: 'small' }}>
        <FormMultiTypeCheckboxField
          name="enableDeclarativeRollback"
          label={getString('pipeline.manifestType.enableDeclarativeRollback')}
          multiTypeTextbox={{ expressions, allowableTypes }}
          tooltipProps={{
            dataTooltipId: 'kustomizeEnableDeclarativeRollback'
          }}
          className={cx(css.checkbox, helmcss.halfWidth)}
        />
        {getMultiTypeFromValue(formik.values?.enableDeclarativeRollback) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={(formik.values?.enableDeclarativeRollback || '') as string}
            type="String"
            variableName="enableDeclarativeRollback"
            showRequiredField={false}
            showDefaultField={false}
            onChange={/* istanbul ignore next */ value => formik.setFieldValue('enableDeclarativeRollback', value)}
            style={{ alignSelf: 'center', marginTop: 11 }}
            className={css.addmarginTop}
            isReadonly={isReadonly}
          />
        )}
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <FormMultiTypeCheckboxField
          key={isSkipVersioningDisabled.toString()}
          name="skipResourceVersioning"
          label={getString('skipResourceVersion')}
          multiTypeTextbox={{ expressions, allowableTypes, disabled: isSkipVersioningDisabled }}
          tooltipProps={{
            dataTooltipId: 'helmSkipResourceVersion'
          }}
          disabled={isSkipVersioningDisabled}
          className={cx(css.checkbox, helmcss.halfWidth)}
        />
        {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={(formik.values?.skipResourceVersioning || '') as string}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={false}
            onChange={/* istanbul ignore next */ value => formik.setFieldValue('skipResourceVersioning', value)}
            style={{ alignSelf: 'center', marginTop: 11 }}
            className={css.addmarginTop}
            isReadonly={isReadonly}
          />
        )}
      </Layout.Horizontal>
      {commandFlagOptions?.length > 0 && (
        <Container className={css.commandFlags} margin={{ top: 'large' }}>
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
                          items={commandFlagOptions}
                          placeholder={getString('pipeline.fieldPlaceholders.commandType')}
                          className={css.commandTypeSelect}
                        />
                      </div>
                      <div
                        className={cx({
                          [css.helmCommandFlags]: index !== 0
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

                          <Button
                            minimal
                            icon="main-trash"
                            margin={{ ...(index === 0 && { top: 'medium' }) }}
                            onClick={() => remove(index)}
                          />
                        </Layout.Horizontal>
                      </div>
                    </Layout.Horizontal>
                  ))}
                  {!!(formik.values?.commandFlags?.length < commandFlagOptions.length) && (
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
        </Container>
      )}
    </Container>
  )
}

export default KustomizeAdvancedStepSelection
