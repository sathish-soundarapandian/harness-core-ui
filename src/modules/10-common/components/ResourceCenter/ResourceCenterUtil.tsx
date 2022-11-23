/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import css from './ResourceCenter.module.scss'

export const getButton = (
  buttonText: string,
  buttonIcon: IconName,
  link: string,
  iconClassName?: string
): JSX.Element => {
  return (
    <a href={link} rel="noreferrer" target="_blank">
      <Layout.Vertical
        flex={{ align: 'center-center' }}
        spacing="small"
        padding={'small'}
        className={cx(css.bottombutton)}
      >
        <Icon name={buttonIcon} size={24} color={Color.WHITE} className={iconClassName} padding={'small'} />
        <Text
          font={{ variation: FontVariation.BODY2 }}
          padding={{ bottom: 'xsmall' }}
          color={Color.PRIMARY_3}
          className={css.txtAlignCenter}
        >
          {buttonText}
        </Text>
      </Layout.Vertical>
    </a>
  )
}

export const getMenuItems = ({
  title,
  description,
  onClick
}: {
  title: string
  description: string
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void
}): React.ReactElement => {
  return (
    <Layout.Horizontal className={css.menuItem} onClick={onClick}>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xsmall' }} color={Color.GREY_0}>
          {title}
        </Text>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.GREY_100}>
          {description}
        </Text>
      </Layout.Vertical>
      <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'medium'}>
        <Icon name="chevron-right" color={Color.GREY_0} />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
