/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useToggleOpen } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { MultiTypeEnvironmentField } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import type { OrgAccountLevelServiceEnvFieldProps } from './OrgAccountLevelServiceEnvField.types'
import { onValueChange, shouldShowServiceEnvironmentField } from './OrgAccountLevelServiceEnvField.utils'
import { COMMON_FIELDS_PROPS } from './OrgAccountLevelServiceEnvField.constants'
import { ServiceEnvModal } from './ServiceEnvModal'
import { MonitoredServiceType } from '../../MonitoredServiceOverview.constants'
import css from './OrgAccountLevelServiceEnvField.module.scss'

export default function OrgAccountLevelServiceEnvField({
  isInputSet,
  isTemplate,
  serviceOnSelect,
  environmentOnSelect
}: OrgAccountLevelServiceEnvFieldProps): JSX.Element {
  const { getString } = useStrings()
  const { values } =
    useFormikContext<{ type: ValueOf<typeof MonitoredServiceType>; serviceRef?: string; environmentRef?: string }>()
  const { serviceRef, environmentRef } = values
  const isInfra = values?.type === MonitoredServiceType.INFRASTRUCTURE
  const { isOpen: isAddServiceModalOpen, open: openAddServiceModal, close: closeAddServiceModal } = useToggleOpen()
  const { isOpen: isAddEnvModalOpen, open: openAddEnvModal, close: closeAddEnvModal } = useToggleOpen()
  const { showService, showEnvironment } = shouldShowServiceEnvironmentField({ isInputSet, serviceRef, environmentRef })

  return (
    <>
      {showService && (
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
      )}
      {showEnvironment && (
        <MultiTypeEnvironmentField
          name="environmentRef"
          className={cx({ [css.multiSelectEnvDropdown]: isInfra })}
          label={getString('cv.healthSource.environmentLabel')}
          placeholder={getString('cv.selectOrCreateEnv')}
          isOnlyFixedType={!isTemplate}
          setRefValue={isTemplate}
          openAddNewModal={openAddEnvModal}
          isMultiSelect={isInfra}
          onChange={env => onValueChange({ value: env, isTemplate, onSuccess: environmentOnSelect })}
          {...COMMON_FIELDS_PROPS}
        />
      )}
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
