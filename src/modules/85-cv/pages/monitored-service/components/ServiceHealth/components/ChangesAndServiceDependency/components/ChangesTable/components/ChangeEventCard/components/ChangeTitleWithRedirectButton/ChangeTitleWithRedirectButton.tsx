/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Text, Container, Layout, Button, ButtonVariation, ButtonSize, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ChangeEventDTO } from 'services/cv'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import VerificationStatusCard from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'
import { openWindowInNewTab } from '@cv/utils/CommonUtils'
import type { ChangeTitleData } from '../../ChangeEventCard.types'
import { IconWithText } from '../IconWithText/IconWithText'
import { getTextForRedirectButton } from '../../ChangeEventCard.utils'
import css from '../ChangeTitle/ChangeTitle.module.scss'

const iconByType = (type: ChangeEventDTO['type']): IconName => {
  switch (type) {
    case ChangeSourceTypes.CustomFF:
    case ChangeSourceTypes.CustomDeploy:
    case ChangeSourceTypes.CustomIncident:
    case ChangeSourceTypes.CustomInfrastructure:
      return 'service-custom-connector'
    case ChangeSourceTypes.HarnessCE:
      return 'chaos-main'
    case ChangeSourceTypes.HarnessFF:
      return 'ff-solid'
    default:
      return 'cd-solid'
  }
}

export default function ChangeTitleWithRedirectButton({
  changeTitleData
}: {
  changeTitleData: ChangeTitleData
}): JSX.Element {
  const { getString } = useStrings()
  const { name, executionId, url, serviceIdentifier, envIdentifier, status, type } = changeTitleData
  const titleOptions = useMemo(
    () =>
      url
        ? {
            tooltip: name,
            className: css.addEllipsis
          }
        : {},
    [url, name]
  )

  return (
    <Container>
      <Layout.Horizontal>
        <Text
          {...titleOptions}
          font={{ size: 'medium', weight: 'semi-bold' }}
          width="max-content"
          margin={{ right: 'medium' }}
          color={Color.BLACK_100}
        >
          {name}
        </Text>
        {executionId && (
          <Text font={{ size: 'xsmall' }} color={Color.GREY_800} flex={{ align: 'center-center' }}>
            ({getString('cd.serviceDashboard.executionId')}
            <span>{executionId}</span>)
          </Text>
        )}
      </Layout.Horizontal>
      <Container flex margin={{ top: 'xsmall' }}>
        <Layout.Horizontal spacing="xlarge">
          <IconWithText icon={iconByType(type)} />
          <IconWithText icon={'main-setup'} text={serviceIdentifier} />
          <IconWithText icon={'environments'} text={envIdentifier} />
          {status && <VerificationStatusCard status={status} />}
        </Layout.Horizontal>
        {url ? (
          <Button
            onClick={() => openWindowInNewTab(url)}
            className={css.redirectButtonPipeline}
            text={getTextForRedirectButton(getString, type)}
            icon="share"
            iconProps={{ size: 12 }}
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
          />
        ) : null}
      </Container>
    </Container>
  )
}
