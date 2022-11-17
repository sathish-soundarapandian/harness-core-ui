/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StepProps, ModalErrorHandlerBinding, useToaster } from '@harness/uicore'
import { pick } from 'lodash-es'
import { Organization, useGetOrganization, usePutOrganization } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import OrganizationForm from './OrganizationForm'

interface EditModalData {
  identifier?: string
  closeModal?: () => void
  onSuccess?: (Organization: Organization | undefined) => void
  isStep?: boolean
}

const EditOrganization: React.FC<StepProps<Organization> & EditModalData> = props => {
  const { prevStepData, nextStep, onSuccess, identifier, isStep } = props
  const { getRBACErrorMessage } = useRBACError()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const [version, setVersion] = useState<string>()
  const { getString } = useStrings()
  const orgIdentifier = isStep ? prevStepData?.identifier : identifier

  const { mutate: editOrganization, loading: saving } = usePutOrganization({
    identifier: orgIdentifier || '',
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: { 'If-Match': version as string }
    }
  })
  const { data, loading, error, response } = useGetOrganization({
    identifier: orgIdentifier || '',
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    /* istanbul ignore else */ if (!loading && !error) {
      setVersion(response?.headers.get('etag') as string)
    }
  }, [error, loading])

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const onComplete = async (values: Organization): Promise<void> => {
    const dataToSubmit: Organization = pick<Organization, keyof Organization>(values, [
      'name',
      'description',
      'identifier',
      'tags'
    ])
    try {
      await editOrganization(
        { organization: dataToSubmit },
        {
          queryParams: {
            accountIdentifier: accountId
          }
        }
      )
      nextStep?.(values)
      showSuccess(getString('projectsOrgs.orgEditSuccess'))
      onSuccess?.(values)
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <>
      <OrganizationForm
        data={data?.data?.organization}
        title={getString('projectsOrgs.editTitle')}
        enableEdit={false}
        submitTitle={isStep ? getString('saveAndContinue') : getString('projectsOrgs.saveAndClose')}
        disableSubmit={saving}
        disablePreview={!isStep}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {loading ? <PageSpinner /> : null}
    </>
  )
}

export default EditOrganization
