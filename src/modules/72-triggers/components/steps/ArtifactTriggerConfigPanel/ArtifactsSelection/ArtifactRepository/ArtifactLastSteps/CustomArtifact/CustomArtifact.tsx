/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  FormInput,
  SelectOption,
  FormikForm,
  MultiTypeInputType
} from '@harness/uicore'
import { FieldArray } from 'formik'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { VariableInterface } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import type { CustomArtifactSpec } from 'services/pipeline-ng'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function FormContent({ expressions, prevStepData, previousStep, isReadonly = false, formik }: any): React.ReactElement {
  const { getString } = useStrings()

  const scriptType: ScriptType = getString('common.bash') as ScriptType

  return (
    <FormikForm>
      <div className={css.artifactForm}>
        <>
          <div className={cx(css.customArtifactContainer)}>
            <MultiTypeFieldSelector
              name="script"
              label={getString('common.script')}
              defaultValueToReset=""
              disabled={isReadonly}
              disableTypeSelection={true}
              skipRenderValueInExpressionLabel
              expressionRender={() => {
                return (
                  <ShellScriptMonacoField
                    name="script"
                    className={css.expanded}
                    scriptType={scriptType}
                    disabled={isReadonly}
                    expressions={expressions}
                  />
                )
              }}
            >
              <ShellScriptMonacoField
                name="script"
                scriptType={scriptType}
                disabled={isReadonly}
                className={'expanded'}
                expressions={expressions}
              />
            </MultiTypeFieldSelector>
          </div>

          <div className={css.customArtifactContainer}>
            <FormInput.MultiTextInput
              name="artifactsArrayPath"
              label={getString('pipeline.artifactsSelection.artifactsArrayPath')}
              placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes: [MultiTypeInputType.FIXED]
              }}
            />
          </div>

          <div className={css.customArtifactContainer}>
            <FormInput.MultiTextInput
              name="versionPath"
              label={getString('pipeline.artifactsSelection.versionPath')}
              placeholder={getString('pipeline.artifactsSelection.versionPathPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes: [MultiTypeInputType.FIXED]
              }}
            />
          </div>

          <div className={stepCss.formGroup}>
            <MultiTypeFieldSelector
              name="inputs"
              label={getString('pipeline.scriptInputVariables')}
              isOptional
              allowedTypes={[MultiTypeInputType.FIXED]}
              optionalLabel={getString('common.optionalLabel')}
              defaultValueToReset={[]}
              disableTypeSelection={true}
            >
              <FieldArray
                name="inputs"
                render={({ push, remove }) => {
                  return (
                    <div className={css.panel}>
                      <div className={css.variables}>
                        <span className={css.label}>Name</span>
                        <span className={css.label}>Type</span>
                        <span className={css.label}>Value</span>
                      </div>
                      {formik.values?.inputs?.map(({ id }: VariableInterface, i: number) => {
                        return (
                          <div className={css.variables} key={id}>
                            <FormInput.Text
                              name={`inputs.[${i}].name`}
                              placeholder={getString('name')}
                              disabled={isReadonly}
                            />
                            <FormInput.Select
                              items={scriptInputType}
                              name={`inputs.[${i}].type`}
                              placeholder={getString('typeLabel')}
                              disabled={isReadonly}
                            />
                            <FormInput.MultiTextInput
                              name={`inputs.[${i}].value`}
                              placeholder={getString('valueLabel')}
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED],
                                expressions,
                                disabled: isReadonly
                              }}
                              label=""
                              disabled={isReadonly}
                            />
                            <Button
                              variation={ButtonVariation.ICON}
                              icon="main-trash"
                              data-testid={`remove-environmentVar-${i}`}
                              onClick={() => remove(i)}
                              disabled={isReadonly}
                            />
                          </div>
                        )
                      })}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-environmentVar"
                        disabled={isReadonly}
                        onClick={() => push({ name: '', type: 'String', value: '' })}
                        // className={css.addButton}
                      >
                        {getString('addInputVar')}
                      </Button>
                    </div>
                  )
                }}
              />
            </MultiTypeFieldSelector>
          </div>
        </>
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
  )
}

export function CustomArtifact(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<CustomArtifactSpec>
): React.ReactElement {
  const { initialValues, handleSubmit, prevStepData } = props
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    script: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.script')),
    artifactsArrayPath: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.artifactsArrayPath')),
    versionPath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.versionPath'))
  })
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        formName="imagePath"
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {formik => {
          return <FormContent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
