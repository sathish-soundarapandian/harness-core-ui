import React from 'react'
import cx from 'classnames'
import { NavLink as Link, NavLinkProps } from 'react-router-dom'
import { Text, Icon, Layout, useToggleOpen } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import css from './SideNav.module.scss'

const commonLinkProps: Partial<NavLinkProps> = {
  activeClassName: css.active,
  className: cx(css.navLink)
}

interface SideNavProps {
  resultCode: string
  majorVersion?: number
  minorVersion?: number
}

export default function SideNav(props: SideNavProps): JSX.Element {
  const { resultCode, majorVersion = 0, minorVersion = 0 } = props
  const { isOpen: isModuleListOpen } = useToggleOpen(false)
  const { getString } = useStrings()

  return (
    <nav className={cx(css.main, { [css.recessed]: isModuleListOpen })}>
      <ul className={css.navList}>
        <li className={css.navItem}>
          <Link {...commonLinkProps} to={`/assessment/results/${resultCode}`}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
              <Icon name={'harness'} size={30} />
              <Text
                font={{ weight: 'semi-bold', align: 'center' }}
                padding={{ bottom: 'xsmall' }}
                color={Color.WHITE}
                className={css.text}
              >
                <String stringID={'common.home'} />
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
        <li className={css.navItem}>
          <Link {...commonLinkProps} to={`/assessment/survey/${resultCode}`}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
              <Icon name={'environments-outline'} size={30} />
              <Text
                font={{ weight: 'semi-bold', align: 'center' }}
                padding={{ bottom: 'xsmall' }}
                color={Color.WHITE}
                className={css.text}
              >
                {getString('assessments.survey')}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
      </ul>
      <Text className={css.versionText} margin={{ bottom: 'xlarge', left: 'medium' }}>{`${getString(
        'version'
      )}: ${majorVersion}.${minorVersion}`}</Text>
    </nav>
  )
}
