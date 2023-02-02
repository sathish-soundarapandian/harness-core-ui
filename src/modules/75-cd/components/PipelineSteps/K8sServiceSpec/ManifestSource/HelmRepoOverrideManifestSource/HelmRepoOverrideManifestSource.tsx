/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import {
  ManifestDataType,
  ManifestStoreMap,
  ManifestToConnectorMap
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'

import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const Content = (props: ManifestSourceRenderProps): React.ReactElement => {
  const {
    template,
    path,
    manifestPath,
    manifest,
    fromTrigger,
    readonly,
    formik,
    stageIdentifier,
    accountId,
    projectIdentifier,
    orgIdentifier,
    initialValues,
    allowableTypes,
    repoIdentifier,
    branch
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const manifestStoreType = get(template, `${manifestPath}.spec.type`, null)

  const connectorRefPath = `${manifestPath}.spec.connectorRef`

  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(
      fieldName,
      formik,
      stageIdentifier,
      manifest?.identifier as string,
      fromTrigger
    )
  }

  const checkHelmRepoOverrideManifestStores = (helmRepoManifestStoreType: any) => {
    return (
      helmRepoManifestStoreType === ManifestStoreMap.Http ||
      helmRepoManifestStoreType === ManifestStoreMap.OciHelmChart ||
      helmRepoManifestStoreType === ManifestStoreMap.S3 ||
      helmRepoManifestStoreType === ManifestStoreMap.Gcs
    )
  }

  return (
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      <div className={css.inputFieldLayout}>
        {checkHelmRepoOverrideManifestStores(manifestStoreType) && (
          <div data-name="connectorRefContainer" className={css.verticalSpacingInput}>
            <FormMultiTypeConnectorField
              disabled={isFieldDisabled(connectorRefPath)}
              name={`${path}.${connectorRefPath}`}
              selected={get(initialValues, connectorRefPath, '')}
              label={getString('connector')}
              placeholder={''}
              setRefValue
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              width={400}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              type={ManifestToConnectorMap[defaultTo(manifest?.spec?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          </div>
        )}
      </div>
    </Layout.Vertical>
  )
}

export class HelmRepoOverrideManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.HelmRepoOverride

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <Content {...props} />
  }
}
