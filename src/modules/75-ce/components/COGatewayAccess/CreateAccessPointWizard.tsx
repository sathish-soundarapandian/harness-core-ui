/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  StepWizard,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  StepProps,
  SelectOption,
  Icon
} from '@wings-software/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { AccessPoint, useAllHostedZones, useCreateAccessPoint, useGetAccessPoint } from 'services/lw'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import CreateTunnelStep from './CreateAccessPointTunnel'

interface Props extends StepProps<any> {
  name: string
  accessPoint: AccessPoint
  closeModal: () => void
  refreshAccessPoints: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}
interface CreateAccessPointWizardProps {
  accessPoint: AccessPoint
  closeModal: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  refreshAccessPoints: () => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}

interface MapToProviderProps {
  accessPoint: AccessPoint
}
const MapToProvider: React.FC<StepProps<MapToProviderProps> & Props> = props => {
  const { accessPoint } = props
  const { accountId } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const {
    data: hostedZones,
    loading: hostedZonesLoading,
    refetch: loadHostedZones
  } = useAllHostedZones({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.accessPoint.cloud_account_id as string, // eslint-disable-line
      region: 'us-east-1',
      domain: accessPoint.name,
      accountIdentifier: accountId
    },
    lazy: true
  })
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>(
    props.accessPoint.metadata?.dns?.route53 ? 'route53' : 'others'
  )

  const { showError, showSuccess, showWarning } = useToaster()
  const { previousStep } = props
  const { getString } = useStrings()
  const [accessPointStatusInProgress, setaccessPointStatusInProgress] = useState<boolean>(false)
  const [accessPointID, setAccessPointID] = useState<string>()
  const {
    data: accessPointData,
    refetch,
    loading: accessPointStatusLoading
  } = useGetAccessPoint({
    account_id: accountId,
    lb_id: props.accessPoint.id as string, //eslint-disable-line
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    if (hostedZonesLoading) return
    if (hostedZones?.response?.length == 0) {
      if (accessPoint.name) {
        showWarning(getString('ce.co.accessPoint.hostedZone.noResult'))
      }
      return
    }
    const loadedhostedZones: SelectOption[] =
      hostedZones?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setHostedZonesList(loadedhostedZones)
  }, [hostedZones, hostedZonesLoading])

  useEffect(() => {
    if (dnsProvider == 'route53') loadHostedZones()
  }, [dnsProvider])

  useEffect(() => {
    if (accessPointStatusInProgress && accessPointID) {
      if (!accessPointStatusLoading) {
        if (accessPointData?.response?.status == 'errored') {
          setaccessPointStatusInProgress(false)
          showError(getString('ce.co.accessPoint.error'), undefined, 'ce.ap.status.error')
        } else if (accessPointData?.response?.status == 'created') {
          setaccessPointStatusInProgress(false)
          // props.setAccessPoint(accessPointData?.response as AccessPoint)
          showSuccess(getString('ce.co.accessPoint.success'))
          props.refreshAccessPoints()
          props.setAccessPoint?.(accessPointData?.response)
          props.closeModal()
        } else {
          const timerId = window.setTimeout(() => {
            refetch()
          }, 1000)
          return () => {
            window.clearTimeout(timerId)
          }
        }
      }
    }
  }, [accessPointData, refetch, accessPointStatusLoading, accessPointID])

  const { mutate: createAccessPoint } = useCreateAccessPoint({
    account_id: accountId
  })

  const onSave = async (): Promise<void> => {
    setaccessPointStatusInProgress(true)
    try {
      const result = await createAccessPoint(props.accessPoint) // eslint-disable-line
      if (result.response) {
        props.accessPoint.id = result.response.id
        setAccessPointID(result.response.id)
      }
      if (!_isEmpty(result.errors)) {
        showError(result.errors?.join('\n'), undefined, 'ce.creaetap.result.error')
        setaccessPointStatusInProgress(false)
      }
      if (!_isEmpty(result.metadata)) {
        showError(result.metadata?.error, undefined, 'ce.creaetap.meta.error')
        setaccessPointStatusInProgress(false)
      }
    } catch (e) {
      showError(
        e.data?.errors?.join('\n') || e.data?.metadata?.error || e.data?.message || e.message,
        undefined,
        'ce.create.ap.failure.error'
      )
      setaccessPointStatusInProgress(false)
    }
  }
  return (
    <Layout.Vertical style={{ minHeight: '640px', width: '55%' }} padding="large" spacing="large">
      <Heading level={2}>{props.name}</Heading>
      <Formik
        initialValues={{
          dnsProvider: props.accessPoint.metadata?.dns?.route53 ? 'route53' : 'others',
          route53Account: props.accessPoint.metadata?.dns?.route53?.hosted_zone_id // eslint-disable-line
        }}
        formName="createAccPtWizard"
        enableReinitialize
        onSubmit={_ => {
          onSave()
        }}
        validationSchema={Yup.object().shape({
          route53Account: Yup.string().when(['dnsProvider'], {
            is: dns => dns == 'route53',
            then: Yup.string().required('Connector is a required field')
          })
        })}
      >
        {formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium" height="640px">
              <RadioGroup
                inline={true}
                name="dnsProvider"
                label={getString('ce.co.accessPoint.select.dnsProvider')}
                onChange={e => {
                  formik.setFieldValue('dnsProvider', e.currentTarget.value)
                  setDNSProvider(e.currentTarget.value)
                  if (props.accessPoint.metadata) {
                    if (e.currentTarget.value == 'route53') {
                      props.accessPoint.metadata.dns = {
                        route53: {
                          hosted_zone_id: '' // eslint-disable-line
                        }
                      }
                    } else {
                      props.accessPoint.metadata.dns = {
                        others: ''
                      }
                    }
                  }
                }}
                selectedValue={formik.values.dnsProvider}
              >
                <Radio label={getString('ce.co.accessPoint.route53')} value="route53" />
                <Radio label={getString('ce.co.accessPoint.others')} value="others" />
              </RadioGroup>
              {formik.values.dnsProvider == 'route53' ? (
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="route53Account"
                    label={getString('ce.co.accessPoint.select.route53zone')}
                    placeholder={getString('ce.co.accessPoint.select.route53zone')}
                    items={hostedZonesList}
                    onChange={e => {
                      formik.setFieldValue('route53Account', e.value)
                      if (props.accessPoint.metadata) {
                        props.accessPoint.metadata.dns = {
                          route53: {
                            hosted_zone_id: e.value as string // eslint-disable-line
                          }
                        }
                      }
                    }}
                    style={{ width: '80%' }}
                    disabled={hostedZonesLoading || hostedZonesList.length == 0}
                  />
                </Layout.Horizontal>
              ) : null}
            </Layout.Vertical>
            <Layout.Horizontal spacing="medium" style={{ position: 'absolute', bottom: 0 }}>
              <Button
                text={getString('previous')}
                icon="chevron-left"
                onClick={_ =>
                  previousStep?.({
                    accessPoint: props.accessPoint
                  })
                }
                disabled={accessPointStatusInProgress}
              />

              <Button
                intent="primary"
                text={getString('ce.co.accessPoint.create')}
                onClick={formik.submitForm}
                disabled={accessPointStatusInProgress}
                data-testid={'albFormSubmitBtn'}
              ></Button>
              {accessPointStatusInProgress ? (
                <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
              ) : null}
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
const CreateAccessPointWizard: React.FC<CreateAccessPointWizardProps> = props => {
  const { getString } = useStrings()
  return (
    <StepWizard icon={'service-aws'} iconProps={{ size: 40 }} title={'Create New Access Point'}>
      <CreateTunnelStep
        name={getString('ce.co.accessPoint.create')}
        accessPoint={props.accessPoint}
        closeModal={props.closeModal}
        refreshAccessPoints={props.refreshAccessPoints}
        isEditMod={props.isEditMod}
        isRuleCreationMode={props.isRuleCreationMode}
      />
      <MapToProvider
        name={getString('ce.co.accessPoint.mapDomain')}
        accessPoint={props.accessPoint}
        closeModal={props.closeModal}
        setAccessPoint={props.setAccessPoint}
        refreshAccessPoints={props.refreshAccessPoints}
      />
    </StepWizard>
  )
}

export default CreateAccessPointWizard
