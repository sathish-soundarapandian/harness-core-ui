/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Formik,
  FormikForm as Form,
  Layout,
  Text,
  FormInput,
  Container,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  ButtonVariation
} from '@harness/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { UserInfo, useUpdateUserInfo } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

interface UserProfileData {
  user: UserInfo
  onSubmit: () => void
  onClose: () => void
}

const EditUserProfile: React.FC<UserProfileData> = props => {
  const { user, onSubmit, onClose } = props
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: updateProfile, loading } = useUpdateUserInfo({})
  const { showError, showSuccess } = useToaster()
  const { updateAppStore } = useAppStore()

  const handleSubmit = async (values: UserInfo): Promise<void> => {
    try {
      const updated = await updateProfile(values)
      /* istanbul ignore else */ if (updated) {
        onSubmit()
        updateAppStore({ currentUserInfo: updated.data })
        showSuccess(getString('userProfile.userEditSuccess'))
      } /* istanbul ignore next */ else {
        showError(getString('userProfile.userEditFail'))
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge', top: 'huge', bottom: 'xlarge' }}>
      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }}>
          {getString('userProfile.editProfile')}
        </Text>
        <Formik<UserInfo>
          initialValues={{
            ...user
          }}
          formName="editUserForm"
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('validation.nameRequired'))
          })}
          onSubmit={values => {
            handleSubmit(values)
          }}
        >
          {() => {
            return (
              <Form>
                <Container width={300}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <FormInput.Text name="name" label={getString('name')} />
                </Container>
                <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('save')}
                    type="submit"
                    disabled={loading}
                  />
                  <Button text={getString('cancel')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default EditUserProfile
