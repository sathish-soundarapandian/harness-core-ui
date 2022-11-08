/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useState } from 'react'
import { Button, ButtonVariation, Color, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import moment from 'moment'
import { Collapse } from '@blueprintjs/core'
import type { FreezeBannerDetails, FreezeDetailedResponse } from 'services/cd-ng'
import { String } from 'framework/strings'
import css from './GlobalFreezeBanner.module.scss'
export const DATE_PARSE_FORMAT = 'YYYY-MM-DD hh:mm A'
export type Scope = Exclude<FreezeDetailedResponse['freezeScope'], 'unknown' | undefined>

export const getReadableDateFromEpoch = (dateTimeEpoch?: number): string => moment(dateTimeEpoch).format('LLL')

export const scopeText: Record<Scope, string> = {
  account: 'Account',
  org: 'Organization',
  project: 'Project'
}

export const GlobalFreezeBanner: FC<{ globalFreezes: FreezeBannerDetails[] | undefined }> = ({ globalFreezes }) => {
  const [open, setOpen] = useState(false)

  if (!globalFreezes || globalFreezes?.length === 0) {
    return null
  }
  const hasMultipleFreezes = globalFreezes.length > 1

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
                ? { count: globalFreezes.length }
                : {
                    scope: scopeText[globalFreezes[0].freezeScope as Scope],
                    startTime: getReadableDateFromEpoch(globalFreezes[0].window?.startTime),
                    endTime: getReadableDateFromEpoch(globalFreezes[0].window?.endTime)
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
          <ul className={css.freezeWindowList}>
            {globalFreezes.map((freeze, i) => (
              <li key={i}>
                <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
                  <String
                    stringID={'common.freezeListActiveBannerExpandedText'}
                    useRichText
                    vars={{
                      scope: scopeText[freeze.freezeScope as Scope],
                      startTime: getReadableDateFromEpoch(freeze.window?.startTime),
                      endTime: getReadableDateFromEpoch(freeze.window?.endTime)
                    }}
                  />
                </Text>
              </li>
            ))}
          </ul>
        </Collapse>
      )}
    </Layout.Vertical>
  )
}
