/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import cx from 'classnames'
import { Container, Heading, Icon, Text, IconName, Popover } from '@harness/uicore'
import { NavLink } from 'react-router-dom'
import i18n from './AdminSelector.i18n'
import css from './AdminSelector.module.scss'

export interface AdminSelectorProps {
  selected?: boolean
  path: string
}

export const AdminSelector: React.FC<AdminSelectorProps> = ({ children, path }) => {
  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.RIGHT}
      modifiers={{ offset: { offset: -50 } }}
      minimal
      portalClassName={css.portal}
      fill={true}
    >
      <NavLink className={css.adminLink} activeClassName={css.active} to={path} onClick={e => e.preventDefault()}>
        {i18n.admin}
      </NavLink>
      <Container width={300} padding="medium">
        <Heading level={2} font={{ weight: 'semi-bold' }} padding="small" margin={{ bottom: 'large' }}>
          {i18n.adminSelector}
        </Heading>
        <Container className={cx(css.grid, Classes.POPOVER_DISMISS)}>{children}</Container>
      </Container>
    </Popover>
  )
}

export interface AdminSelectorLinkProps {
  to: string
  label: string
  iconName: IconName
  disabled?: boolean
}

export const AdminSelectorLink: React.FC<AdminSelectorLinkProps> = ({ to, label, iconName, disabled }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    if (disabled) e.preventDefault()

    // POPOVER_DISMISS does not work with <Link />, so we trigger click on parent
    // https://github.com/palantir/blueprint/issues/2820
    const { parentElement } = e.target as HTMLAnchorElement
    parentElement?.click()
  }

  return (
    <span className={Classes.POPOVER_DISMISS}>
      <NavLink className={css.link} to={to} onClick={handleLinkClick}>
        <Icon name={iconName} size={24} className={css.linkIcon} />
        <Text inline style={{ paddingTop: 'var(--spacing-medium)' }} className={css.text}>
          {label}
        </Text>
      </NavLink>
    </span>
  )
}
