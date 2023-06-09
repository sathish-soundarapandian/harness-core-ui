/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Button, Formik, FormikForm, FormInput, ButtonVariation, Dialog, Layout, AllowedTypes } from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { CustomDeploymentNGVariable } from 'services/cd-ng'
import { getVaribaleTypeOptions, VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'

const MAX_LENGTH = 128

export interface VariableState {
  variable: AllNGVariables
  index: number
}

export interface AddEditCustomVariableProps {
  selectedVariable: VariableState | null
  setSelectedVariable(variable: VariableState | null): void
  addNewVariable(variable: AllNGVariables): void
  updateVariable(index: number, variable: AllNGVariables): void
  allowableTypes: AllowedTypes
  existingVariables?: AllNGVariables[]
  formName?: string
  allowedVarialblesTypes?: VariableType[]
}

export default function AddEditCustomVariable(props: AddEditCustomVariableProps): React.ReactElement {
  const {
    selectedVariable,
    setSelectedVariable,
    addNewVariable,
    updateVariable,
    existingVariables,
    formName,
    allowableTypes,
    allowedVarialblesTypes
  } = props
  const { getString } = useStrings()

  const existingNames: string[] = Array.isArray(existingVariables) ? existingVariables.map(v => v?.name || '') : []
  const isEdit = selectedVariable && typeof selectedVariable.index === 'number' && selectedVariable.index > -1
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  // remove current variable name in case of edit
  if (isEdit) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    existingNames.splice(selectedVariable!.index, 1)
  }

  function closeModal(): void {
    setSelectedVariable(null)
  }

  const actualFormName = formName || 'addEditCustomVariableForm'

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <Dialog
      className={'padded-dialog'}
      isOpen={!!selectedVariable}
      enforceFocus={false}
      style={{ width: 600 }}
      title={isEdit ? getString('common.editVariable') : getString('variables.newVariable')}
      onClose={closeModal}
    >
      <Formik
        formName={actualFormName}
        initialValues={selectedVariable?.variable}
        enableReinitialize
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .required(getString('common.validation.nameIsRequired'))
            .max(
              MAX_LENGTH,
              getString('common.validation.fieldCannotbeLongerThanN', { name: getString('name'), n: MAX_LENGTH })
            )
            .matches(
              /^[a-zA-Z_][0-9a-zA-Z_$.]*$/,
              getString('common.validation.fieldMustBeAlphanumeric', { name: getString('name') })
            )
            .notOneOf(existingNames, getString('common.validation.variableAlreadyExists'))
        })}
        onSubmit={data => {
          if (data && selectedVariable) {
            if (selectedVariable.index === -1) {
              addNewVariable(data)
            } else {
              updateVariable(selectedVariable.index, data)
            }
            closeModal()
          }
        }}
      >
        {({ submitForm, values }) => (
          <FormikForm data-testid="add-edit-variable">
            <Layout.Horizontal spacing="medium">
              <FormInput.Select
                name="type"
                items={getVaribaleTypeOptions(allowedVarialblesTypes, getString)}
                label={getString('typeLabel')}
                style={{ width: 150 }}
                placeholder={getString('pipeline.variable.typePlaceholder')}
                selectProps={{
                  usePortal: true
                }}
              />
              <FormInput.Text
                name="name"
                style={{ flex: 1 }}
                label={getString('name')}
                placeholder={getString('pipeline.variable.variableNamePlaceholder')}
              />
            </Layout.Horizontal>
            {values?.type === VariableType.Secret ? (
              <MultiTypeSecretInput name={`value`} label={getString('valueLabel')} />
            ) : (values?.type as CustomDeploymentNGVariable['type']) === VariableType.Connector ? (
              <FormMultiTypeConnectorField
                name={`value`}
                label={getString('valueLabel')}
                placeholder={getString('common.entityPlaceholderText')}
                accountIdentifier={accountId}
                multiTypeProps={{ expressions, allowableTypes }}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                setRefValue
                connectorLabelClass="connectorVariableField"
                enableConfigureOptions={false}
                type={[]}
                width="500px"
              />
            ) : (
              <FormInput.MultiTextInput
                name="value"
                label={getString('valueLabel')}
                multiTextInputProps={{
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  defaultValueToReset: '',
                  expressions,
                  textProps: {
                    type: values?.type === VariableType.Number ? 'number' : 'text'
                  },
                  allowableTypes
                }}
                data-testid="variables-test"
              />
            )}
            <FormInput.CheckBox
              name="required"
              label={getString('pipeline.required')}
              className={css.requiredCheckboxLabel}
            />
            <FormInput.TextArea
              name="description"
              isOptional={true}
              placeholder={getString('common.descriptionPlaceholder')}
              label={getString('description')}
              className={css.variableDescription}
              textArea={{
                growVertically: true
              }}
            />
            <div className="buttons-container">
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                onClick={submitForm}
                data-testid="addVariableSave"
              />
              &nbsp; &nbsp;
              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={() => closeModal()}
                data-testid="addVariableCancel"
              />
            </div>
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  )
}
