/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { Prerequisite } from 'services/cf'
import { ItemContainer } from '../ItemContainer/ItemContainer'

export interface CannotArchiveWarningProps {
  flagName: string
  prerequisites: Prerequisite[]
}

const CannotArchiveWarning: FC<CannotArchiveWarningProps> = ({ flagName, prerequisites }) => {
  const { getString } = useStrings()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()

  return (
    <Layout.Vertical spacing="small">
      <Text style={{ wordBreak: 'break-word' }} font={{ variation: FontVariation.BODY2 }}>
        {getString('cf.featureFlags.archiving.cannotArchive', { flagName })}:
      </Text>
      {prerequisites.map(flag => (
        <ItemContainer data-testid="flag-prerequisite-row" key={flag.feature}>
          <Layout.Horizontal>
            <Text padding={{ right: 'xsmall' }}>{getString('common.ID')}:</Text>
            <Link
              to={withActiveEnvironment(
                routes.toCFFeatureFlagsDetail({
                  orgIdentifier: orgIdentifier as string,
                  projectIdentifier: projectIdentifier as string,
                  featureFlagIdentifier: flag.feature,
                  accountId
                })
              )}
            >
              {flag.feature}
            </Link>
          </Layout.Horizontal>
        </ItemContainer>
      ))}
      <Text font={{ variation: FontVariation.BODY2 }}>{getString('cf.featureFlags.archiving.removeFlag')}</Text>
    </Layout.Vertical>
  )
}

export default CannotArchiveWarning
