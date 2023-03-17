/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useToggleOpen } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { MultiTypeEnvironmentField } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import type { OrgAccountLevelServiceEnvFieldProps } from './OrgAccountLevelServiceEnvField.types'
import { onValueChange } from './OrgAccountLevelServiceEnvField.utils'
import { COMMON_FIELDS_PROPS } from './OrgAccountLevelServiceEnvField.constants'
import { ServiceEnvModal } from './ServiceEnvModal'

export default function OrgAccountLevelServiceEnvField({
  isTemplate,
  serviceOnSelect,
  environmentOnSelect
}: OrgAccountLevelServiceEnvFieldProps): JSX.Element {
  const { getString } = useStrings()
  const { isOpen: isAddServiceModalOpen, open: openAddServiceModal, close: closeAddServiceModal } = useToggleOpen()
  const { isOpen: isAddEnvModalOpen, open: openAddEnvModal, close: closeAddEnvModal } = useToggleOpen()

  return (
    <>
      <MultiTypeServiceField
        name="serviceRef"
        placeholder={getString('cv.selectCreateService')}
        label={getString('cv.healthSource.serviceLabel')}
        isOnlyFixedType={!isTemplate}
        openAddNewModal={openAddServiceModal}
        setRefValue={isTemplate}
        onChange={service => onValueChange({ value: service, isTemplate, onSuccess: serviceOnSelect })}
        {...COMMON_FIELDS_PROPS}
      />
      <MultiTypeEnvironmentField
        name="environmentRef"
        label={getString('cv.healthSource.environmentLabel')}
        placeholder={getString('cv.selectOrCreateEnv')}
        isOnlyFixedType={!isTemplate}
        setRefValue={isTemplate}
        openAddNewModal={openAddEnvModal}
        onChange={env => onValueChange({ value: env, isTemplate, onSuccess: environmentOnSelect })}
        {...COMMON_FIELDS_PROPS}
      />
      <ServiceEnvModal
        service={{
          onSelect: serviceOnSelect,
          isModalOpen: isAddServiceModalOpen,
          closeModal: closeAddServiceModal
        }}
        environment={{
          onSelect: environmentOnSelect,
          isModalOpen: isAddEnvModalOpen,
          closeModal: closeAddEnvModal
        }}
      />
    </>
  )
}
