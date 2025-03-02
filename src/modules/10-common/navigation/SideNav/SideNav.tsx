/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useEffect, useState } from 'react'
import cx from 'classnames'
import { NavLink as Link, NavLinkProps, useParams } from 'react-router-dom'
import { Text, Layout, IconName, Icon, Container, TextProps, Popover } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { useGetAccountNG } from 'services/cd-ng'
import { LaunchButton } from '@common/components/LaunchButton/LaunchButton'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import css from './SideNav.module.scss'

export interface SideNavProps {
  subtitle?: string
  title?: string
  icon?: IconName
  launchButtonText?: any
  launchButtonRedirectUrl?: string
  collapseByDefault?: boolean
}

const SideNavCollapseButton: React.FC<{ isExpanded: boolean; onClick: () => void }> = ({ isExpanded, onClick }) => {
  const { getString } = useStrings()
  return (
    <Container
      className={cx(css.sideNavResizeBtn, {
        [css.collapse]: isExpanded,
        [css.expand]: !isExpanded
      })}
      onMouseEnter={/* istanbul ignore next */ e => e.stopPropagation()}
      onMouseLeave={/* istanbul ignore next */ e => e.stopPropagation()}
      onClick={onClick}
    >
      <Popover
        content={
          <Text color={Color.WHITE} padding="small">
            {isExpanded ? getString('common.collapse') : getString('common.expand')}
          </Text>
        }
        portalClassName={css.popover}
        popoverClassName={Classes.DARK}
        interactionKind={PopoverInteractionKind.HOVER}
        position={Position.LEFT}
      >
        <Icon className={css.triangle} name="symbol-triangle-up" size={12} />
      </Popover>
    </Container>
  )
}

export const SIDE_NAV_EXPAND_TIMER = 500
export default function SideNav(props: React.PropsWithChildren<SideNavProps>): ReactElement {
  const { collapseByDefault = false } = props
  const { getString } = useStrings()
  const { SPG_SIDENAV_COLLAPSE, PLG_ENABLE_CROSS_GENERATION_ACCESS, NEW_LEFT_NAVBAR_SETTINGS } = useFeatureFlags()
  const params = useParams<ProjectPathProps>()
  const { accountId } = useParams<AccountPathProps>()
  const { setPreference: setSideNavExpandedPrefStore, preference: sideNavExpandedPrefStore = true } =
    usePreferenceStore<boolean>(PreferenceScope.ACCOUNT, 'collapseSideNav')
  const [sideNavHovered, setSideNavhovered] = useState<boolean>(false)

  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(collapseByDefault ? false : sideNavExpandedPrefStore)
  const launchButtonRedirectUrl = props.launchButtonRedirectUrl
    ? props.launchButtonRedirectUrl?.replace('{replaceAccountId}', params.accountId)
    : ''
  const { data } = useGetAccountNG({ accountIdentifier: accountId, queryParams: { accountIdentifier: accountId } })
  const account = data?.data
  let newNavFlag = true
  if (PLG_ENABLE_CROSS_GENERATION_ACCESS) {
    if (account?.crossGenerationAccessEnabled === undefined) {
      newNavFlag = true
    } else {
      newNavFlag = account?.crossGenerationAccessEnabled
    }
  }

  useEffect(() => {
    const timer =
      sideNavHovered &&
      setTimeout(() => {
        setSideNavExpanded(true)
        setSideNavExpandedPrefStore(true)
      }, SIDE_NAV_EXPAND_TIMER)

    return () => {
      timer && clearTimeout(timer)
    }
  }, [sideNavHovered])

  return (
    <div
      className={cx(css.main, {
        [css.sideNavExpanded]: sideNavExpanded,
        [css.newNav]: NEW_LEFT_NAVBAR_SETTINGS
      })}
      onMouseEnter={() => {
        /* istanbul ignore next */
        !sideNavExpanded && setSideNavhovered(true)
      }}
      onMouseLeave={() => {
        /* istanbul ignore next */
        !sideNavExpanded && setSideNavhovered(false)
      }}
    >
      <>
        <div>{props.children}</div>
        {props.launchButtonText && props.launchButtonRedirectUrl && newNavFlag ? (
          <LaunchButton
            launchButtonText={getString(props.launchButtonText)}
            redirectUrl={returnLaunchUrl(launchButtonRedirectUrl)}
          />
        ) : null}
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
      </>
      {SPG_SIDENAV_COLLAPSE && (
        <SideNavCollapseButton
          isExpanded={sideNavExpanded}
          onClick={() => {
            if (!collapseByDefault) {
              setSideNavExpandedPrefStore(!sideNavExpanded)
            }
            setSideNavExpanded(!sideNavExpanded)
          }}
        />
      )}
    </div>
  )
}

interface SidebarLinkProps extends NavLinkProps {
  label: string
  icon?: IconName
  className?: string
  textProps?: TextProps
  rightIcon?: IconName
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  label,
  icon,
  rightIcon,
  className,
  textProps,
  ...others
}) => (
  <Link className={cx(css.link, className)} activeClassName={css.selected} {...others}>
    <Text icon={icon} rightIcon={rightIcon} className={css.text} {...textProps}>
      {label}
    </Text>
  </Link>
)
