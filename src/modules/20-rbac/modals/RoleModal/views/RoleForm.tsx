/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags, useToaster } from '@common/components'
import { Role, usePostRole, usePutRole } from 'services/rbac'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from '@rbac/modals/RoleModal/useRoleModal.module.scss'

interface RoleModalData {
  data?: Role
  isEdit?: boolean
  onSubmit?: (role: Role) => void
  onCancel?: () => void
}

const RoleForm: React.FC<RoleModalData> = props => {
  const { data: roleData, onSubmit, isEdit, onCancel } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createRole, loading: saving } = usePostRole({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: editRole, loading: updating } = usePutRole({
    identifier: roleData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const handleSubmit = async (values: Role): Promise<void> => {
    try {
      if (isEdit) {
        const updated = await editRole(values)
        /* istanbul ignore else */ if (updated) {
          showSuccess(getString('rbac.roleForm.updateSuccess'))
          onSubmit?.(values)
        }
      } else {
        const created = await createRole(values)
        /* istanbul ignore else */ if (created) {
          showSuccess(getString('rbac.roleForm.createSuccess'))
          onSubmit?.(values)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Formik
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        tags: {},
        ...roleData
      }}
      formName="roleForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={css.roleForm}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <NameIdDescriptionTags formikProps={formikProps} identifierProps={{ isIdentifierEditable: !isEdit }} />
            </Container>
            <Layout.Horizontal spacing="small">
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                type="submit"
                disabled={saving || updating}
              />
              <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default RoleForm
