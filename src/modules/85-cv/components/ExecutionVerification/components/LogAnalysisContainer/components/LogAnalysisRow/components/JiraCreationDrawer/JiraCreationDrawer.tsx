import React, { useCallback, useState } from 'react'
import cx from 'classnames'
import { Drawer } from '@blueprintjs/core'
import { Button, Container, Heading, Icon, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { LogAnalysisRowData } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import { useStrings } from 'framework/strings'
import { DrawerProps } from '../LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer.constants'
import JiraCreationForm from './components/JiraCreationForm'
import { JiraViewDetails } from './components/JiraViewDetails'
import { getJiraDrawerButtonTitle } from './JiraCreationDrawer.utils'
import style from '../LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer.module.scss'
import css from './JiraCreationDrawer.module.scss'

interface JiraCreationDrawerProps {
  rowData: LogAnalysisRowData
  onHide: (isCallAPI?: boolean, clusterId?: string) => void
}

export function JiraCreationDrawer({ onHide, rowData }: JiraCreationDrawerProps): JSX.Element {
  const [isOpen, setOpen] = useState(true)

  const { getString } = useStrings()

  const { feedback } = rowData

  const onHideCallback = useCallback(
    (isCallAPI?: boolean) => {
      setOpen(false)
      onHide(isCallAPI)
    },

    [onHide]
  )

  const getTitle = (): string => {
    return getJiraDrawerButtonTitle(getString, feedback?.ticket?.id)
  }

  const getMainJiraContent = (): JSX.Element => {
    if (feedback?.ticket?.id) {
      return <JiraViewDetails feedback={feedback} onHideCallback={onHideCallback} />
    }

    return <JiraCreationForm feedback={feedback} onHideCallback={onHideCallback} />
  }

  const getDrawerContent = (): JSX.Element => {
    return (
      <>
        <Container style={{ overflow: 'scroll' }} data-testid="jiraDrawer-Container">
          <Layout.Horizontal
            spacing="small"
            className={css.jiraDrawerHeading}
            padding="medium"
            border={{ bottom: true }}
            data-testid="jiraDrawer"
          >
            <Icon margin={{ right: 'small' }} name="service-jira" size={32} />
            <Heading level={2} font={{ variation: FontVariation.H4 }}>
              {getTitle()}
            </Heading>
          </Layout.Horizontal>

          <Container padding="large">{getMainJiraContent()}</Container>
        </Container>
      </>
    )
  }

  return (
    <>
      <Drawer {...DrawerProps} size="700px" isOpen={isOpen} onClose={() => onHideCallback()} className={style.main}>
        {getDrawerContent()}
      </Drawer>
      <Button
        data-testid="jiraDrawerClose_button_top"
        minimal
        className={cx(style.almostFullScreenCloseBtn, css.jiraDrawerCloseBtn)}
        icon="cross"
        withoutBoxShadow
        onClick={() => onHideCallback()}
      />
    </>
  )
}
