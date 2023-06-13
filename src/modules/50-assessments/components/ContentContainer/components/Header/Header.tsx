import React, { useState } from 'react'
import { Position, PopoverInteractionKind, Menu } from '@blueprintjs/core'
import { Button, ButtonVariation, Container, Layout, Popover, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import ShowPasswordImage from '@assessments/assets/ShowPassword.svg'
import FileImage from '@assessments/assets/File.svg'
import InviteModal from './components/InviteModal/InviteModal'
import ShareResultModal from './components/ShareResultModal/ShareResultModal'
import css from './Header.module.scss'

interface HeaderProps {
  assessmentId: string
  title: string
  backButton?: React.ReactNode
}

const Header = (props: HeaderProps): JSX.Element => {
  const { assessmentId, title, backButton } = props
  const { getString } = useStrings()
  const [isShareResultsModalOpen, setIsShareResultsModalOpen] = useState<boolean>(false)
  const [isInviteAssessmentModalOpen, setIsInviteAssessmentModalOpen] = useState<boolean>(false)

  const dropdownItemRenderer = (value: string): JSX.Element => {
    const iconImage = value === 'inviteToTakeAssessment' ? FileImage : ShowPasswordImage

    return (
      <div className={css.menuItem}>
        <img src={iconImage} width="20" height="20" alt="" />
        <Text color={Color.GREY_900} margin={{ left: 'small' }}>
          {getString(`assessments.${value}` as StringKeys)}
        </Text>
      </div>
    )
  }
  const getPopoverContent = (): JSX.Element => {
    return (
      <Menu>
        <Menu.Item
          text={dropdownItemRenderer('shareResults')}
          onClick={() => setIsShareResultsModalOpen(!isShareResultsModalOpen)}
        />
        <Menu.Item
          text={dropdownItemRenderer('inviteToTakeAssessment')}
          onClick={() => setIsInviteAssessmentModalOpen(!isShareResultsModalOpen)}
        />
      </Menu>
    )
  }

  return (
    <Container className={css.topHeader} flex={{ justifyContent: 'space-between' }}>
      <Layout.Vertical>
        {backButton}
        <Text padding={{ left: 'medium' }} font={{ variation: FontVariation.H3 }} color={Color.GREY_700}>
          {title}
        </Text>
      </Layout.Vertical>
      <Popover
        minimal
        position={Position.BOTTOM}
        interactionKind={PopoverInteractionKind.CLICK}
        content={getPopoverContent()}
      >
        <Button
          icon="command-email"
          rightIcon="chevron-down"
          variation={ButtonVariation.SECONDARY}
          text={getString('common.invite')}
        />
      </Popover>
      <InviteModal
        isOpen={isInviteAssessmentModalOpen}
        setOpen={setIsInviteAssessmentModalOpen}
        assessmentId={assessmentId}
      />
      <ShareResultModal isOpen={isShareResultsModalOpen} setOpen={setIsShareResultsModalOpen} />
    </Container>
  )
}

export default Header
