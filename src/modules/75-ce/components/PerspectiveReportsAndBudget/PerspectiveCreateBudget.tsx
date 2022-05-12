/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { Container, Button, StepWizard } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import type { Budget } from 'services/ce'
import { useStrings } from 'framework/strings'

import SetBudgetAmount from './CreateBudgetSteps/SetBudgetAmount'
import ConfigureAlerts from './CreateBudgetSteps/ConfigureAlerts'
import SelectPerspective from './CreateBudgetSteps/SelectPerspective'
import css from './PerspectiveCreateBudget.module.scss'

interface OpenModalArgs {
  isEdit?: boolean
  selectedBudget: Budget
  perspectiveName?: string
  perspective?: string
  source?: string
}

interface BudgetModalProps {
  onSuccess: () => void
  onError?: () => void
}

const useBudgetModal = ({ onSuccess }: BudgetModalProps) => {
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [perspectiveInfo, setPerspectiveInfo] = useState<any>()
  const [budget, setBudget] = useState<Budget>()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const [initiatorPage, setInitiatorPage] = useState('')

  const modalPropsLight: IDialogProps = {
    isOpen: true,
    autoFocus: true,
    enforceFocus: false,
    canOutsideClickClose: false,
    className: cx(Classes.DIALOG, css.dialog),
    style: {
      minWidth: 1175,
      minHeight: 640,
      paddingBottom: 0
    }
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalPropsLight}>
        <Container>
          <StepWizard
            icon={'vertical-bar-chart-asc'}
            iconProps={{ size: 40, color: Color.WHITE }}
            title={
              isEditMode
                ? getString('ce.perspectives.budgets.wizardTitleEdit')
                : getString('ce.perspectives.budgets.wizardTitle')
            }
          >
            <SelectPerspective
              perspective={perspectiveInfo?.id}
              name={getString('ce.perspectives.budgets.defineTarget.title')}
              isEditMode={isEditMode}
              budget={budget}
              initiatorPage={initiatorPage}
            />
            <SetBudgetAmount
              name={getString('ce.perspectives.budgets.setBudgetAmount.title')}
              budget={budget}
              isEditMode={isEditMode}
              initiatorPage={initiatorPage}
            />
            <ConfigureAlerts
              isEditMode={isEditMode}
              viewId={perspectiveId}
              name={getString('ce.perspectives.budgets.configureAlerts.title')}
              accountId={accountId}
              budget={budget}
              onSuccess={onSuccess}
              initiatorPage={initiatorPage}
            />
          </StepWizard>
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [perspectiveInfo?.name, budget, isEditMode]
  )

  return {
    hideModal,
    openModal: (args?: OpenModalArgs) => {
      const { isEdit, selectedBudget, perspectiveName, perspective, source = '' } = args || {}
      setIsEditMode(!!isEdit)
      setBudget(selectedBudget)
      setPerspectiveInfo({
        name: perspectiveName,
        id: perspective
      })
      setInitiatorPage(source)
      openModal()
    }
  }
}

export default useBudgetModal
