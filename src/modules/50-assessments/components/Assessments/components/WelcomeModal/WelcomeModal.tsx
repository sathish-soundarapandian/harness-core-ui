import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, ModalDialog, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import AssessmentWelcomeImage from '@assessments/assets/AssessmentWelcome.svg'
import { DialogProps } from './WelcomeModal.constants'
import css from './WelcomeModal.module.scss'

interface WelcomeModalProps {
  isOpen: boolean
  closeModal: () => void
}

const WelcomeModal = (props: WelcomeModalProps): JSX.Element => {
  const { isOpen, closeModal } = props
  const { getString } = useStrings()

  return (
    <ModalDialog {...DialogProps} isOpen={isOpen}>
      <Container flex={{ justifyContent: 'space-between' }}>
        <Container width="390px" className={css.leftContainer}>
          <div>
            <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xlarge', top: 'xlarge' }}>
              {getString('assessments.softwareDeliveryMaturityModel')}
            </Text>
            <Text>{getString('assessments.welcomeDescription')}</Text>
          </div>
          <Button
            rightIcon="arrow-right"
            variation={ButtonVariation.PRIMARY}
            text="Get Started"
            intent="success"
            size={ButtonSize.LARGE}
            width="200px"
            onClick={closeModal}
          />
        </Container>
        <img src={AssessmentWelcomeImage} width="540" height="495" alt="" />
      </Container>
    </ModalDialog>
  )
}

export default WelcomeModal
