/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import {
  Container,
  SelectOption,
  useToaster,
  Utils,
  FormInput,
  ButtonVariation,
  Dialog,
  Formik,
  Text,
  Layout,
  MultiSelectOption
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { Classes } from '@blueprintjs/core'
import { Form } from 'formik'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import { HarnessServiceAsFormField } from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { useGetAllJourneys, useSaveUserJourney } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { LIST_USER_JOURNEYS_OFFSET, LIST_USER_JOURNEYS_PAGESIZE } from '@cv/pages/slos/CVSLOsListingPage.constants'
import { SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import CreateMonitoredServiceFromSLO from './components/CreateMonitoredServiceFromSLO/CreateMonitoredServiceFromSLO'
import type { ServiceAndEnv, SLONameProps } from './SLOName.types'
import { initialFormData } from './components/CreateMonitoredServiceFromSLO/CreateMonitoredServiceFromSLO.constants'
import { createServiceProps, getActiveUserJourney } from './SLOName.utils'
import { getUserJourneyOptions } from '../../components/CVCreateSLOV2/CVCreateSLOV2.utils'
import css from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.module.scss'

const SLOName = <T,>({
  formikProps,
  identifier,
  monitoredServicesLoading = false,
  monitoredServicesOptions = [],
  fetchingMonitoredServices,
  isMultiSelect
}: SLONameProps<T>): JSX.Element => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const TEXT_USER_JOURNEY = getString('cv.slos.userJourney')
  const { userJourneyRef } = formikProps.values as { userJourneyRef?: string | SelectOption | MultiSelectOption }
  const {
    data: userJourneysData,
    error: userJourneysError,
    refetch: fetchUserJourneys,
    loading: userJourneysLoading
  } = useGetAllJourneys({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      offset: LIST_USER_JOURNEYS_OFFSET,
      pageSize: LIST_USER_JOURNEYS_PAGESIZE
    }
  })

  const { loading: saveUserJourneyLoading, mutate: createUserJourney } = useSaveUserJourney({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    if (userJourneysError) {
      showError(getErrorMessage(userJourneysError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userJourneysError])

  const key = useMemo(() => Utils.randomId(), [userJourneyRef])

  const userJourneyOptions = useMemo(
    (): SelectOption[] => getUserJourneyOptions(userJourneysData?.data?.content),
    [userJourneysData?.data?.content]
  )

  const activeUserJourney = useMemo(
    () => getActiveUserJourney(userJourneyRef, isMultiSelect, userJourneyOptions),
    [userJourneyOptions, userJourneyRef, isMultiSelect]
  )

  const handleCreateUserJourney = useCallback(
    async newOption => {
      if (newOption?.identifier && newOption?.name) {
        try {
          // creating new user journey
          await createUserJourney({ name: newOption.name, identifier: newOption.identifier })

          // selecting the current user journey
          if (isMultiSelect && Array.isArray(userJourneyRef)) {
            formikProps.setFieldValue('userJourneyRef', [...userJourneyRef, newOption.identifier])
          } else {
            formikProps.setFieldValue('userJourneyRef', newOption.identifier)
          }

          // listing all user journeys
          await fetchUserJourneys()

          showSuccess(getString('cv.slos.userJourneyCreated'))
        } catch (e) {
          showError(getErrorMessage(e))
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [isMultiSelect, activeUserJourney]
  )

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        title={getString('cv.slos.createMonitoredService')}
        onClose={hideModal}
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <Formik<ServiceAndEnv> initialValues={initialFormData} formName="monitoredServiceForm" onSubmit={hideModal}>
          {monitoredServiceFormikProps => {
            return (
              <Form>
                <Text padding={{ bottom: 'medium' }}>{getString('cv.slos.monitoredServiceText')}</Text>
                <CreateMonitoredServiceFromSLO
                  monitoredServiceFormikProps={monitoredServiceFormikProps}
                  setFieldForSLOForm={formikProps?.setFieldValue}
                  fetchingMonitoredServices={fetchingMonitoredServices!}
                  hideModal={hideModal}
                />
              </Form>
            )
          }}
        </Formik>
      </Dialog>
    ),
    []
  )

  const content = (
    <>
      <Container width={350}>
        <NameIdDescriptionTags
          formikProps={formikProps}
          className={css.selectPrimary}
          identifierProps={{
            inputLabel: getString('cv.slos.sloName'),
            inputName: SLOV2FormFields.NAME,
            isIdentifierEditable: !identifier
          }}
        />
      </Container>
      {fetchingMonitoredServices && (
        <>
          <Layout.Vertical spacing="small" margin={{ bottom: 'small', top: 'xlarge' }} width="900px">
            <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }}>
              {getString('connectors.cdng.monitoredService.label')}
            </Text>
            <Text font={{ size: 'normal', weight: 'light' }}>{getString('cv.slos.monitoredServiceSubTitle')}</Text>
          </Layout.Vertical>
          <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
            {Boolean(monitoredServicesOptions.length) && (
              <Container width={350}>
                <FormInput.Select
                  tooltipProps={{ dataTooltipId: 'SLO_form_monitoredServiceRef' }}
                  name={SLOV2FormFields.MONITORED_SERVICE_REF}
                  placeholder={
                    monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectMonitoredService')
                  }
                  items={monitoredServicesOptions}
                  onChange={() => {
                    formikProps.setFieldValue(SLOV2FormFields.HEALTH_SOURCE_REF, undefined)
                    formikProps.setFieldValue(SLOV2FormFields.VALID_REQUEST_METRIC, undefined)
                    formikProps.setFieldValue(SLOV2FormFields.GOOD_REQUEST_METRIC, undefined)
                  }}
                />
              </Container>
            )}
            <RbacButton
              icon="plus"
              text={getString('common.newMonitoredService')}
              variation={ButtonVariation.SECONDARY}
              onClick={showModal}
              permission={{
                permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              }}
            />
          </Layout.Horizontal>
        </>
      )}
      <Layout.Vertical spacing="small" margin={{ bottom: 'small' }} width="900px">
        <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }}>
          {TEXT_USER_JOURNEY}
        </Text>
        <Text font={{ size: 'normal', weight: 'light' }}>{getString('cv.slos.userJourneySubTitle')}</Text>
      </Layout.Vertical>
      <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
        <Container width={350}>
          <HarnessServiceAsFormField
            key={key}
            customRenderProps={{
              name: SLOV2FormFields.USER_JOURNEY_REF
            }}
            isMultiSelectField={isMultiSelect}
            serviceProps={createServiceProps({
              onChange: formikProps.setFieldValue,
              getString,
              isMultiSelect: Boolean(isMultiSelect),
              activeUserJourney,
              userJourneysLoading,
              userJourneyOptions,
              handleCreateUserJourney
            })}
            customLoading={saveUserJourneyLoading}
          />
          {/* ToDo: Add Add-UserJourney Button here */}
        </Container>
      </Layout.Horizontal>
    </>
  )

  return <>{content}</>
}

export default SLOName
