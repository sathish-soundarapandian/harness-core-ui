/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FontVariation, Layout, Text } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { VariableOverride } from '../ServiceOverridesInterface'
import css from '../ServiceOverrides.module.scss'

interface ServiceVariablesOverridesListProps {
  variableOverrides: VariableOverride[]
  isReadonly: boolean
  onServiceVarEdit: (index: number) => void
  onServiceVarDelete: (index: number) => void
}
const rbacPermission = {
  resource: {
    resourceType: ResourceType.ENVIRONMENT
  },
  permission: PermissionIdentifier.EDIT_ENVIRONMENT
}
function ServiceVariablesOverridesList({
  variableOverrides,
  isReadonly,
  onServiceVarDelete,
  onServiceVarEdit
}: ServiceVariablesOverridesListProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      {!isEmpty(variableOverrides) && (
        <div className={cx(css.tableRow, css.headerRow)}>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('cd.configurationVariable')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('typeLabel')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('cd.overrideValue')}</Text>
        </div>
      )}
      {variableOverrides?.map?.((variable: VariableOverride, index: number) => (
        <div key={variable.name} className={cx(css.tableRow, css.rowValue)}>
          <Text>{variable.name}</Text>
          <Text>{variable.type}</Text>
          <Text>{variable.value}</Text>
          {!isReadonly && (
            <span>
              <Layout.Horizontal className={css.variableListButtons}>
                <RbacButton
                  icon="Edit"
                  tooltip={<String className={css.tooltip} stringID="common.editVariableType" />}
                  data-testid={`edit-variable-${index}`}
                  minimal
                  permission={rbacPermission}
                  onClick={() => onServiceVarEdit(index)}
                />
                <RbacButton
                  icon="main-trash"
                  data-testid={`delete-variable-${index}`}
                  tooltip={<String className={css.tooltip} stringID="common.removeThisVariable" />}
                  onClick={() => onServiceVarDelete(index)}
                  minimal
                  permission={rbacPermission}
                />
              </Layout.Horizontal>
            </span>
          )}
        </div>
      ))}
    </Layout.Vertical>
  )
}

export default ServiceVariablesOverridesList
