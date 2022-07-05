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
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
// import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

interface K8sValuesYamlManifestRenderProps extends ManifestSourceRenderProps {
  pathFieldlabel: StringKeys
}
const K8sValuesYamlConfigFileContent = (props: K8sValuesYamlManifestRenderProps): React.ReactElement => {
  const {
    template,
    path,
    manifestPath,
    manifest
    // fromTrigger,
    // allowableTypes,
    // readonly,
    // formik,
    // stageIdentifier,
    // pathFieldlabel
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  //   const isFieldDisabled = (fieldName: string): boolean => {
  //     // /* instanbul ignore else */
  //     if (readonly) {
  //       return true
  //     }
  //     return isFieldfromTriggerTabDisabled(
  //       fieldName,
  //       formik,
  //       stageIdentifier,
  //       manifest?.identifier as string,
  //       fromTrigger
  //     )
  //   }

  return (
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      {isFieldRuntime(`${manifestPath}.spec.valuesPaths`, template) && (
        <div className={css.verticalSpacingInput}>
          <List
            labelClassName={css.listLabel}
            label={getString('pipeline.manifestType.valuesYamlPath')}
            name={`${path}.${manifestPath}.spec.valuesPaths`}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            // disabled={isFieldDisabled(`${manifestPath}.spec.valuesPaths`)}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export default K8sValuesYamlConfigFileContent
