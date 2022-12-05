/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import cx from 'classnames'
import { NavLink as Link, NavLinkProps } from 'react-router-dom'
import { Text, Layout, IconName, Icon, Container, TextProps } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './SideNav.module.scss'

export interface SideNavProps {
  subtitle?: string
  title?: string
  icon?: IconName
}

export default function SideNav(props: React.PropsWithChildren<SideNavProps>): ReactElement {
  return (
    <div className={css.main}>
      <div>{props.children}</div>
      <Container className={css.bottomContainer}>
        {props.icon ? (
          <div className={css.iconContainer}>
            <Icon className={css.icon} name={props.icon} size={350} />
          </div>
        ) : null}
        <div className={css.titleContainer}>
          <Layout.Vertical>
            {props.subtitle ? <Text className={css.subTitle}>{props.subtitle}</Text> : null}
            {props.title ? (
              <Text color={Color.WHITE} className={css.title}>
                {props.title}
              </Text>
            ) : null}
          </Layout.Vertical>
        </div>
      </Container>
    </div>
  )
}

interface SidebarLinkProps extends NavLinkProps {
  label: string
  icon?: IconName
  className?: string
  textProps?: TextProps
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ label, icon, className, textProps, ...others }) => (
  <Link className={cx(css.link, className)} activeClassName={css.selected} {...others}>
    <Text icon={icon} className={css.text} {...textProps}>
      {label}
    </Text>
  </Link>
)
