import { Container, Icon, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import css from './TopNav.module.scss'

const TopNav = (): JSX.Element => {
  const history = useHistory()
  const { getString } = useStrings()

  const handleClick = (): void => {
    history.push('/assessment')
  }

  return (
    <Container className={css.topNav} background={Color.PRIMARY_10} flex>
      <Container
        flex={{ justifyContent: 'flex-start' }}
        padding={{ left: 'xxxlarge' }}
        className={css.leftNav}
        onClick={handleClick}
      >
        <Icon size={128} name="harness-logo-white" padding={{ right: 'small' }} />
        <Text color={Color.WHITE} font={{ size: 'medium' }} padding={{ top: 'xsmall' }}>
          {getString('assessments.developerEffectiveness')}
        </Text>
      </Container>
    </Container>
  )
}

export default TopNav
