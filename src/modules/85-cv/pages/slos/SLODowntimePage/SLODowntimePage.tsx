/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, Layout, Text, Icon, NoDataCard } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Page } from '@common/exports'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import noDowntimeData from '@cv/assets/noDowntimeData.svg'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './SLODowntimePage.module.scss'

export default function SLODowntimePage(): JSX.Element {
  const { getString } = useStrings()

  const learnMoreLink = ''

  const getMessageAndAddDowntimeButton = (): JSX.Element => (
    <>
      <Layout.Horizontal spacing="medium">
        <Text flex className={css.info}>
          {getString('cv.sloDowntime.info')}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing={'xxxlarge'}>
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
        />
      </Layout.Horizontal>
    </>
  )

  const RedirectLink = ({ link, text }: { link: string; text: string }): JSX.Element => (
    <a rel="noreferrer" target="_blank" href={link} className={css.links}>
      <Text inline color={Color.PRIMARY_7} margin={{ right: 'xsmall' }}>
        {text}
      </Text>
      <Icon color={Color.PRIMARY_7} name="launch" size={12} />
    </a>
  )

  const getRedirectLinks = (): JSX.Element => (
    <Layout.Horizontal spacing="small" onClick={e => e.stopPropagation()}>
      <RedirectLink link={learnMoreLink} text={getString('common.learnMore')} />
      <Text>{getString('or')}</Text>
      <RedirectLink link={learnMoreLink} text={getString('common.askUs')} />
    </Layout.Horizontal>
  )

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: 'sloHeader' }}>
              {getString('common.sloDowntimeLabel')}
            </Text>
          </Layout.Vertical>
        }
      />
      <Page.Body className={css.pageBody}>
        <NoDataCard
          image={noDowntimeData}
          messageTitle={getString('cv.sloDowntime.noData')}
          message={getMessageAndAddDowntimeButton()}
          button={getRedirectLinks()}
        />
      </Page.Body>
    </>
  )
}
