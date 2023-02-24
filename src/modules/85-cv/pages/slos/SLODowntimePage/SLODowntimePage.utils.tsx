/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, Container, Icon, Layout, SelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import type {
  ResponsePageDowntimeHistoryView,
  ResponsePageDowntimeListView,
  ResponsePageMSDropdownResponse
} from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { defaultOption } from './SLODowntimePage.constants'
import css from './SLODowntimePage.module.scss'

export const shouldRenderNoDataCard = (
  appliedSearchAndFilter: boolean,
  downtimeData: ResponsePageDowntimeListView | null,
  downtimeHistoryData: ResponsePageDowntimeHistoryView | null
): boolean =>
  !downtimeData?.data?.content?.length && !downtimeHistoryData?.data?.content?.length && !appliedSearchAndFilter

export const getMonitoredServicesOptions = (
  monitoredServicesData: ResponsePageMSDropdownResponse | null,
  loading: boolean,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  if (loading) {
    return [{ label: getString('loading'), value: 'loading' }]
  }
  if (monitoredServicesData?.data?.content?.length) {
    const { content } = monitoredServicesData.data
    const msOptions = content.map(msDropdownResponse => {
      const { name, identifier } = msDropdownResponse
      return {
        label: name,
        value: identifier
      }
    })

    return [...[defaultOption], ...msOptions]
  }
  return []
}

export const getAddDowntimeButton = (
  handleCreateButton: () => void,
  getString: UseStringsReturn['getString']
): JSX.Element => (
  <RbacButton
    icon="plus"
    text={getString('cv.sloDowntime.label')}
    variation={ButtonVariation.PRIMARY}
    permission={{
      permission: PermissionIdentifier.EDIT_SLO_SERVICE,
      resource: {
        resourceType: ResourceType.SLO
      }
    }}
    onClick={handleCreateButton}
  />
)

export const getMessageAndAddDowntimeButton = (
  handleCreateButton: () => void,
  getString: UseStringsReturn['getString']
): JSX.Element => (
  <Layout.Vertical spacing="xxxlarge" className={css.infoContainer}>
    <Text flex className={css.info}>
      {getString('cv.sloDowntime.info')}
    </Text>
    <Container flex={{ align: 'center-center' }}>{getAddDowntimeButton(handleCreateButton, getString)}</Container>
  </Layout.Vertical>
)

export const RedirectLink = ({ link, text }: { link: string; text: string }): JSX.Element => (
  <a rel="noreferrer" target="_blank" href={link} className={css.links}>
    <Text inline color={Color.PRIMARY_7} margin={{ right: 'xsmall' }}>
      {text}
    </Text>
    <Icon color={Color.PRIMARY_7} name="launch" size={12} />
  </a>
)

export const getRedirectLinks = (getString: UseStringsReturn['getString']): JSX.Element => {
  const learnMoreLink = ''

  return (
    <Layout.Horizontal spacing="small" onClick={e => e.stopPropagation()}>
      <RedirectLink link={learnMoreLink} text={getString('common.learnMore')} />
      <Text>{getString('or')}</Text>
      <RedirectLink link={learnMoreLink} text={getString('common.askUs')} />
    </Layout.Horizontal>
  )
}
