/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StepProps, SelectOption, ModalErrorHandlerBinding, useToaster } from '@harness/uicore'
import { pick } from 'lodash-es'
import { useGetOrganizationList, usePostProject } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import { useQueryParams } from '@common/hooks'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, ProjectActions } from '@common/constants/TrackingConstants'
import ProjectForm from './ProjectForm'

interface CreateModalData {
  modules?: Project['modules']
}

const CreateProject: React.FC<StepProps<Project> & CreateModalData> = props => {
  const { accountId, orgIdentifier: orgIdPathParam } = useParams<OrgPathProps>()
  const { orgIdentifier: orgIdQueryParam } = useQueryParams<OrgPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const orgIdentifier = orgIdPathParam || orgIdQueryParam
  const { nextStep, modules } = props
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const { trackEvent } = useTelemetry()
  const { mutate: createProject, loading: saving } = usePostProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    }
  })
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { data: orgData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId,
      pageSize: 200
    }
  })

  let defaultOrg = ''
  const organizations: SelectOption[] =
    orgData?.data?.content?.map(org => {
      if (org.harnessManaged) defaultOrg = org.organization.identifier
      return {
        label: org.organization.name,
        value: org.organization.identifier
      }
    }) || []

  const onComplete = async (values: Project): Promise<void> => {
    const dataToSubmit: Project = pick<Project, keyof Project>(values, [
      'name',
      'orgIdentifier',
      'color',
      'description',
      'identifier',
      'tags'
    ])
    ;(dataToSubmit as Project)['modules'] = values.modules || []

    try {
      await createProject(
        { project: dataToSubmit },
        {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: values?.orgIdentifier || /* istanbul ignore next */ ''
          }
        }
      )
      nextStep?.(dataToSubmit)
      showSuccess(getString('projectsOrgs.projectCreateSuccess'))
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }

  useEffect(() => {
    trackEvent(ProjectActions.OpenCreateProjectModal, {
      category: Category.PROJECT
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ProjectForm
        disableSelect={false}
        enableEdit={true}
        disableSubmit={saving}
        initialOrgIdentifier={orgIdentifier || defaultOrg}
        initialModules={modules}
        organizationItems={organizations}
        title={getString('projectsOrgs.aboutProject')}
        saveTitle={getString('saveAndContinue')}
        saveIcon="chevron-right"
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {saving ? <PageSpinner message={getString('projectsOrgs.createProjectLoader')} /> : null}
    </>
  )
}

export default CreateProject
