/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Card, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './AllEnvironmentsFlagsListing.module.scss'

export interface FlagEnvironmentsStateProps {
  environmentsByType: {
    [key: string]: { identifier?: string; name?: string; enabled?: boolean }[]
  }
  onClickEnvironment: (envId: string) => void
}

const FlagEnvironmentsState: FC<FlagEnvironmentsStateProps> = ({ environmentsByType, onClickEnvironment }) => {
  const { getString } = useStrings()
  const envTypes = Object.keys(environmentsByType)

  return (
    <Layout.Horizontal className={css.environmentsContainer}>
      {envTypes
        .filter(envType => !!environmentsByType[envType].length)
        .map(envType => (
          <Layout.Horizontal
            key={envType}
            flex={{ distribution: 'space-between', align: 'center-center' }}
            padding="small"
            spacing="medium"
            className={cx(css.environmentTypeContainer, envType === 'prod' ? css.prod : css.nonProd)}
            data-testid="environmentTypeContainer"
          >
            <div className={css.rotatedLabel}>
              <Text color={Color.PRIMARY_9} font={{ variation: FontVariation.SMALL_BOLD }}>
                {getString(envType === 'prod' ? 'cf.environments.prod' : 'cf.environments.nonProd')}
              </Text>
            </div>
            {environmentsByType[envType].map(env => (
              <Card
                key={env.identifier}
                interactive
                elevation={0}
                className={css.environmentCard}
                onClick={() => {
                  if (env.identifier) {
                    onClickEnvironment(env.identifier)
                  }
                }}
              >
                <Layout.Vertical
                  key={env.identifier}
                  background={Color.WHITE}
                  height="100%"
                  flex={{ alignItems: 'start', justifyContent: 'space-between' }}
                  className={css.flagEnvironmentStatus}
                  data-testid="flagEnvironmentStatus"
                >
                  <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
                    {env.name}
                  </Text>
                  <Text
                    font={{ variation: FontVariation.TINY }}
                    tag="div"
                    padding="xsmall"
                    className={env.enabled ? css.enabled : css.disabled}
                  >
                    {(env.enabled ? getString('enabledLabel') : getString('common.disabled')).toUpperCase()}
                  </Text>
                </Layout.Vertical>
              </Card>
            ))}
          </Layout.Horizontal>
        ))}
    </Layout.Horizontal>
  )
}

export default FlagEnvironmentsState
