/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import {
  AllowedTypes,
  Color,
  Container,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'

import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { CommandUnitType, CustomScriptCommandUnit, LocationType, scriptTypeOptions } from '../CommandScriptsTypes'
import { TailFilesEdit } from './TailFilesEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './CommandEdit.module.scss'

interface ScriptCommandEditProps {
  formik: FormikProps<CommandUnitType>
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export function ScriptCommandEdit(props: ScriptCommandEditProps): React.ReactElement {
  const { formik, readonly = false, allowableTypes } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [locationType, setLocationType] = useState<LocationType>(
    (formik.values as CustomScriptCommandUnit).spec.source.type as LocationType
  )

  const scriptType: ScriptType = defaultTo((formik.values as CustomScriptCommandUnit).spec?.shell, 'Bash')

  const onLocationChange = (value: LocationType) => {
    setLocationType(value)
  }

  return (
    <>
      <Container className={css.destinationPath}>
        <MultiTypeTextField
          label={
            <Text
              tooltipProps={{ dataTooltipId: 'workingDirectory' }}
              className={css.destinationPathLabel}
              color={Color.GREY_500}
            >
              {getString('workingDirectory')}
            </Text>
          }
          name="spec.workingDirectory"
          multiTextInputProps={{
            multiTextInputProps: { expressions, allowableTypes },
            disabled: readonly,
            placeholder: getString('cd.enterWorkDirectory')
          }}
        />
      </Container>
      <FormInput.RadioGroup
        name="spec.source.type"
        label={getString('cd.steps.commands.selectScriptLocation')}
        items={[
          {
            label: getString('cd.steps.commands.locationFileStore'),
            value: LocationType.HARNESS
          },
          {
            label: getString('inline'),
            value: LocationType.INLINE
          }
        ]}
        radioGroup={{ inline: true }}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onLocationChange(e.currentTarget.value as LocationType)
        }}
      />
      <FormInput.Select
        style={{ marginTop: '5px' }}
        name="spec.shell"
        label={getString('common.scriptType')}
        placeholder={getString('cd.steps.commands.scriptTypePlaceholder')}
        disabled={readonly}
        items={scriptTypeOptions}
        onChange={(selected: SelectOption) => {
          formik.setFieldValue('shell', selected.value)
        }}
      />
      {locationType === LocationType.HARNESS && (
        <div className={css.fieldWrapper}>
          <FileStoreSelectField
            label={getString('common.git.filePath')}
            name="spec.source.spec.file"
            onChange={newValue => {
              formik?.setFieldValue('spec.source.spec.file', newValue)
            }}
            fileUsage={FileUsage.SCRIPT}
          />
        </div>
      )}
      {locationType === LocationType.INLINE && (
        <div className={cx(stepCss.formGroup, css.scriptField)}>
          <MultiTypeFieldSelector
            name="spec.source.spec.script"
            label={getString('commandLabel')}
            defaultValueToReset=""
            disabled={readonly}
            allowedTypes={allowableTypes}
            disableTypeSelection={readonly}
            skipRenderValueInExpressionLabel
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  name="spec.source.spec.script"
                  scriptType={scriptType}
                  disabled={readonly}
                  expressions={expressions}
                />
              )
            }}
          >
            <ShellScriptMonacoField
              name="spec.source.spec.script"
              scriptType={scriptType}
              disabled={readonly}
              expressions={expressions}
              title={getString('commandLabel')}
            />
          </MultiTypeFieldSelector>
          {getMultiTypeFromValue((formik.values as CustomScriptCommandUnit).spec.source?.spec?.script) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={(formik.values as CustomScriptCommandUnit).spec.source?.spec?.script as string}
              type="String"
              variableName="spec.source.spec.script"
              className={css.minConfigBtn}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.source.spec.script', value)}
              isReadonly={readonly}
            />
          )}
        </div>
      )}
      <TailFilesEdit formik={formik} allowableTypes={allowableTypes} />
    </>
  )
}
