import React from 'react'
import { Button, ButtonVariation, Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import css from './IntroBox.module.scss'

interface IntroBoxProps {
  onOpenPrompt: () => void
}
const IntroBox: React.FC<IntroBoxProps> = ({ onOpenPrompt }) => {
  return (
    <div className={css.introBox}>
      <Button className={css.button} icon="cross" minimal />
      <Layout.Vertical spacing={'small'}>
        <Heading level={4} color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
          Your next New Dashboard is a few words away from you!
        </Heading>
        <Text font={{ variation: FontVariation.BODY1 }}>
          Just explain in a few words what you want to monitor and leave the rest to us!
        </Text>
        <div>
          <Button
            variation={ButtonVariation.PRIMARY}
            className={css.createButton}
            onClick={() => onOpenPrompt()}
            text={'Create A New Dashboard'}
          />
        </div>
      </Layout.Vertical>
    </div>
  )
}

export default IntroBox
