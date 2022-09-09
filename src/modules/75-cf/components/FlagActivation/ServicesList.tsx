/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  Checkbox,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Heading,
  Layout,
  ModalDialog,
  Page,
  TableV2,
  Tag,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { clone } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import routes from '@common/RouteDefinitions'
import type { Failure, ServiceResponseDTO } from 'services/cd-ng'
import { getErrorMessage, CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import useResponseError from '@cf/hooks/useResponseError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useStrings } from 'framework/strings'
import { useGetServiceList } from 'services/cd-ng'
import { usePatchFeature } from 'services/cf'
import type { Feature } from 'services/cf'
import { NoData } from '../NoData/NoData'
import ServicesFooter from './ServicesFooter'
import NoServices from './images/NoServices.svg'

import css from './ServicesList.module.scss'

export type ServiceType = {
  name?: string
  identifier?: string
}

export type PaginationProps = {
  itemCount: number
  pageSize: number
  pageCount: number
  pageIndex: number
  gotoPage: (pageNumber: number) => void
}

type queryParamsType = {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
}
export interface EditServicesProps {
  closeModal: () => void
  loading: boolean
  filteredServices: ServiceResponseDTO[]
  paginationProps: PaginationProps
  queryParams: queryParamsType
  onChange: (service: ServiceType) => void
  onSearch: (name: string) => void
  editedServices: ServiceType[]
  refetchServices: () => Promise<void>
  searchTerm: string
  serviceError: GetDataError<Failure | Error> | null
  onSave: () => void
}

const EditServicesModal: FC<EditServicesProps> = ({
  closeModal,
  loading,
  editedServices,
  filteredServices = [],
  onChange,
  onSave,
  onSearch,
  paginationProps,
  searchTerm,
  serviceError,
  refetchServices,
  queryParams
}) => {
  const { getString } = useStrings()
  const history = useHistory()

  const noServices = !filteredServices?.length && !loading && !searchTerm
  const isEmptyState = !filteredServices?.length && !loading

  const column = [
    {
      id: 'name',
      onChange: onChange,
      Cell: ({ row }: { row: { original: ServiceResponseDTO } }) => (
        <Checkbox
          label={row.original.name}
          name={`service.${row.original.name}.added`}
          checked={editedServices.some((serv: ServiceType) => serv.identifier === row.original.identifier)}
        />
      )
    }
  ]

  return (
    <ModalDialog
      width={650}
      height={700}
      enforceFocus={false}
      isOpen
      title={getString('common.monitoredServices')}
      onClose={closeModal}
      toolbar={
        !noServices && (
          <ExpandingSearchInput
            name="serviceSearch"
            alwaysExpanded
            placeholder={getString('cf.featureFlagDetail.searchService')}
            throttle={200}
            onChange={onSearch}
          />
        )
      }
      footer={
        !noServices && (
          <ServicesFooter loading={loading} onSave={onSave} onClose={closeModal} paginationProps={paginationProps} />
        )
      }
    >
      {loading && <ContainerSpinner height="100%" margin="0" flex={{ align: 'center-center' }} />}

      {isEmptyState && (
        <Container flex={{ justifyContent: 'center' }} padding="xxxlarge">
          <NoData
            imageURL={NoServices}
            buttonProps={{ icon: 'plus' }}
            buttonText={noServices ? getString('newService') : undefined}
            onClick={() =>
              history.push(
                routes.toCVAddMonitoringServicesSetup({
                  accountId: queryParams.accountIdentifier,
                  ...queryParams
                })
              )
            }
            message={getString('cf.featureFlagDetail.noServices')}
          />
        </Container>
      )}

      {serviceError && <Page.Error message={getErrorMessage(serviceError)} onClick={refetchServices} />}

      {!serviceError && (
        <Layout.Horizontal
          style={{ flexWrap: 'wrap' }}
          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          spacing="small"
        >
          <TableV2
            className={css.serviceTable}
            columns={column}
            data={filteredServices}
            hideHeaders
            onRowClick={(service: ServiceResponseDTO) =>
              onChange({ name: service.name, identifier: service.identifier })
            }
          />
        </Layout.Horizontal>
      )}
    </ModalDialog>
  )
}
export interface ServicesListProps {
  featureFlag: Feature
  refetchFlag: () => void
}

const ServicesList: React.FC<ServicesListProps> = props => {
  const { featureFlag, refetchFlag } = props
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { handleResponseError } = useResponseError()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()

  const [showModal, setShowModal] = useState<boolean>(false)
  const [services, setServices] = useState<ServiceType[]>([])
  const [initialServices, setInitialServices] = useState<ServiceType[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)

  const queryParams = {
    accountIdentifier,
    orgIdentifier,
    projectIdentifier
  }

  const applySearch = (allServices: ServiceResponseDTO[], searchedService: string): ServiceResponseDTO[] => {
    if (!searchedService) {
      return allServices
    }
    return allServices.filter(item => {
      const term = searchedService.toLocaleLowerCase()
      return (
        (item?.identifier || '').toLocaleLowerCase().indexOf(term) !== -1 ||
        (item?.name || '').toLocaleLowerCase().indexOf(term) !== -1
      )
    })
  }

  useEffect(() => {
    if (featureFlag.services) {
      setServices(featureFlag.services)
      setInitialServices(featureFlag.services)
    }
  }, [featureFlag])

  const {
    data: servicesResponse,
    loading,
    error,
    refetch
  } = useGetServiceList({
    queryParams: {
      ...queryParams,
      searchTerm,
      page,
      size: CF_DEFAULT_PAGE_SIZE
    }
  })

  useEffect(() => {
    const serviceData = servicesResponse?.data?.content
      ?.filter(serviceContent => serviceContent.service !== undefined)
      .map(serviceContent => serviceContent.service as ServiceResponseDTO)

    if (serviceData) {
      setFilteredServices(applySearch(serviceData, searchTerm))
    }
  }, [servicesResponse?.data?.content, searchTerm])

  const handleChange = (service: ServiceType): void => {
    const { name, identifier } = service
    const updatedServices = clone(services)

    const serviceIndex = updatedServices?.findIndex((s: ServiceType) => s.identifier === identifier)

    if (serviceIndex !== -1) {
      updatedServices.splice(serviceIndex, 1)
    } else {
      updatedServices.push({ name, identifier })
    }
    setServices(updatedServices)
  }

  const onSearchInputChanged = useCallback(
    (name: string) => {
      setSearchTerm(name)
    },
    [setSearchTerm]
  )

  const { mutate: patchServices, loading: patchLoading } = usePatchFeature({
    identifier: featureFlag.identifier,
    queryParams: {
      projectIdentifier: featureFlag.project,
      environmentIdentifier: featureFlag.envProperties?.environment,
      accountIdentifier,
      orgIdentifier
    }
  })

  const handleSave = async (): Promise<void> => {
    const add = services.filter(s => !initialServices.includes(s))

    const removedAndReadded = initialServices.filter(s => {
      return add.find(added => added.identifier === s.identifier)
    })

    // checks all newly added services weren't removed and readded
    // and checks that removed and readded services doesn't get removed
    const validateRemovedReaddedServices = (servs: ServiceType[]): ServiceType[] =>
      servs.filter(added => {
        return !removedAndReadded.find(readded => {
          return added.identifier === readded.identifier
        })
      })

    const addedServices = validateRemovedReaddedServices(add).map((s: ServiceType) => ({
      kind: 'addService',
      parameters: {
        name: s.name,
        identifier: s.identifier
      }
    }))

    const remove = initialServices.filter(s => !services.includes(s))

    const removedServices = validateRemovedReaddedServices(remove).map((s: ServiceType) => ({
      kind: 'removeService',
      parameters: {
        identifier: s.identifier
      }
    }))

    const patchPayload = {
      instructions: [...removedServices, ...addedServices]
    }

    try {
      await patchServices(patchPayload)
      setShowModal(false)
      refetchFlag()
      showSuccess(getString('cf.featureFlagDetail.serviceUpdateSuccess'))
    } catch (err) {
      handleResponseError(err)
    }
  }

  return (
    <Layout.Vertical margin={{ bottom: 'xlarge' }}>
      <Layout.Horizontal flex={{ align: 'center-center' }} margin={{ bottom: 'small' }}>
        <Layout.Vertical margin={{ bottom: 'small' }}>
          <Heading level={5} font={{ variation: FontVariation.H5 }}>
            {getString('services')}
          </Heading>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500}>
            {getString('cf.featureFlagDetail.serviceDescription')}
          </Text>
        </Layout.Vertical>

        <FlexExpander />
        <Button minimal icon="Edit" onClick={() => setShowModal(true)} aria-label="edit-services" />
        {showModal && (
          <EditServicesModal
            closeModal={() => {
              setServices(initialServices)
              setShowModal(false)
              setSearchTerm('')
              setPage(0)
            }}
            loading={loading || patchLoading}
            onChange={handleChange}
            onSave={handleSave}
            onSearch={onSearchInputChanged}
            paginationProps={{
              itemCount: servicesResponse?.data?.totalItems || 0,
              pageSize: CF_DEFAULT_PAGE_SIZE,
              pageCount: servicesResponse?.data?.totalPages ?? 1,
              pageIndex: servicesResponse?.data?.pageIndex ?? 0,
              gotoPage: pageNumber => setPage(pageNumber)
            }}
            editedServices={services}
            filteredServices={filteredServices}
            searchTerm={searchTerm}
            serviceError={error}
            refetchServices={refetch}
            queryParams={queryParams}
          />
        )}
      </Layout.Horizontal>
      <Layout.Horizontal
        style={{ flexWrap: 'wrap' }}
        flex={{ alignItems: 'start', justifyContent: 'flex-start' }}
        spacing="small"
      >
        {featureFlag?.services?.map((service: ServiceType, idx: number) => {
          return (
            <Tag className={css.displayTags} key={idx}>
              {service.name}
            </Tag>
          )
        })}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default ServicesList
