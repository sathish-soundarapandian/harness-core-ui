/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Label } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { TerraformVarFileWrapper } from 'services/cd-ng'
import { TerraformPlanProps, TerraformStoreTypes } from '../../Common/Terraform/TerraformInterfaces'
import RemoteVarSection from './RemoteVarSection'
import InlineVarFileInputSet from '../../Common/VarFile/InlineVarFileInputSet'

export default function TfVarFile(props: TerraformPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, path, allowableTypes, stepViewType, readonly } = props
  const fieldPath = inputSetData?.template?.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  return (
    <>
      <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
        {getString('cd.terraformVarFiles')}
      </Label>
      {get(inputSetData?.template?.spec, `${fieldPath}.varFiles`)?.map(
        (varFile: TerraformVarFileWrapper, index: number) => {
          if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
            return (
              <InlineVarFileInputSet<TerraformVarFileWrapper>
                readonly={readonly}
                stepViewType={stepViewType}
                allowableTypes={allowableTypes}
                varFilePath={`${path}.spec.${fieldPath}.varFiles[${index}]`}
                inlineVarFile={varFile}
              />
            )
          } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
            return <RemoteVarSection remoteVar={varFile} index={index} {...props} />
          }
          return <></>
        }
      )}
    </>
  )
}
