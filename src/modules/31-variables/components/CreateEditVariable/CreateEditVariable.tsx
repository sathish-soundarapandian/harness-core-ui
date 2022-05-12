/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  useToaster
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'

import {
  convertVariableDTOToFormData,
  convertVariableFormDataToDTO,
  getVaribaleTypeOptions,
  StringFormData,
  Validation,
  VariableFormDataWithScope,
  VariableType
} from '@variables/utils/VariablesUtils'

import { useCreateVariable, useUpdateVariable, VariableDTO, VariableRequestDTO } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import VariableValidation from '../VariableValidation/VariableValidation'
import css from './CreateEditVariable.module.scss'

interface CreateEditVariableProps {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  onSuccess?: (data: VariableDTO) => void
  closeModal: () => void
  variable?: VariableDTO
}

const CreateEditVariable: React.FC<CreateEditVariableProps> = props => {
  const isEdit = !!props.variable
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { mutate: createVariable, loading: creating } = useCreateVariable({
    queryParams: { accountIdentifier: props.accountId }
  })
  const { mutate: updateVariable, loading: updating } = useUpdateVariable({
    queryParams: { accountIdentifier: props.accountId }
  })
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const handleCreateUpdate = async (payload: VariableRequestDTO) => {
    try {
      const response = await (isEdit ? updateVariable(payload) : createVariable(payload))
      if (response.status === 'SUCCESS') {
        props.onSuccess?.(payload.variable as VariableDTO)
        showSuccess(
          getString(isEdit ? 'variables.successUpdate' : 'variables.successCreate', { name: payload.variable?.name })
        )
      }
    } catch (error) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(error))
    }
  }
  const defaultInitialValues = {
    name: '',
    identifier: '',
    defaultValue: '',
    description: '',
    type: VariableType.String,
    fixedValue: '',
    allowedValues: [],
    valueType: Validation.FIXED
  }

  const initialValues = props.variable ? convertVariableDTOToFormData(props.variable) : defaultInitialValues

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<StringFormData>
        formName={'variable-form'}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema(),
          type: Yup.string().trim().required(getString('variables.validation.type')),
          valueType: Yup.string().trim().required(getString('variables.validation.validation')),
          fixedValue: Yup.string().when('valueType', {
            is: valueType => valueType === Validation.FIXED,
            then: Yup.string().required(getString('variables.validation.fixedValue')),
            otherwise: Yup.string().nullable()
          })
        })}
        onSubmit={data => {
          const dataWithScope: VariableFormDataWithScope = {
            ...data,
            projectIdentifier: props.projectIdentifier,
            orgIdentifier: props.orgIdentifier
          }
          const payload = convertVariableFormDataToDTO(dataWithScope)
          handleCreateUpdate(payload)
        }}
      >
        {formik => (
          <FormikForm data-testid="add-edit-variable" className={css.variableFormWrap}>
            <Layout.Vertical className={css.variableForm}>
              <NameIdDescription formikProps={formik} identifierProps={{ isIdentifierEditable: !isEdit }} />
              <FormInput.Select
                name="type"
                items={getVaribaleTypeOptions(getString)}
                label={getString('typeLabel')}
                placeholder={getString('common.selectType')}
              />
              <VariableValidation formik={formik} />
            </Layout.Vertical>
            <Layout.Horizontal spacing="small" padding={{ top: 'small' }}>
              <Button
                type="submit"
                disabled={creating || updating}
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                data-testid="addVariableSave"
              />

              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={() => props.closeModal()}
                data-testid="addVariableCancel"
              />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </>
  )
}

export default CreateEditVariable
