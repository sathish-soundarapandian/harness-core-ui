/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import CopyCodeSection from '@connectors/components/CreateConnector/CEK8sConnector/components/CopyCodeSection'

import css from '../K8sQuickCreateModal.module.scss'

interface StepContainerProps {
  stepId?: number
  copyCommand?: string
}

const StepContainer: React.FC<StepContainerProps> = ({ stepId, copyCommand, children }) => {
  const { getString } = useStrings()

  /* istanbul ignore else */ if (copyCommand) {
    return (
      <Container className={css.copyCodeSection}>
        <CopyCodeSection snippet={copyCommand} />
      </Container>
    )
  } else if (stepId) {
    return (
      <Container className={css.stepCtn}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.PRIMARY_7} className={css.stepNumber}>
          {`${getString('step')} ${stepId}`}
        </Text>
        <Container>{children}</Container>
      </Container>
    )
  } else {
    return null
  }
}

export default StepContainer
