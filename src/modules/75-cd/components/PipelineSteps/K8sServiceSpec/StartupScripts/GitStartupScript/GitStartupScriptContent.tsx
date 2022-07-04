/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import List from '@common/components/List/List'
import type { StartupScriptRenderProps } from '@cd/factory/StartupScriptFactory/StartupScriptBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../../ManifestSource/ManifestSourceUtils'
import GitStartupScriptRuntimeFields from './GitStartupScriptRuntimeFields'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

interface GitStartupScriptRenderProps extends StartupScriptRenderProps {
  pathFieldlabel: StringKeys
}
const GitStartupScriptContent = (props: GitStartupScriptRenderProps): React.ReactElement => {
  const { template, path, startupScriptPath, fromTrigger, readonly, formik, stageIdentifier, pathFieldlabel } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(fieldName, formik, stageIdentifier, '', fromTrigger)
  }

  return (
    <Layout.Vertical data-name="startupScript" className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
      <GitStartupScriptRuntimeFields {...props} />

      {isFieldRuntime(`${startupScriptPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <List
            labelClassName={css.listLabel}
            label={getString(pathFieldlabel)}
            name={`${path}.${startupScriptPath}.spec.store.spec.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${startupScriptPath}.spec.store.spec.paths`)}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export default GitStartupScriptContent
