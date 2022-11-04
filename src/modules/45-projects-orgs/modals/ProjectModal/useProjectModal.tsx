/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { StepWizard, Button } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ExitModalActions, Category } from '@common/constants/TrackingConstants'
import { useModuleSelectModal } from '../ModuleSelect/useModuleSelect'
import { Views } from './Constants'
import { ProjectCollaboratorsStep } from './views/Collaborators'
import StepAboutProject from './views/StepAboutProject'
import EditProject from './views/EditProject'
import css from './useProjectModal.module.scss'

export interface UseProjectModalProps {
  onSuccess?: (projectData?: Project) => void
  onCloseModal?: () => void
  onWizardComplete?: (projectData?: Project) => void
  module?: ModuleName
}

export interface UseProjectModalReturn {
  openProjectModal: (project?: Project) => void
  closeProjectModal: () => void
}

export const useProjectModal = ({
  onSuccess,
  onCloseModal,
  onWizardComplete
}: UseProjectModalProps): UseProjectModalReturn => {
  const [view, setView] = useState(Views.CREATE)
  const [projectData, setProjectData] = useState<Project>()
  const [refreshProjects, setRefreshProjects] = useState(false)
  const { getString } = useStrings()

  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: view === Views.CREATE ? 1100 : 500,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }
  const { module } = useModuleInfo()
  const { openModuleSelectModal } = useModuleSelectModal({
    onSuccess: () => onWizardComplete?.(projectData),
    onCloseModal: () => onWizardComplete?.(projectData)
  })
  const wizardCompleteHandler = async (wizardData: Project | undefined): Promise<void> => {
    if (!wizardData) {
      setProjectData(wizardData)
    }
    if (wizardData && !module) {
      openModuleSelectModal(wizardData)
    } else {
      onWizardComplete?.(wizardData)
    }
  }
  const { trackEvent } = useTelemetry()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          if (refreshProjects) {
            onSuccess?.(projectData)
            setRefreshProjects(false)
          }
          onCloseModal?.()
          setView(Views.CREATE)
          hideModal()
        }}
        {...modalProps}
      >
        {view === Views.CREATE ? (
          <StepWizard<Project>
            icon="projects-wizard"
            iconProps={{ size: 30, padding: { bottom: 'xxlarge' } }}
            onCompleteWizard={wizardCompleteHandler}
            onStepChange={() => {
              if (!refreshProjects) {
                setRefreshProjects(true)
              }
            }}
            stepClassName={css.stepClass}
          >
            <StepAboutProject name={getString('projectsOrgs.aboutProject')} modules={projectData?.modules} />
            <ProjectCollaboratorsStep name={getString('projectsOrgs.invite')} subTitle={getString('titleOptional')} />
          </StepWizard>
        ) : null}

        {view === Views.EDIT ? (
          <EditProject
            identifier={projectData?.identifier}
            orgIdentifier={projectData?.orgIdentifier}
            closeModal={() => {
              hideModal()
              onSuccess?.(projectData)
            }}
          />
        ) : null}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            if (refreshProjects) {
              onSuccess?.(projectData)
              setRefreshProjects(false)
            }
            onCloseModal?.()
            setView(Views.CREATE)
            trackEvent(ExitModalActions.ExitByClose, { category: Category.PROJECT })
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [view, projectData, refreshProjects]
  )

  const open = useCallback(
    (_project?: Project) => {
      setProjectData(_project)
      const isNew = !_project || !_project.identifier
      if (!isNew) {
        setView(Views.EDIT)
      } else setView(Views.CREATE)
      showModal()
    },
    [showModal]
  )

  return {
    openProjectModal: (project?: Project) => open(project),
    closeProjectModal: hideModal
  }
}
