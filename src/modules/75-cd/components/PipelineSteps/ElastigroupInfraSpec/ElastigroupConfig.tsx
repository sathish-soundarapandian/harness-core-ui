/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ElastigroupConfiguration, StoreConfigWrapper } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import ElastigroupConfigStepOne from './ElastigroupConfigStepOne'
import { HarnessOption } from '../AzureWebAppServiceSpec/HarnessOption'
import css from './ElastigroupInfra.module.scss'

interface ElastigroupConfigProp {
  initialValues: StoreConfigWrapper
  handleSubmit: (data: ElastigroupConfiguration) => void
}

export function ElastigroupConfig({ initialValues, handleSubmit }: ElastigroupConfigProp): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <StepWizard
      className={css.elastiWizard}
      icon={'service-elastigroup'}
      iconProps={{
        size: 37
      }}
      title={getString('cd.steps.elastigroup.elastigroupTitle')}
      initialStep={2} //directly take us to 2nd step as we currently just have one option i.e. harness
    >
      <ElastigroupConfigStepOne
        initialValues={initialValues}
        name={getString('pipeline.configSource')}
        stepName={getString('pipeline.configSource')}
        key={getString('pipeline.configSource')}
        isReadonly={false}
      />
      <HarnessOption
        name={getString('cd.steps.elastigroup.elastigroupConfigDetails')}
        initialValues={initialValues}
        stepName={getString('pipeline.fileDetails')}
        handleSubmit={handleSubmit}
        formName="elastigroupConfig"
        expressions={expressions}
      />
    </StepWizard>
  )
}
