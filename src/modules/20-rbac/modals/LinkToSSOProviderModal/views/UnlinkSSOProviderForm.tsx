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
  Text,
  FormInput,
  ButtonVariation,
  shouldShowError
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useToaster } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { UserGroupDTO, useUnlinkSsoGroup } from 'services/cd-ng'
import css from '../useLinkToSSOProviderModal.module.scss'

interface UnlinkSSOProviderModalData {
  userGroupData: UserGroupDTO
  onSubmit?: () => void
}

export interface UnlinkSSOProviderFormData {
  retainMembers: boolean
}

const UnlinkSSOProviderForm: React.FC<UnlinkSSOProviderModalData> = props => {
  const { onSubmit, userGroupData } = props
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [retainMembers, setRetainMembers] = useState(false)

  const { mutate: unlinkSsoGroup, loading } = useUnlinkSsoGroup({
    userGroupId: userGroupData.identifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      retainMembers: retainMembers
    }
  })

  const handleOnSubmit = async (): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      const created = await unlinkSsoGroup({ headers: { 'content-type': 'application/json' } } as any)
      if (created) {
        showSuccess(getString('rbac.userGroupPage.unlinkSuccessMessage', { name: userGroupData.ssoGroupName }))
        onSubmit?.()
      }
    } /* istanbul ignore next */ catch (err) {
      if (shouldShowError(err)) {
        modalErrorHandler?.showDanger(getRBACErrorMessage(err))
      }
    }
  }

  return (
    <Layout.Vertical padding="xlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('rbac.userDetails.linkToSSOProviderModal.delinkLabel')}
        </Text>
        <Formik<UnlinkSSOProviderFormData>
          formName="UnlinkSSOProviderForm"
          initialValues={{ retainMembers: false }}
          onSubmit={() => {
            handleOnSubmit()
          }}
        >
          {() => {
            return (
              <Form>
                <Container margin={{ bottom: 'medium' }}>
                  <Container padding={{ bottom: 'medium' }}>
                    <ModalErrorHandler bind={setModalErrorHandler} />
                  </Container>
                  <Layout.Vertical spacing="medium">
                    <Text font={{ weight: 'semi-bold' }}>
                      {getString('rbac.userDetails.linkToSSOProviderModal.delinkText', {
                        name: userGroupData.name,
                        ssoName: userGroupData.linkedSsoDisplayName
                      })}
                    </Text>
                    <FormInput.CheckBox
                      disabled={loading}
                      className={css.checkbox}
                      name="retainMembers"
                      label={getString('rbac.userDetails.linkToSSOProviderModal.retainMembersLabel')}
                      onChange={e => {
                        setRetainMembers(e.currentTarget.checked)
                      }}
                    />
                  </Layout.Vertical>
                </Container>
                <Layout.Horizontal>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    data-testid="submitLinkSSOProvider"
                    text={getString('save')}
                    type="submit"
                    disabled={loading}
                  />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default UnlinkSSOProviderForm
