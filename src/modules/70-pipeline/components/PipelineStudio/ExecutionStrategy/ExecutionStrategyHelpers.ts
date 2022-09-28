/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import type { StringsMap } from 'stringTypes'
import { InstanceTypes } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import type { InstanceFieldValue } from '@common/components/InstanceDropdownField/InstanceDropdownField'

export enum PackageTypeItems {
  WAR = 'WAR',
  RPM = 'RPM',
  JAR = 'JAR',
  ZIP = 'ZIP',
  TAR = 'TAR',
  OTHERS = 'OTHER',
  APPLICATION = 'IIS_APP',
  VIRTUAL_DIRECTORY = 'IIS_VirtualDirectory',
  WEBSITE = 'IIS'
}
export enum ExecutionType {
  BASIC = 'Basic',
  CANARY = 'Canary',
  ROLLING = 'Rolling',
  DEFAULT = 'Default'
}

export interface PackageTypeItem {
  label: keyof StringsMap
  value: PackageTypeItems
}

export const packageTypeItemsWinrm: PackageTypeItem[] = [
  {
    label: 'pipeline.phasesForm.packageTypesWinrm.application',
    value: PackageTypeItems.APPLICATION
  },
  {
    label: 'pipeline.phasesForm.packageTypesWinrm.virtualDir',
    value: PackageTypeItems.VIRTUAL_DIRECTORY
  },
  {
    label: 'pipeline.phasesForm.packageTypesWinrm.website',
    value: PackageTypeItems.WEBSITE
  },
  {
    label: 'common.other',
    value: PackageTypeItems.OTHERS
  }
]

export const packageTypeItems: PackageTypeItem[] = [
  {
    label: 'pipeline.phasesForm.packageTypes.jar',
    value: PackageTypeItems.JAR
  },
  {
    label: 'pipeline.phasesForm.packageTypes.tar',
    value: PackageTypeItems.TAR
  },
  {
    label: 'pipeline.phasesForm.packageTypes.war',
    value: PackageTypeItems.WAR
  },
  {
    label: 'pipeline.phasesForm.packageTypes.rpm',
    value: PackageTypeItems.RPM
  },

  {
    label: 'pipeline.phasesForm.packageTypes.zip',
    value: PackageTypeItems.ZIP
  },
  {
    label: 'common.other',
    value: PackageTypeItems.OTHERS
  }
]

export const onPhaseFieldChange = (
  formikProps: any,
  fieldName: string,
  index: number,
  value: InstanceFieldValue,
  field: InstanceFieldValue
): void => {
  const currentValue = get(formikProps?.values, `${fieldName}[${index}]`)

  if (currentValue.type !== value.type) {
    formikProps.setFieldValue(
      fieldName,
      get(formikProps?.values, fieldName).map(() => ({
        type: value.type || field.type,
        spec:
          value.type === InstanceTypes.Instances
            ? {
                count: currentValue?.spec?.count || 1
              }
            : {
                percentage: currentValue?.spec?.percentage || 1
              }
      }))
    )
    return
  }
  formikProps.setFieldValue(`${fieldName}[${index}]`, { ...value })
}

export const getPackageLabel = (packageTypes: PackageTypeItem[], value: string): keyof StringsMap => {
  const packageType = packageTypes.find((p: PackageTypeItem) => p.value === value)

  return packageType ? packageType.label : 'common.other'
}
