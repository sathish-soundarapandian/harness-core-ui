/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { Classes, Dialog } from '@blueprintjs/core'
import { Button, StepWizard } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import React, { useState, useCallback } from 'react'
import cx from 'classnames'
import type { Organization } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import StepAboutOrganization from './views/StepAboutOrganization'
import EditOrganization from './views/EditOrganization'
import { OrgCollaboratorsStep } from '../ProjectModal/views/Collaborators'
import css from './useOrganizationModal.module.scss'

export interface UseOrganizationModalArgs {
  onSuccess: () => void
}

export interface UseOrganizationModalResult {
  openOrganizationModal: (org?: Organization) => void
  closeOrganizationModal: () => void
}

const Views = { CREATE: 1, EDIT: 2 }

export const useOrganizationModal = ({ onSuccess }: UseOrganizationModalArgs): UseOrganizationModalResult => {
  const [view, setView] = useState(Views.CREATE)
  const { getString } = useStrings()
  const [orgData, setOrgData] = useState<Organization>()
  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG, {
          [css.create]: view === Views.CREATE,
          [css.edit]: view === Views.EDIT
        })}
      >
        {view === Views.CREATE ? (
          <StepWizard<Organization> stepClassName={css.stepClass} onCompleteWizard={hideModal}>
            <StepAboutOrganization name={getString('projectsOrgs.aboutTitle')} onSuccess={onSuccess} />
            <OrgCollaboratorsStep name={getString('projectsOrgs.collaboratorsTitle')} />
          </StepWizard>
        ) : null}
        {view === Views.EDIT ? (
          <EditOrganization
            name={getString('projectsOrgs.aboutTitle')}
            onSuccess={() => {
              hideModal()
              onSuccess()
            }}
            identifier={orgData?.identifier}
          />
        ) : null}
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setView(Views.CREATE)
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [view, orgData]
  )
  const open = useCallback(
    (_org?: Organization) => {
      if (_org) {
        setOrgData(_org)
        setView(Views.EDIT)
      } else setView(Views.CREATE)
      openModal()
    },
    [openModal]
  )

  return {
    openOrganizationModal: (org?: Organization) => {
      open(org)
    },
    closeOrganizationModal: hideModal
  }
}
