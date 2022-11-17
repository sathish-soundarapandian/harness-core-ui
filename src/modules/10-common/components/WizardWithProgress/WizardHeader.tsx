/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Icon } from '@harness/uicore'
import step from './Icons/Step.svg'
import { Status } from './WizardHelper'
import inprogress from './Icons/InProgressStep.svg'

import css from './StepWizard.module.scss'

export interface PanelInterface {
  id: string
  tabTitle?: string
  tabTitleComponent?: JSX.Element
  status?: string
}

interface WizardHeaderInterface {
  panels: PanelInterface[]
  onClick: any
}

const getClassName = (status: string | undefined) => {
  switch (status) {
    case Status.INPROGRESS:
      return css.inprogress
    default:
      return ''
  }
}

const getSeparator = (status: string | undefined) => {
  switch (status) {
    case Status.INPROGRESS:
      return css.progressSeparator
    case Status.COMPLETED:
      return css.completedSeparator
    default:
      return ''
  }
}

const getIconClass = (status: string | undefined) => {
  switch (status) {
    case Status.INPROGRESS:
      return inprogress
    case Status.TODO:
      return step
    default:
      break
  }
}

const WizardHeader: React.FC<WizardHeaderInterface> = (props: WizardHeaderInterface) => {
  const { panels } = props
  const panelLength = panels.length

  return (
    <Container className={css.headerContainer}>
      {panels.map((panel: PanelInterface, index: number) => {
        const titleClass = index === panelLength - 1 ? css.lastElementHeader : getClassName(panel?.status)
        const separatorClass = getSeparator(panel?.status)
        const icon = getIconClass(panel?.status)
        const lastElementCls = index === panelLength - 1 ? css.lastElement : ''
        const wizardHeaderCls = index === panelLength - 1 ? css.lastHeader : ''
        return (
          <>
            {index === 0 && <div style={{ flexGrow: 2 }}></div>}
            <Container
              className={`${css.headerContent} ${wizardHeaderCls}`}
              onClick={() => {
                props.onClick(panel.id, index)
              }}
            >
              <div className={`${css.headerSeparator} ${lastElementCls}`}>
                {panel?.status !== Status.COMPLETED && <img src={icon} alt="" aria-hidden width="15" />}
                {panel?.status === Status.COMPLETED && <Icon name="deployment-success-legacy" />}
                {index !== panelLength - 1 && <hr className={`${css.headerSeparator} ${separatorClass}`} />}
              </div>
              <Text
                font={{ size: 'normal', align: 'center' }}
                className={`${css.headerTitle} ${titleClass} `}
                onClick={props.onClick}
              >
                {panel.tabTitle}
              </Text>
            </Container>
            {index === panelLength - 1 && <div style={{ flexGrow: 2 }}></div>}
          </>
        )
      })}
    </Container>
  )
}

export default WizardHeader
