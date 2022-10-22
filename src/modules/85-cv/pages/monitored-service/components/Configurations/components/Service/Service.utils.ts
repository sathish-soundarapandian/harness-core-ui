/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikContextType } from 'formik'
import { isEqual, omit } from 'lodash-es'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { MonitoredServiceDTO } from 'services/cv'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { NGMonitoredServiceTemplateInfoConfig } from '@cv/components/MonitoredServiceTemplate/components/MonitoredServiceTemplateCanvas.types'
import { MonitoredServiceType } from './components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import type { MonitoredServiceForm } from './Service.types'

export const getInitFormData = (
  defaultMonitoredService: MonitoredServiceDTO | undefined,
  isEdit: boolean,
  isTemplate = false,
  data?: MonitoredServiceDTO | NGMonitoredServiceTemplateInfoConfig,
  templateScope?: Scope
): MonitoredServiceForm => {
  if (isTemplate) {
    const templateValue = data as NGMonitoredServiceTemplateInfoConfig
    return {
      isEdit: false,
      name: templateValue?.name || '',
      identifier: templateValue?.identifier || '',
      description: '',
      tags: templateValue?.tags || {},
      serviceRef: templateScope !== Scope.PROJECT ? RUNTIME_INPUT_VALUE : templateValue?.spec?.serviceRef,
      type: MonitoredServiceType.APPLICATION as MonitoredServiceForm['type'],
      environmentRef: templateScope !== Scope.PROJECT ? RUNTIME_INPUT_VALUE : templateValue?.spec?.environmentRef,
      environmentRefList: [],
      sources: templateValue?.spec?.sources,
      dependencies: [],
      ...(templateValue?.notificationRuleRefs && {
        notificationRuleRefs: templateValue?.notificationRuleRefs
      })
    }
  }
  const monitoredServiceData = isEdit ? data : defaultMonitoredService
  const {
    name = '',
    identifier = '',
    description = '',
    tags = {},
    serviceRef = '',
    environmentRef = '',
    environmentRefList = [],
    sources,
    dependencies = [],
    type,
    notificationRuleRefs = []
  } = (monitoredServiceData || {}) as MonitoredServiceDTO

  return {
    isEdit,
    name,
    identifier,
    description,
    tags,
    serviceRef,
    type: (type as MonitoredServiceForm['type']) || MonitoredServiceType.APPLICATION,
    notificationRuleRefs,
    environmentRef,
    environmentRefList,
    sources,
    dependencies
  }
}

export const isCacheUpdated = (
  initialValues: MonitoredServiceForm | null | undefined,
  cachedInitialValues: MonitoredServiceForm | null | undefined
): boolean => {
  if (!cachedInitialValues) {
    return false
  }
  return !isEqual(omit(cachedInitialValues, 'dependencies'), omit(initialValues, 'dependencies'))
}

export const onSave = async ({
  formik,
  onSuccess
}: {
  formik: FormikContextType<any>
  onSuccess: (val: MonitoredServiceForm) => Promise<void>
}): Promise<void> => {
  const validResponse = await formik?.validateForm()
  if (!Object.keys(validResponse).length) {
    await onSuccess(formik?.values)
  } else {
    formik?.submitForm()
  }
}

export function updateMonitoredServiceDTOOnTypeChange(
  type: MonitoredServiceDTO['type'],
  monitoredServiceForm: MonitoredServiceForm
): MonitoredServiceDTO {
  const monitoredServiceDTO: MonitoredServiceDTO = omit(monitoredServiceForm, ['isEdit']) as MonitoredServiceDTO

  if (!monitoredServiceDTO.sources) {
    monitoredServiceDTO.sources = { changeSources: [], healthSources: [] }
  }

  monitoredServiceDTO.sources.changeSources =
    monitoredServiceDTO.sources.changeSources?.filter(source => {
      if (type === 'Application' && source.type !== 'K8sCluster') {
        return true
      }
      if (type === 'Infrastructure' && source.type !== 'HarnessCD' && source.type !== 'HarnessCDNextGen') {
        return true
      }
      return false
    }) || []

  monitoredServiceDTO.type = type
  return monitoredServiceDTO
}
