/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StepProps, SelectOption, ModalErrorHandlerBinding, useToaster } from '@wings-software/uicore'
import { useGetOrganization, useGetProject, usePutProject } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import ProjectForm from './ProjectForm'

interface EditModalData {
  identifier?: string
  orgIdentifier?: string
  closeModal?: () => void
  isStep?: boolean
}

const EditProject: React.FC<StepProps<Project> & EditModalData> = props => {
  const { prevStepData, nextStep, identifier, orgIdentifier, closeModal, isStep } = props
  const [version, setVersion] = useState<string>()
  const { accountId } = useParams<AccountPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { updateAppStore, selectedProject } = useAppStore()
  const projectIdentifier = isStep ? prevStepData?.identifier : identifier
  const organizationIdentifier = isStep ? prevStepData?.orgIdentifier : orgIdentifier

  const {
    data: projectData,
    loading,
    response,
    error
  } = useGetProject({
    identifier: projectIdentifier || /* istanbul ignore next */ '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: organizationIdentifier || /* istanbul ignore next */ ''
    }
  })

  const { data: orgData } = useGetOrganization({
    identifier: organizationIdentifier || /* istanbul ignore next */ '',
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: updateProject, loading: saving } = usePutProject({
    identifier: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    },
    requestOptions: {
      headers: { 'If-Match': version as string }
    }
  })

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  useEffect(() => {
    /* istanbul ignore else */ if (!loading && !error) {
      setVersion(response?.headers.get('etag') as string)
    }
  }, [error, loading])

  const organizations: SelectOption[] = [
    {
      label: orgData?.data?.organization.name || /* istanbul ignore next */ '',
      value: orgData?.data?.organization.identifier || /* istanbul ignore next */ ''
    }
  ]

  const onComplete = async (values: Project): Promise<void> => {
    try {
      const updateProjectResponse = await updateProject(
        { project: values },
        {
          pathParams: { identifier: values.identifier },
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: values.orgIdentifier
          }
        }
      )
      const updatedProject = updateProjectResponse?.data?.project
      if (updatedProject?.identifier === selectedProject?.identifier) {
        updateAppStore({ selectedProject: updatedProject })
      }
      showSuccess(getString('projectsOrgs.projectEditSuccess'))
      isStep ? nextStep?.({ ...values }) : closeModal?.()
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }

  return (
    <>
      <ProjectForm
        data={projectData?.data?.project}
        disableSelect={true}
        enableEdit={false}
        disableSubmit={saving}
        initialOrgIdentifier={
          projectData?.data?.project.orgIdentifier || orgIdentifier || /* istanbul ignore next */ ''
        }
        organizationItems={organizations}
        title={getString('projectsOrgs.projectEdit')}
        saveTitle={getString('save')}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
        displayProjectCardPreview={isStep ? true : false}
      />
      {loading && !projectData ? <PageSpinner /> : null}
    </>
  )
}

export default EditProject
