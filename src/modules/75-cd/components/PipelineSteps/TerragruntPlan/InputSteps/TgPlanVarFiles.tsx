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
import type { TerragruntVarFileWrapper } from 'services/cd-ng'
import { TerraformStoreTypes } from '../../Common/Terraform/TerraformInterfaces'
import RemoteVarSection from './RemoteVarSection'
import type { TerragruntPlanProps } from '../../Common/Terragrunt/TerragruntInterface'
import InlineVarFileInputSet from '../../Common/VarFile/InlineVarFileInputSet'

export default function TgPlanVarFiles(props: TerragruntPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, path, allowableTypes, stepViewType, readonly } = props

  return (
    <>
      <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
        {getString('cd.terraformVarFiles')}
      </Label>
      {get(inputSetData?.template, 'spec.configuration.varFiles')?.map(
        (varFile: TerragruntVarFileWrapper, index: number) => {
          const { type } = varFile.varFile
          if (type === TerraformStoreTypes.Inline) {
            return (
              <InlineVarFileInputSet<TerragruntVarFileWrapper>
                readonly={readonly}
                stepViewType={stepViewType}
                allowableTypes={allowableTypes}
                varFilePath={`${path}.spec.configuration.varFiles[${index}]`}
                inlineVarFile={varFile}
              />
            )
          } else if (type === TerraformStoreTypes.Remote) {
            return <RemoteVarSection remoteVar={varFile} index={index} {...props} />
          }
          return <></>
        }
      )}
    </>
  )
}
