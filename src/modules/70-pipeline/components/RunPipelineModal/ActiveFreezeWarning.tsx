/* eslint-disable react/function-component-definition */
/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'

import { Color, FontVariation, Intent } from '@harness/design-system'
import { Container, Layout, Text } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getFreezeRouteLink } from '@common/utils/freezeWindowUtils'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { ShouldDisableDeploymentFreezeResponseDTO } from 'services/cd-ng'
import InfoStrip from '@common/components/InfoStrip/InfoStrip'

interface ActiveFreezeWarningProps {
  data?: ShouldDisableDeploymentFreezeResponseDTO
}

export const ActiveFreezeWarning: FC<ActiveFreezeWarningProps> = ({ data }) => {
  const { freezeReferences, shouldDisable } = defaultTo(data, {})
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<PipelinePathProps>>()

  return shouldDisable && freezeReferences?.[0] ? (
    <Container padding={{ left: 'xlarge', right: 'xlarge', bottom: 'medium' }}>
      <InfoStrip
        intent={Intent.WARNING}
        content={
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
            <Text font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}>
              {getString('pipeline.runDisabledOnFreeze')}
            </Text>
            <Link
              to={getFreezeRouteLink(freezeReferences?.[0], {
                projectIdentifier,
                orgIdentifier,
                accountId,
                module: defaultTo(module, 'cd')
              })}
            >
              <Text font={{ variation: FontVariation.FORM_MESSAGE_WARNING }} color={Color.PRIMARY_7}>
                {getString('pipeline.viewFreeze')}
              </Text>
            </Link>
          </Layout.Horizontal>
        }
      />
    </Container>
  ) : null
}
