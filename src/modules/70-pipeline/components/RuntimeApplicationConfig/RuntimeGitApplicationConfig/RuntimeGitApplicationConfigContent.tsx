/* eslint-disable no-restricted-imports */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { FormInput, Layout, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import type { ApplicationConfigRenderProps } from '@cd/factory/ApplicationConfigFactory/ApplicationConfigBase'
import { useStrings } from 'framework/strings'
import type { GitConfigDTO, Scope } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { isFieldRuntime } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import { shouldDisplayRepositoryName } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import css from '../RuntimeApplicationConfig.module.scss'

function RuntimeGitApplicationConfigContent({
  template,
  initialValues,
  path,
  applicationConfigPath,
  applicationConfig,
  allowableTypes,
  accountId,
  projectIdentifier,
  orgIdentifier,
  readonly,
  repoIdentifier,
  branch,
  pathLabel,
  type
}: ApplicationConfigRenderProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [showRepoName, setShowRepoName] = useState(true)
  const [connector, setConnector] = useState(undefined)

  const pathFieldName =
    isFieldRuntime(`${applicationConfigPath}.store.spec.paths`, initialValues) ||
    isFieldRuntime(`${applicationConfigPath}.store.spec.paths[0]`, initialValues)
      ? 'paths'
      : 'paths[0]'

  React.useEffect(() => {
    if (shouldDisplayRepositoryName(connector)) {
      setShowRepoName(false)
    } else {
      setShowRepoName(true)
    }
  }, [connector])

  return (
    <Layout.Vertical data-name={`applicationConfig-${type}`} className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
      <>
        {isFieldRuntime(`${applicationConfigPath}.store.spec.connectorRef`, template) && (
          <div data-name="connectorRefContainer" className={css.connectorInputSpacing}>
            <FormMultiTypeConnectorField
              disabled={readonly}
              name={`${path}.${applicationConfigPath}.store.spec.connectorRef`}
              selected={get(initialValues, `${applicationConfigPath}.store.spec.connectorRef`, '')}
              label={getString('connector')}
              placeholder={''}
              setRefValue
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              width={391}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              setConnector={setConnector}
              type={ManifestToConnectorMap[defaultTo(applicationConfig?.store?.type, '')]}
              onChange={
                /* istanbul ignore next */ (selected, _itemType, multiType) => {
                  const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
                  if (multiType === MultiTypeInputType.FIXED) {
                    if (shouldDisplayRepositoryName(item)) {
                      setShowRepoName(false)
                    } else {
                      setShowRepoName(true)
                    }
                  }
                }
              }
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          </div>
        )}

        {(isFieldRuntime(`${applicationConfigPath}.store.spec.repoName`, template) || showRepoName) && (
          <div className={css.inputSpacing}>
            <FormInput.MultiTextInput
              disabled={readonly}
              name={`${path}.${applicationConfigPath}.store.spec.repoName`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('common.repositoryName')}
            />
          </div>
        )}

        {isFieldRuntime(`${applicationConfigPath}.store.spec.branch`, template) && (
          <div className={css.inputSpacing}>
            <FormInput.MultiTextInput
              disabled={readonly}
              name={`${path}.${applicationConfigPath}.store.spec.branch`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
            />
          </div>
        )}
        {isFieldRuntime(`${applicationConfigPath}.store.spec.commitId`, template) && (
          <div className={css.inputSpacing}>
            <FormInput.MultiTextInput
              disabled={readonly}
              name={`${path}.${applicationConfigPath}.store.spec.commitId`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipelineSteps.commitIdValue')}
            />
          </div>
        )}
        {isFieldRuntime(`${applicationConfigPath}.store.spec.paths`, template) && (
          <div className={css.inputSpacing}>
            <FormInput.MultiTextInput
              disabled={readonly}
              name={`${path}.${applicationConfigPath}.store.spec.${pathFieldName}`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={pathLabel}
            />
          </div>
        )}
      </>
    </Layout.Vertical>
  )
}

export default RuntimeGitApplicationConfigContent
