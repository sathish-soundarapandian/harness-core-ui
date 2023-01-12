/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { ServiceResponseDTO } from 'services/cd-ng'
import type { ResponsePageUserJourneyResponse } from 'services/cv'
import { SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { ServiceMultiSelectOrCreateProps } from '@cv/components/HarnessServiceAndEnvironment/components/ServiceMultiSelectOrCreate/ServiceMultiSelectOrCreate'
import type { ServiceSelectOrCreateProps } from '@cv/components/HarnessServiceAndEnvironment/components/ServiceSelectOrCreate/ServiceSelectOrCreate'

export function getUserJourneysData(userJourneysData: ResponsePageUserJourneyResponse | null): SelectOption[] {
  return (userJourneysData?.data?.content?.map(el => ({
    label: el?.userJourney?.name,
    value: el?.userJourney?.identifier
  })) || []) as SelectOption[]
}

interface CreateServiceProps {
  isMultiSelect: boolean
  userJourneysLoading: boolean
  userJourneyOptions: SelectOption[]
  getString: UseStringsReturn['getString']
  handleCreateUserJourney: (newOption: ServiceResponseDTO) => Promise<void>
  activeUserJourney: any[] | SelectOption | undefined
  onChange: (label: string, value: string[] | string) => void
}

export const createServiceProps = ({
  onChange,
  getString,
  isMultiSelect,
  activeUserJourney,
  userJourneysLoading,
  userJourneyOptions,
  handleCreateUserJourney
}: CreateServiceProps): ServiceSelectOrCreateProps | ServiceMultiSelectOrCreateProps => {
  const serviceProps = {
    name: getString('cv.slos.userJourney'),
    options: userJourneyOptions,
    loading: userJourneysLoading,
    skipServiceCreateOrUpdate: true,
    onSelect: (selectedUserJourney: SelectOption | MultiSelectOption[]) =>
      onChange(
        SLOV2FormFields.USER_JOURNEY_REF,
        Array.isArray(selectedUserJourney)
          ? selectedUserJourney.map(userJpurney => userJpurney.value as string)
          : (selectedUserJourney.value as string)
      ),
    onNewCreated: handleCreateUserJourney,
    modalTitle: getString('cv.slos.userJourney'),
    placeholder: getString('cv.slos.userJourneyPlaceholder')
  }

  const items =
    isMultiSelect && Array.isArray(activeUserJourney)
      ? userJourneyOptions
          ?.map(item => {
            if (activeUserJourney?.includes(item?.value)) {
              return item
            }
          })
          .filter(item => item)
      : activeUserJourney

  return isMultiSelect
    ? ({ ...serviceProps, item: items } as ServiceSelectOrCreateProps)
    : ({ ...serviceProps, item: items } as ServiceMultiSelectOrCreateProps)
}

export const getActiveUserJourney = (
  userJourneyRef: string | SelectOption | MultiSelectOption | undefined,
  isMultiSelect: boolean | undefined,
  userJourneyOptions: SelectOption[]
): MultiSelectOption[] | SelectOption | undefined => {
  return Array.isArray(userJourneyRef) && isMultiSelect
    ? userJourneyRef.map(userJourney => userJourney.value || userJourney)
    : userJourneyOptions?.find(userJourney => userJourney.value === userJourneyRef)
}
