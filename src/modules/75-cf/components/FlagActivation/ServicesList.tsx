/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  Heading,
  Layout,
  ModalDialog,
  Page,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Tag } from '@blueprintjs/core'
import { clone } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import type { Failure } from 'services/cd-ng'
import { getErrorMessage } from '@cf/utils/CFUtils'
import useResponseError from '@cf/hooks/useResponseError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useStrings } from 'framework/strings'
import { ServiceDetailsDTO, useGetServiceDetails } from 'services/cd-ng'
import { usePatchFeature } from 'services/cf'
import type { Feature } from 'services/cf'

import css from './ServicesList.module.scss'

export type ServiceType = {
  name?: string
  identifier?: string
}

export type ServiceDataType = {
  serviceName: string
  serviceIdentifier: string
}
export interface EditServicesProps {
  closeModal: () => void
  loading: boolean
  allServices?: ServiceDetailsDTO[]
  onChange: (service: ServiceType) => void
  editedServices: ServiceType[]
  refetchServices: () => Promise<void>
  serviceError: GetDataError<Failure | Error> | null
  onSave: () => void
}

const EditServicesModal: FC<EditServicesProps> = ({
  closeModal,
  allServices,
  loading,
  editedServices,
  onChange,
  onSave,
  serviceError,
  refetchServices
}) => {
  const { getString } = useStrings()
  const noServices = Boolean(!allServices?.length && !loading)

  return (
    <ModalDialog
      className={css.servicesListModal}
      width={835}
      height={560}
      enforceFocus={false}
      isOpen
      title={getString('common.monitoredServices')}
      onClose={closeModal}
      footer={
        <Layout.Horizontal spacing={'small'}>
          <Button
            type="submit"
            text={getString('save')}
            intent="primary"
            variation={ButtonVariation.PRIMARY}
            disabled={loading}
            onClick={onSave}
          />
          <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={closeModal} />
        </Layout.Horizontal>
      }
    >
      {loading && <ContainerSpinner height="100%" margin="0" flex={{ align: 'center-center' }} />}

      {noServices && (
        <Container height="100%" flex={{ align: 'center-center' }}>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.H4, weight: 'light' }}>
            {getString('cf.featureFlagDetail.noServices')}
          </Text>
        </Container>
      )}

      {serviceError && <Page.Error message={getErrorMessage(serviceError)} onClick={refetchServices} />}

      {allServices && !serviceError && (
        <Layout.Horizontal
          style={{ flexWrap: 'wrap' }}
          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          spacing="small"
        >
          {allServices.map((service, idx) => {
            return (
              <Tag
                aria-label={`${service.serviceName}-${idx}`}
                round
                interactive
                onClick={() => onChange({ name: service.serviceName, identifier: service.serviceIdentifier })}
                className={css.tags}
                key={idx}
                large
                active={editedServices.some((serv: ServiceType) => serv.identifier === service.serviceIdentifier)}
              >
                {service.serviceName}
              </Tag>
            )
          })}
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

  const queryParams = {
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    startTime: 0,
    endTime: 0
  }

  useEffect(() => {
    if (featureFlag.services) {
      setServices(featureFlag.services)
      setInitialServices(featureFlag.services)
    }
  }, [featureFlag])

  const {
    data: serviceData,
    loading,
    error,
    refetch
  } = useGetServiceDetails({
    queryParams
  })

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

  const { mutate: patchServices, loading: patchLoading } = usePatchFeature({
    identifier: featureFlag.identifier,
    queryParams: {
      projectIdentifier: featureFlag.project as string,
      environmentIdentifier: featureFlag.envProperties?.environment as string,
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
            }}
            allServices={serviceData?.data?.serviceDeploymentDetailsList}
            loading={loading || patchLoading}
            onChange={handleChange}
            onSave={handleSave}
            editedServices={services}
            serviceError={error}
            refetchServices={refetch}
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
