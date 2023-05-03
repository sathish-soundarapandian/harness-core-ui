/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isFieldRuntime } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import type { ServiceHookSourceRenderProps } from '@cd/factory/ServiceHookSourceFactory/ServiceHookSourceBase'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import css from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpec.module.scss'

const ServiceHookFileContent = (props: ServiceHookSourceRenderProps): React.ReactElement => {
  const { template, path, hookPath, hookData, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <Layout.Vertical
      data-name="service-hooks"
      key={hookData?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      {isFieldRuntime(`${hookPath}.store.content`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeFieldSelector
            name={`${path}.${hookPath}.store.content`}
            label={getString('common.script')}
            allowedTypes={allowableTypes}
            style={{ width: 450 }}
            skipRenderValueInExpressionLabel
            expressionRender={
              /* istanbul ignore next */ () => (
                <MonacoTextField
                  name={`${path}.${hookPath}.store.content`}
                  expressions={expressions}
                  height={80}
                  fullScreenAllowed
                  fullScreenTitle={getString('pipelineSteps.content')}
                />
              )
            }
          >
            <MonacoTextField
              name={`${path}.${hookPath}.store.content`}
              expressions={expressions}
              height={80}
              fullScreenAllowed
              fullScreenTitle={getString('pipelineSteps.content')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
    </Layout.Vertical>
  )
}

export default ServiceHookFileContent
