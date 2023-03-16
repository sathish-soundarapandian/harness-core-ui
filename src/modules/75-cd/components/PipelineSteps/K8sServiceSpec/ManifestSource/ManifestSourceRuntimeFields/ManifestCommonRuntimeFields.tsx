/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { shouldAllowOnlyOneFilePath } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/utils'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import MultiTypeListOrFileSelectList from '../MultiTypeListOrFileSelectList'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const ManifestCommonRuntimeFields = ({
  template,
  path,
  manifestPath,
  manifest,
  fromTrigger,
  readonly,
  formik,
  stageIdentifier,
  fileUsage,
  allowableTypes,
  stepViewType
}: ManifestSourceRenderProps): React.ReactElement => {
  const { getString } = useStrings()
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
  return (
    <>
      {isFieldRuntime(`${manifestPath}.spec.store.spec.files`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeListOrFileSelectList
            allowableTypes={allowableTypes}
            label={getString('resourcePage.fileStore')}
            name={`${path}.${manifestPath}.spec.store.spec.files`}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.files`)}
            formik={formik}
            isNameOfArrayType
            fileUsage={fileUsage}
            manifestStoreType={ManifestStoreMap.Harness}
            stepViewType={stepViewType}
            allowOnlyOne={shouldAllowOnlyOneFilePath(manifest?.type as ManifestTypes)}
          />
        </div>
      )}
    </>
  )
}
export default ManifestCommonRuntimeFields
