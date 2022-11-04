/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Color, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import moment from 'moment'
import { Collapse } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeDetailedResponse, useGetGlobalFreezeWithBannerDetails } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { String } from 'framework/strings'
import css from './GlobalFreezeBanner.module.scss'

export type Scope = Exclude<FreezeDetailedResponse['freezeScope'], 'unknown' | undefined>

export const scopeText: Record<Scope, string> = {
  account: 'Account',
  org: 'Organization',
  project: 'Project'
}

export const GlobalFreezeBanner: FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const isNgDeploymentFreezeEnabled = useFeatureFlag(FeatureFlag.NG_DEPLOYMENT_FREEZE)
  const [open, setOpen] = useState(false)

  const { loading, data } = useGetGlobalFreezeWithBannerDetails({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: !isNgDeploymentFreezeEnabled
  })

  const freezes = data?.data?.activeOrUpcomingGlobalFreezes

  if (loading || !freezes || freezes?.length === 0) {
    return null
  }

  const hasMultipleFreezes = freezes.length > 1

  return (
    <Layout.Vertical className={css.globalFreezeBanner}>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
        <Icon name="warning-sign" color={Color.YELLOW_800} size={16} />
        <Text
          font={{ variation: FontVariation.SMALL_BOLD }}
          color={Color.GREY_800}
          padding={{ left: 'small', right: 'small' }}
        >
          FREEZE IN PLACE
        </Text>

        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
          <String
            stringID={hasMultipleFreezes ? 'common.freezeListActiveBannerText' : 'common.freezeActiveBannerText'}
            useRichText
            vars={
              hasMultipleFreezes
                ? { count: freezes.length }
                : {
                    scope: scopeText[freezes[0].freezeScope as Scope],
                    startTime: moment(freezes[0].window?.startTime).format('LLL'),
                    endTime: moment(freezes[0].window?.endTime).format('LLL')
                  }
            }
          />
        </Text>

        {hasMultipleFreezes && (
          <Button
            rightIcon={open ? 'chevron-up' : 'chevron-down'}
            text={open ? 'Collapse List' : 'Expand List'}
            variation={ButtonVariation.LINK}
            onClick={() => setOpen(!open)}
            className={css.toggleMultiFreezeView}
          />
        )}
      </Layout.Horizontal>

      {hasMultipleFreezes && (
        <Collapse isOpen={open}>
          <Layout.Vertical spacing="small" margin={{ top: 'small', left: 'xxlarge' }}>
            {freezes.map((freeze, i) => (
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800} key={i}>
                <String
                  stringID={'common.freezeListActiveBannerExpandedText'}
                  useRichText
                  vars={{
                    scope: scopeText[freeze.freezeScope as Scope],
                    startTime: moment(freeze.window?.startTime).format('LLL'),
                    endTime: moment(freeze.window?.endTime).format('LLL')
                  }}
                />
              </Text>
            ))}
          </Layout.Vertical>
        </Collapse>
      )}
    </Layout.Vertical>
  )
}
