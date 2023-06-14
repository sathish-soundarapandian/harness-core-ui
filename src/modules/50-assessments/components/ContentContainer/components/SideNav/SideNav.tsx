import React from 'react'
import cx from 'classnames'
import { NavLink as Link, NavLinkProps } from 'react-router-dom'
import { Text, Icon, Layout, useToggleOpen } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import StarImage from '@assessments/assets/Star.svg'
import css from './SideNav.module.scss'

const commonLinkProps: Partial<NavLinkProps> = {
  activeClassName: css.active,
  className: cx(css.navLink)
}

interface SideNavProps {
  resultCode: string
}

export default function SideNav(props: SideNavProps): JSX.Element {
  const { resultCode } = props
  const { isOpen: isModuleListOpen } = useToggleOpen(false)
  const { getString } = useStrings()

  return (
    <nav className={cx(css.main, { [css.recessed]: isModuleListOpen })}>
      <ul className={css.navList}>
        <li className={css.navItem}>
          <Link {...commonLinkProps} to={`/assessment/home/${resultCode}`}>
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
          <Link {...commonLinkProps} to={`/assessment/results/${resultCode}`}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
              <Icon name={'environments-outline'} size={30} />
              <Text
                font={{ weight: 'semi-bold', align: 'center' }}
                padding={{ bottom: 'xsmall' }}
                color={Color.WHITE}
                className={css.text}
              >
                {getString('common.results')}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
        <li className={css.navItem}>
          <Link {...commonLinkProps} to={`/assessment/improve-maturity/${resultCode}`}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
              <img src={StarImage} width="22" height="22" alt="" />
              <Text
                font={{ weight: 'semi-bold', align: 'center' }}
                padding={{ bottom: 'xsmall' }}
                color={Color.WHITE}
                className={css.text}
              >
                {getString('assessments.improveMaturity')}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
