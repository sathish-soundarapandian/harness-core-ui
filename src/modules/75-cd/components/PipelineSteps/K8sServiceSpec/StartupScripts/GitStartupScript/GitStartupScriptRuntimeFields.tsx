/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormInput, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitConfigDTO } from 'services/cd-ng'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StartupScriptRenderProps } from '@cd/factory/StartupScriptFactory/StartupScriptBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { shouldDisplayRepositoryName } from '../../ManifestSource/ManifestSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const GitStartupScriptRuntimeFields = ({
  template,
  initialValues,
  path,
  startupScriptPath,
  startupScript,
  allowableTypes,
  accountId,
  projectIdentifier,
  orgIdentifier,
  readonly,
  repoIdentifier,
  branch
}: StartupScriptRenderProps): React.ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [showRepoName, setShowRepoName] = useState(true)

  return (
    <>
      {isFieldRuntime(`${startupScriptPath}.spec.store.spec.connectorRef`, template) && (
        <div data-name="connectorRefContainer" className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={readonly}
            name={`${path}.${startupScriptPath}.spec.store.spec.connectorRef`}
            selected={get(initialValues, `${startupScriptPath}.spec.store.spec.connectorRef`, '')}
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
            type={ManifestToConnectorMap[defaultTo(startupScript?.spec.store.type, '')]}
            onChange={(selected, _itemType, multiType) => {
              const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
              if (multiType === MultiTypeInputType.FIXED) {
                if (shouldDisplayRepositoryName(item)) {
                  setShowRepoName(false)
                } else {
                  setShowRepoName(true)
                }
              }
            }}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}

      {isFieldRuntime(`${startupScriptPath}.spec.store.spec.repoName`, template) && showRepoName && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${path}.${startupScriptPath}.spec.store.spec.repoName`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('common.repositoryName')}
          />
        </div>
      )}

      {isFieldRuntime(`${startupScriptPath}.spec.store.spec.branch`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${path}.${startupScriptPath}.spec.store.spec.branch`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.deploy.inputSet.branch')}
          />
        </div>
      )}
      {isFieldRuntime(`${startupScriptPath}.spec.store.spec.commitId`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${path}.${startupScriptPath}.spec.store.spec.commitId`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.commitIdValue')}
          />
        </div>
      )}
      {isFieldRuntime(`${startupScriptPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${path}.${startupScriptPath}.spec.store.spec.paths[0]`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipeline.startupScript.scriptFilePath')}
          />
        </div>
      )}
    </>
  )
}
export default GitStartupScriptRuntimeFields
