/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Layout } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import orImg from '@cf/images/orImg.svg'

export interface GetStartedWithFFProps {
  hidden?: boolean
}

export const GetStartedWithFF: React.FC<GetStartedWithFFProps> = ({ hidden }) => {
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()

  return (
    <Container hidden={hidden}>
      <Layout.Vertical flex={{ align: 'center-center' }} spacing={'xlarge'}>
        <Button
          intent="primary"
          variation={ButtonVariation.PRIMARY}
          size={ButtonSize.LARGE}
          text={getString('cf.featureFlags.getStartedWithFF')}
          onClick={() => {
            history.push(
              routes.toCFOnboarding({
                projectIdentifier,
                orgIdentifier,
                accountId
              })
            )
          }}
        />
        <img src={orImg} width={270} height={24} alt="" data-testid="or-image" />
      </Layout.Vertical>
    </Container>
  )
}

export default GetStartedWithFF
