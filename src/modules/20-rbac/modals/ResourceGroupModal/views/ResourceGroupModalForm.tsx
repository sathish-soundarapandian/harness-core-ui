/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags, useToaster } from '@common/components'
import {
  ResourceGroupV2,
  useCreateResourceGroupV2,
  useUpdateResourceGroupV2,
  ResourceGroupV2Request
} from 'services/resourcegroups'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import css from './ResourceGroupModal.module.scss'
interface ResourceGroupModalData {
  data?: ResourceGroupV2
  editMode: boolean
  onSubmit?: (resourceGroup: ResourceGroupV2) => void
  onCancel?: () => void
}

const ResourceGroupForm: React.FC<ResourceGroupModalData> = props => {
  const { onSubmit, data, editMode, onCancel } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createResourceGroup, loading: saving } = useCreateResourceGroupV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const { mutate: updateResourceGroup, loading: updating } = useUpdateResourceGroupV2({
    identifier: data?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const handleSubmit = async (values: ResourceGroupV2): Promise<void> => {
    const dataToSubmit: ResourceGroupV2Request = {
      resourceGroup: values
    }
    try {
      if (!editMode) {
        const created = await createResourceGroup(dataToSubmit)
        if (created) {
          showSuccess(getString('rbac.resourceGroup.createSuccess'))
          onSubmit?.(dataToSubmit.resourceGroup)
        }
      } else {
        const updated = await updateResourceGroup(dataToSubmit)
        if (updated) {
          showSuccess(getString('rbac.resourceGroup.updateSuccess'))
          onSubmit?.(dataToSubmit.resourceGroup)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Formik<ResourceGroupV2>
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        tags: {},
        color: DEFAULT_COLOR,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        includedScopes: [],
        resourceFilter: {},
        ...(editMode && data)
      }}
      formName="resourceGroupModalForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema(),
        color: Yup.string().trim().required()
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={css.modal}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <NameIdDescriptionTags formikProps={formikProps} identifierProps={{ isIdentifierEditable: !editMode }} />
              <FormInput.ColorPicker label={getString('rbac.resourceGroup.color')} name="color" />
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

export default ResourceGroupForm
