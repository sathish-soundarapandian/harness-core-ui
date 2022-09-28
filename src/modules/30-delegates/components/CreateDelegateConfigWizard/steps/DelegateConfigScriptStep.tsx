/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import set from 'lodash-es/set'
import { useParams } from 'react-router-dom'
import { Button, Layout, Container, Heading, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { DelegateProfileDetailsNg } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { dataObj } from '../CreateDelegateConfigWizard'

import css from './DelegateConfigSteps.module.scss'

interface DelegateConfigScopeStepProps {
  name: string
  previousStep?: (data: dataObj) => void
  onFinish: (data: DelegateProfileDetailsNg) => void
  closeModal?: () => void
  onSuccess?: () => void
  prevStepData?: dataObj
}

const DelegateConfigScopeStep: React.FC<DelegateConfigScopeStepProps> = ({ previousStep, onFinish, prevStepData }) => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [script, setScript] = useState(prevStepData?.script || '')

  const onPreviousStep = (): void => {
    previousStep?.({ ...prevStepData, script })
  }

  const createDelegateProfile = () => {
    const delegateProfileData = {
      identifier: prevStepData?.identifier,
      name: prevStepData?.name,
      description: prevStepData?.description,
      selectors: Object.keys(prevStepData?.tags || {}),
      startupScript: script
    }
    if (orgIdentifier) {
      set(delegateProfileData, 'orgIdentifier', orgIdentifier)
    }
    if (projectIdentifier) {
      set(delegateProfileData, 'projectIdentifier', projectIdentifier)
    }

    onFinish(delegateProfileData)
  }

  return (
    <Layout.Vertical className={css.stepContainer} padding="xxlarge">
      <Container>
        <Heading level={2} color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
          {getString('delegates.newDelegateConfigWizard.scriptTitle')}
        </Heading>
        <Text>{getString('common.script')}</Text>
        <textarea className={css.scriptTextarea} onChange={event => setScript(event.target.value)} value={script} />
      </Container>
      <Layout.Horizontal spacing="xsmall">
        <Button type="button" text={getString('back')} onClick={onPreviousStep} />
        <Button type="button" intent="primary" text={getString('finish')} onClick={createDelegateProfile} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DelegateConfigScopeStep
