/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, ModalErrorHandlerBinding } from '@harness/uicore'
import { pick } from 'lodash-es'
import { useCreateOrganizationMutation, Organization as OrganizationQuery } from '@harnessio/react-ng-manager-client'
import type { Organization } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useToaster, PageSpinner } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import OrganizationForm from './OrganizationForm'
import type { OrgModalData } from './StepAboutOrganization'

const CreateOrganization: React.FC<StepProps<Organization> & OrgModalData> = props => {
  const { nextStep, onSuccess } = props
  const { getRBACErrorMessage } = useRBACError()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const { mutate: createOrganization, isLoading: loading } = useCreateOrganizationMutation({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onComplete = async (values: Organization): Promise<void> => {
    const dataToSubmit: OrganizationQuery = {
      ...pick(values, ['name', 'identifier', 'description', 'tags'])
    }
    try {
      createOrganization({
        body: { org: dataToSubmit }
      })
      nextStep?.(values)
      showSuccess(getString('projectsOrgs.orgCreateSuccess'))
      onSuccess?.(values)
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <>
      <OrganizationForm
        title={getString('projectsOrgs.aboutTitle')}
        enableEdit={true}
        disableSubmit={false}
        submitTitle={getString('saveAndContinue')}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {loading ? <PageSpinner message={getString('projectsOrgs.createOrgLoader')} /> : null}
    </>
  )
}

export default CreateOrganization
