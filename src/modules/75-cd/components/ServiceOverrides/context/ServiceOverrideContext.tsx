import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cloneDeep, defaultTo, isEmpty, noop } from 'lodash-es'

import { PageSpinner, useToaster } from '@harness/uicore'
import {
  useDeleteServiceOverrideV2,
  useGetServiceOverrideListV2,
  useUpdateServiceOverrideV2,
  useUpsertServiceOverrideV2
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { ProjectPathProps, RequiredField } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type {
  ServiceOverrideRowFormState,
  ServiceOverrideRowProps,
  ServiceOverridesResponseDTOV2
} from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import {
  formDeleteOverrideResponseSpec,
  formListRowItems,
  formUpdateOverrideResponseSpec,
  shouldDeleteOverrideCompletely
} from './ServiceOverrideContextUtils'

interface ServiceOverridesContextInterface {
  canCreateNew: boolean
  setCanCreateNewOrEdit: React.Dispatch<React.SetStateAction<boolean>>
  serviceOverrideType: Required<ServiceOverridesResponseDTOV2>['type']
  handleNewOverride(): void
  onAdd(values: ServiceOverrideRowFormState): void
  onClone(rowIndex: number): void
  onEdit(rowIndex: number): void
  onUpdate(rowIndex: number, values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>): void
  onDelete(rowIndex: number): void
  onDiscard(): void
  listRowItems: ServiceOverrideRowProps[]
}

interface ServiceOverridesProviderProps {
  serviceOverrideType: Required<ServiceOverridesResponseDTOV2>['type']
}

const ServiceOverridesContext = createContext<ServiceOverridesContextInterface>({
  serviceOverrideType: 'ENV_GLOBAL_OVERRIDE',
  handleNewOverride: noop,
  canCreateNew: true,
  setCanCreateNewOrEdit: noop,
  onAdd: noop,
  onClone: noop,
  onEdit: noop,
  onUpdate: noop,
  onDelete: noop,
  onDiscard: noop,
  listRowItems: []
})

export function ServiceOverridesProvider({
  children,
  serviceOverrideType
}: React.PropsWithChildren<ServiceOverridesProviderProps>): React.ReactElement {
  const { getString } = useStrings()
  const { showSuccess, showError, showWarning } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const commonQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )

  const [page] = useState(0)

  const [canCreateNew, setCanCreateNewOrEdit] = useState(true)
  const [listRowItems, setListRowItems] = useState<ServiceOverrideRowProps[]>([])

  const {
    data,
    loading: loadingServiceOverridesList,
    refetch: refetchServiceOverridesList
  } = useGetServiceOverrideListV2({
    queryParams: {
      ...commonQueryParams,
      type: serviceOverrideType,
      page: 0
    }
  })

  useEffect(() => {
    if (!loadingServiceOverridesList && data?.data?.content && !isEmpty(data)) {
      setListRowItems(formListRowItems(data?.data?.content as ServiceOverridesResponseDTOV2[]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingServiceOverridesList])

  const handleNewOverride = (): void => {
    if (canCreateNew) {
      setCanCreateNewOrEdit(false)
      setListRowItems(c => [{ isNew: true, isEdit: true, isClone: false, rowIndex: -1, groupKey: '' }, ...c])
    } else {
      showWarning(getString('common.serviceOverrides.editablePlaceholderExists'))
    }
  }

  const { mutate: createServiceOverride, loading: loadingCreateServiceOverride } = useUpsertServiceOverrideV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onAdd = (values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>): void => {
    const {
      environmentRef,
      serviceRef,
      infraIdentifier,
      variables,
      manifests,
      configFiles,
      applicationSettings,
      connectionStrings
    } = values

    createServiceOverride({
      type: serviceOverrideType,
      environmentRef,
      infraIdentifier,
      serviceRef,
      orgIdentifier,
      projectIdentifier,
      spec: {
        ...(variables && { variables }),
        ...(manifests && { manifests }),
        ...(configFiles && { configFiles }),
        ...(applicationSettings && { applicationSettings }),
        ...(connectionStrings && { connectionStrings })
      }
    })
      .then(() => {
        setCanCreateNewOrEdit(true)
        refetchServiceOverridesList({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            type: serviceOverrideType,
            page
          }
        })
      })
      .catch(e => {
        setCanCreateNewOrEdit(true)
        showError(getRBACErrorMessage(e))
      })
  }

  const { mutate: deleteServiceOverride, loading: loadingDeleteServiceOverride } = useDeleteServiceOverrideV2({})
  const { mutate: updateServiceOverride, loading: loadingUpdateServiceOverride } = useUpdateServiceOverrideV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onDelete = (rowIndex: number): void => {
    const rowItemToDelete = listRowItems[rowIndex] as RequiredField<ServiceOverrideRowProps, 'overrideDetails'>
    const overrideResponse = rowItemToDelete.overrideResponse as ServiceOverridesResponseDTOV2

    if (shouldDeleteOverrideCompletely(overrideResponse)) {
      deleteServiceOverride(overrideResponse.identifier, {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          ...commonQueryParams
        }
      })
        .then(() => {
          refetchServiceOverridesList({
            queryParams: {
              ...commonQueryParams,
              type: serviceOverrideType,
              page
            }
          })
          showSuccess('Successfully deleted service override with identifier: ' + overrideResponse?.identifier)
        })
        .catch(e => {
          showError(getRBACErrorMessage(e))
        })
    } else {
      updateServiceOverride({
        ...overrideResponse,
        spec: {
          ...formDeleteOverrideResponseSpec(overrideResponse.spec, rowItemToDelete.overrideDetails)
        }
      })
        .then(() => {
          refetchServiceOverridesList({
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier,
              type: serviceOverrideType,
              page
            }
          })
          showSuccess('Successfully deleted service override')
        })
        .catch(e => {
          showError(getRBACErrorMessage(e))
        })
    }
  }

  const onEdit = (rowIndex: number): void => {
    if (canCreateNew) {
      setCanCreateNewOrEdit(false)
      setListRowItems(c => c.map(dec => (dec.rowIndex === rowIndex ? { ...dec, isEdit: true } : dec)))
    } else {
      showWarning(getString('common.serviceOverrides.editablePlaceholderExists'))
    }
  }

  const onUpdate = (rowIndex: number, values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>): void => {
    const rowItemToUpdate = listRowItems[rowIndex % 1 === 0 ? rowIndex : rowIndex + 0.5] as RequiredField<
      ServiceOverrideRowProps,
      'overrideDetails'
    >
    const overrideResponse = rowItemToUpdate.overrideResponse as ServiceOverridesResponseDTOV2

    updateServiceOverride({
      ...overrideResponse,
      environmentRef: values.environmentRef,
      serviceRef: defaultTo(values.serviceRef, overrideResponse.serviceRef),
      infraIdentifier: defaultTo(values.infraIdentifier, overrideResponse.infraIdentifier),
      spec: {
        ...formUpdateOverrideResponseSpec(cloneDeep(overrideResponse.spec), values, rowItemToUpdate)
      }
    })
      .then(() => {
        setCanCreateNewOrEdit(true)
        refetchServiceOverridesList({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            type: serviceOverrideType,
            page
          }
        })
        showSuccess('Successfully updated service override')
      })
      .catch(e => {
        showError(getRBACErrorMessage(e))
      })
  }

  const onClone = (rowIndex: number): void => {
    if (canCreateNew) {
      setCanCreateNewOrEdit(false)
      setListRowItems(c => {
        c.splice(rowIndex + 1, 0, { ...c[rowIndex], isEdit: true, isClone: true, rowIndex: rowIndex + 0.5 })
        return c
      })
    } else {
      showWarning(getString('common.serviceOverrides.editablePlaceholderExists'))
    }
  }

  const onDiscard = (): void => {
    if (data?.data?.content) {
      setCanCreateNewOrEdit(true)
      setListRowItems(formListRowItems(data?.data?.content as ServiceOverridesResponseDTOV2[]))
    }
  }

  const loading =
    loadingServiceOverridesList ||
    loadingCreateServiceOverride ||
    loadingUpdateServiceOverride ||
    loadingDeleteServiceOverride

  return (
    <ServiceOverridesContext.Provider
      value={{
        serviceOverrideType,
        canCreateNew,
        setCanCreateNewOrEdit,
        handleNewOverride,
        onAdd,
        onClone,
        onEdit,
        onUpdate,
        onDelete,
        onDiscard,
        listRowItems
      }}
    >
      {loading && <PageSpinner />}
      {children}
    </ServiceOverridesContext.Provider>
  )
}

export const useServiceOverridesContext = (): ServiceOverridesContextInterface => useContext(ServiceOverridesContext)
