/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { isEmpty, cloneDeep } from 'lodash-es'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import type { StringsMap } from 'stringTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { ChangeSourceDTO, MonitoredServiceDTO } from 'services/cv'
import { Connectors } from '@connectors/constants'
import { getIconBySource } from '../ChangeSource.utils'
import {
  ChangeSourceConnectorOptions,
  ChangeSourceFieldNames,
  ChangeSourceCategoryOptions,
  ChangeSourceCategoryName,
  ChangeSourceTypes
} from './ChangeSourceDrawer.constants'
import type { UpdatedChangeSourceDTO } from './ChangeSourceDrawer.types'

export const createChangesourceList = (
  changeSource: ChangeSourceDTO[],
  healthSourcesPayload: ChangeSourceDTO
): ChangeSourceDTO[] => {
  let updatedHealthSources = []
  if (
    changeSource &&
    !isEmpty(changeSource) &&
    changeSource.some(
      (el: any) => el?.identifier === healthSourcesPayload?.identifier && el?.type === healthSourcesPayload?.type
    )
  ) {
    updatedHealthSources = changeSource?.map((el: any) =>
      el?.identifier === healthSourcesPayload?.identifier ? healthSourcesPayload : el
    )
  } else if (changeSource && !isEmpty(changeSource)) {
    updatedHealthSources = [...changeSource, healthSourcesPayload]
  } else {
    updatedHealthSources = [healthSourcesPayload]
  }
  return updatedHealthSources
}

export const createCardOptions = (
  category: ChangeSourceDTO['category'],
  getString: UseStringsReturn['getString']
): Item[] => {
  return (
    cloneDeep(ChangeSourceConnectorOptions)
      .filter(item => item.category === category)
      .map(item => {
        item.icon = getIconBySource(item.value as ChangeSourceDTO['type'])
        item.label = getString(item.label.toString() as keyof StringsMap)
        return item
      }) || []
  )
}

export const validateChangeSource = (
  values: ChangeSourceDTO,
  tableData: ChangeSourceDTO[],
  isEdit: boolean,
  getString: UseStringsReturn['getString']
): any => {
  const { identifier, name, category, type, spec } = values
  const errors: {
    identifier?: string
    name?: string
    category?: string
    type?: string
    spec?: { [key: string]: any }
  } = {}

  if (!isEdit && tableData?.some(item => item.identifier === identifier)) {
    errors.name = getString('cv.changeSource.duplicateIdentifier')
  }
  if (!name) {
    errors.name = getString('cv.changeSource.selectChangeSourceName')
  }
  if (!category) {
    errors.category = getString('cv.changeSource.selectChangeSourceProvider')
  }
  if (!type) {
    errors.type = getString('cv.changeSource.selectChangeSourceType')
  }

  if (!spec?.connectorRef && type !== ChangeSourceTypes.HarnessCDNextGen && type !== ChangeSourceTypes.HarnessCD) {
    errors.spec = {
      connectorRef: getString('cv.onboarding.selectProductScreen.validationText.connectorRef')
    }
  }

  const specError = validateChangeSourceSpec(type, spec, errors?.spec || {}, getString)

  if (!isEmpty(specError)) {
    errors.spec = specError
  }

  return errors
}

export const validateChangeSourceSpec = (
  type: ChangeSourceDTO['type'],
  spec: ChangeSourceDTO['spec'],
  errorSpec: { [key: string]: string },
  getString: UseStringsReturn['getString']
): { [key: string]: string } => {
  let errors = { ...errorSpec }
  switch (type) {
    case ChangeSourceTypes.PagerDuty:
      return spec?.pagerDutyServiceId
        ? {}
        : { ...errors, pagerDutyServiceId: getString('cv.changeSource.PageDuty.selectPagerDutyService') }
    case ChangeSourceTypes.HarnessCD:
      if (!spec?.harnessApplicationId) {
        errors = {
          ...errors,
          harnessApplicationId: getString('cv.changeSource.HarnessCDCurrentGen.selectHarnessAppId')
        }
      }
      if (!spec?.harnessEnvironmentId) {
        errors = { ...errors, harnessEnvironmentId: getString('cv.changeSource.HarnessCDCurrentGen.selectHarnessEnv') }
      }
      if (!spec?.harnessServiceId) {
        errors = { ...errors, harnessServiceId: getString('cv.changeSource.HarnessCDCurrentGen.selectHarnessService') }
      }
      return errors
    case ChangeSourceTypes.K8sCluster:
      return spec?.isConnectorInvalid === true ? { ...errors, isConnectorInvalid: getString('invalidText') } : errors

    default:
      return {}
  }
}

export const getChangeSourceOptions = (
  getString: UseStringsReturn['getString'],
  type?: MonitoredServiceDTO['type']
): SelectOption[] => {
  const options: SelectOption[] = []
  for (const category of ChangeSourceCategoryOptions) {
    if (
      (type === 'Application' && category.value === ChangeSourceCategoryName.INFRASTRUCTURE) ||
      (type === 'Infrastructure' && category.value === ChangeSourceCategoryName.DEPLOYMENT)
    ) {
      continue
    }

    options.push({ label: getString(category.label as keyof StringsMap), value: category.value })
  }
  return options
}

export const updateSpecByType = (data: ChangeSourceDTO): ChangeSourceDTO['spec'] => {
  switch (data?.type) {
    case ChangeSourceTypes.PagerDuty:
      return {
        connectorRef: data?.spec?.connectorRef,
        pagerDutyServiceId: data?.spec?.pagerDutyServiceId
      }
    case ChangeSourceTypes.K8sCluster:
      return {
        connectorRef: data?.spec?.connectorRef
      }
    case ChangeSourceTypes.HarnessCD:
      return {
        harnessApplicationId: data?.spec?.harnessApplicationId?.value,
        harnessServiceId: data?.spec?.harnessServiceId?.value,
        harnessEnvironmentId: data?.spec?.harnessEnvironmentId?.value
      }
    default:
      return {}
  }
}

export const buildInitialData = (categoryOptions: SelectOption[]): UpdatedChangeSourceDTO => {
  return {
    [ChangeSourceFieldNames.CATEGORY]: categoryOptions[0].value,
    [ChangeSourceFieldNames.TYPE]: preSelectChangeSourceConnectorOnCategoryChange(categoryOptions[0].value as string),
    spec: {},
    enabled: true
  }
}
export const preSelectChangeSourceConnectorOnCategoryChange = (categoryName: string): string => {
  switch (categoryName) {
    case ChangeSourceCategoryName.ALERT:
      return Connectors.PAGER_DUTY
    case ChangeSourceCategoryName.INFRASTRUCTURE:
      return Connectors.KUBERNETES_CLUSTER
    default:
      return ''
  }
}
