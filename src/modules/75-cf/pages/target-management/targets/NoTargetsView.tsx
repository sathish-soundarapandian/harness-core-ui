/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container } from '@harness/uicore'
import EnvironmentDialog from '@cf/components/CreateEnvironmentDialog/EnvironmentDialog'
import routes from '@common/RouteDefinitions'
import { NewTargets } from './NewTarget'
import TargetsSectionNoData from './TargetsSectionNoData'

export interface NoTargetsViewProps {
  onNewTargetsCreated: () => void
  noEnvironment?: boolean
}

export const NoTargetsView: React.FC<NoTargetsViewProps> = ({ onNewTargetsCreated, noEnvironment }) => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()

  return (
    <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
      <TargetsSectionNoData>
        {noEnvironment ? (
          <EnvironmentDialog
            onCreate={response => {
              setTimeout(() => {
                history.push(
                  routes.toCFEnvironmentDetails({
                    environmentIdentifier: response?.data?.identifier as string,
                    projectIdentifier,
                    orgIdentifier,
                    accountId: accountIdentifier
                  })
                )
              }, 1000)
            }}
            isLinkVariation
            buttonText={'cf.targets.newEnvironmentTarget'}
          />
        ) : (
          <NewTargets
            accountIdentifier={accountIdentifier}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            onCreated={onNewTargetsCreated}
            isLinkVariation
          />
        )}
      </TargetsSectionNoData>
    </Container>
  )
}
