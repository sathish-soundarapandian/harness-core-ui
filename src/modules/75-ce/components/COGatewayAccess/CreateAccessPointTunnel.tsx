/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  StepProps,
  SelectOption,
  Container
} from '@wings-software/uicore'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  AccessPoint,
  useAllCertificates,
  useAllRegions,
  useAllSecurityGroups,
  useAllVPCs,
  useAccessPointResources,
  ALBAccessPointCore
} from 'services/lw'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import css from './COGatewayAccess.module.scss'

interface Props extends StepProps<any> {
  name: string
  accessPoint: AccessPoint
  closeModal: () => void
  refreshAccessPoints: () => void
  setAccessPoint?: (ap: AccessPoint) => void
  isEditMod?: boolean
  isRuleCreationMode?: boolean
}

const CreateTunnelStep: React.FC<StepProps<any> & Props> = props => {
  const { accountId } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const [accessPoint, setAccessPoint] = useState<AccessPoint>(props.accessPoint)
  const [regionOptions, setRegionOptions] = useState<SelectOption[]>([])
  const [vpcOptions, setvpcOptions] = useState<SelectOption[]>([])
  const [sgOptions, setSGOptions] = useState<SelectOption[]>([])
  const [certificateOptions, setCertificateOptions] = useState<SelectOption[]>([])
  const [selectedCloudAccount, setSelectedCloudAccount] = useState<string>(props.accessPoint.cloud_account_id as string)
  const [selectedRegion, setSelectedRegion] = useState<string>(props.accessPoint.region as string)
  const [selectedVpc, setSelectedVpc] = useState<string | undefined>(props.accessPoint.vpc as string)
  const [apCoreOptions, setApCoreOptions] = useState<SelectOption[]>([])
  const [selectedAPCore, setSelectedAPCore] = useState<string | undefined>()
  const [useExistingALB, setUseExistingALB] = useState<boolean>(false)
  const [createOrExisting, setCreateOrExisting] = useState<string>()
  const { getString } = useStrings()
  const { nextStep } = props

  const { data: regions, loading: regionsLoading } = useAllRegions({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: selectedCloudAccount, // eslint-disable-line
      accountIdentifier: accountId
    }
  })
  const {
    data: vpcs,
    loading: vpcsLoading,
    refetch: vpcsReload
  } = useAllVPCs({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      region: selectedRegion,
      cloud_account_id: selectedCloudAccount, // eslint-disable-line
      accountIdentifier: accountId
    },
    lazy: true
  })
  const { data: apCoresResponse, refetch: apCoresReload } = useAccessPointResources({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      region: selectedRegion,
      cloud_account_id: selectedCloudAccount, // eslint-disable-line
      accountIdentifier: accountId
    },
    lazy: true
  })
  const {
    data: certificates,
    loading: certificatesLoading,
    refetch: certificatesReload
  } = useAllCertificates({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: selectedCloudAccount, // eslint-disable-line
      region: selectedRegion,
      accountIdentifier: accountId
    },
    lazy: true
  })
  const {
    data: securityGroups,
    loading: sgsLoading,
    refetch: sgsReload
  } = useAllSecurityGroups({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      region: selectedRegion,
      vpc_id: selectedVpc as string, // eslint-disable-line
      cloud_account_id: selectedCloudAccount, // eslint-disable-line
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    if (regions?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      regions?.response?.map(r => {
        return {
          label: r.label as string,
          value: r.name as string
        }
      }) || []
    setRegionOptions(loaded)
  }, [regions])

  useEffect(() => {
    if (selectedRegion) {
      vpcsReload()
      certificatesReload()
      apCoresReload()
      setAccessPointMeta('', [], '')
    }
  }, [selectedRegion])

  useEffect(() => {
    if (selectedVpc) sgsReload()
  }, [selectedVpc])

  useEffect(() => {
    if (vpcs?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      vpcs?.response?.map(v => {
        return {
          label: v.name as string,
          value: v.id as string
        }
      }) || []
    setvpcOptions(loaded)
  }, [vpcs])

  useEffect(() => {
    if (securityGroups?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      securityGroups?.response?.map(v => {
        return {
          label: v.name as string,
          value: v.id as string
        }
      }) || []
    setSGOptions(loaded)
  }, [securityGroups])

  useEffect(() => {
    if (certificates?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      certificates?.response?.map(v => {
        return {
          label: v.name as string,
          value: v.id as string
        }
      }) || []
    setCertificateOptions(loaded)
  }, [certificates])

  useEffect(() => {
    if (apCoresResponse?.response?.length) {
      const apCores: SelectOption[] = apCoresResponse?.response
        .filter(core => !selectedVpc || (core.details as ALBAccessPointCore)?.vpc === selectedVpc)
        .map(core => ({
          label: core.details?.name as string,
          value: (core.details as ALBAccessPointCore)?.albARN as string
        }))
      setApCoreOptions(apCores)
    }
  }, [apCoresResponse])

  const setAccessPointMeta = (vpc: string | undefined, sg: string[] | undefined, albARN: string | undefined) => {
    const ap = props.accessPoint
    if (!props.isRuleCreationMode) {
      ap.vpc = vpc
      setSelectedVpc(vpc)
    }
    setSelectedAPCore(albARN)
    ap.metadata = {
      ...ap.metadata,
      security_groups: sg, // eslint-disable-line
      albArn: albARN
    }
    setAccessPoint(ap)
  }

  const clearAccessPointMeta = () => setAccessPointMeta(undefined, undefined, undefined)

  const onApCoreChange = (val: string) => {
    if (!val) return
    const core = apCoresResponse?.response?.find(c => (c.details as ALBAccessPointCore)?.albARN === val)
    if (!core) return
    setAccessPointMeta(
      (core.details as ALBAccessPointCore)?.vpc as string,
      (core.details as ALBAccessPointCore)?.security_groups || [],
      (core.details as ALBAccessPointCore)?.albARN as string
    )
  }

  return (
    <Layout.Vertical style={{ minHeight: '640px', width: '55%' }} padding="large" spacing="medium">
      <Heading level={2}>{props.name}</Heading>
      <Formik
        enableReinitialize
        formName="createAccessPt"
        initialValues={{
          cloudConnector: {
            label: '',
            value: accessPoint.cloud_account_id // eslint-disable-line
          },
          accessPointName: accessPoint.host_name,
          accessPointRegion: accessPoint.region,
          vpc: selectedVpc,
          securityGroups: accessPoint.metadata?.security_groups?.map(x => {
            return {
              value: x,
              label: x
            }
          }), // eslint-disable-line
          certificate: accessPoint.metadata?.certificate_id, // eslint-disable-line
          albSelector: createOrExisting,
          apCores: selectedAPCore
        }}
        onSubmit={_ => {
          nextStep?.({
            accessPoint: accessPoint
          })
        }}
        validationSchema={Yup.object().shape({
          cloudConnector: Yup.string().required(getString('ce.co.accessPoint.validation.connector')),
          accessPointName: Yup.string().required(getString('ce.co.accessPoint.validation.name')),
          accessPointRegion: Yup.string().required(getString('validation.regionRequired')),
          vpc: Yup.string().required(getString('ce.co.accessPoint.validation.vpc')),
          subnets: Yup.array(Yup.string()).min(2, getString('ce.co.accessPoint.validation.subnets')),
          securityGroups: Yup.array(Yup.string()).min(1, getString('ce.co.accessPoint.validation.securityGroup'))
        })}
      >
        {formik => (
          <FormikForm>
            <Layout.Vertical spacing="medium" height="640px">
              <FormInput.Text
                name="accessPointName"
                label={getString('ce.co.accessPoint.enterDomain')}
                placeholder={getString('ce.co.accessPoint.domainName')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  props.accessPoint.host_name = e.target.value // eslint-disable-line
                  props.accessPoint.name = e.target.value // eslint-disable-line
                  setAccessPoint(props.accessPoint)
                  formik.setFieldValue('accessPointName', e.target.value)
                }}
                disabled={props.isEditMod}
              />
              {!props.isRuleCreationMode ? (
                <ConnectorReferenceField
                  name="cloudConnector"
                  placeholder={getString('ce.co.accessPoint.select.account')}
                  selected={accessPoint.cloud_account_id as ConnectorReferenceFieldProps['selected']} // eslint-disable-line
                  onChange={(record, scope) => {
                    props.accessPoint.cloud_account_id = record?.identifier // eslint-disable-line
                    setAccessPoint(props.accessPoint)
                    setSelectedCloudAccount(props.accessPoint.cloud_account_id as string) // eslint-disable-line
                    formik.setFieldValue('cloudConnector', {
                      label: record.name || '',
                      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${record.identifier}`,
                      scope: scope
                    })
                  }}
                  accountIdentifier={accountId}
                  label={getString('ce.co.accessPoint.select.connector')}
                  category={'CLOUD_COST'}
                  disabled={props.isEditMod}
                />
              ) : null}
              {!props.isRuleCreationMode ? (
                <FormInput.Select
                  name="accessPointRegion"
                  label={getString('ce.co.accessPoint.select.regionToInstall')}
                  placeholder={getString('pipeline.regionPlaceholder')}
                  items={regionOptions}
                  onChange={e => {
                    props.accessPoint.region = e.value as string
                    setAccessPoint(props.accessPoint)
                    setSelectedRegion(props.accessPoint.region)
                    formik.setFieldValue('accessPointRegion', e.value)
                  }}
                  disabled={regionsLoading || regionOptions.length == 0 || props.isEditMod}
                />
              ) : null}
              <Container>
                <Layout.Horizontal>
                  <FormInput.RadioGroup
                    name="albSelector"
                    items={[
                      { label: getString('ce.co.accessPoint.createNewALB'), value: 'new' },
                      { label: '', value: '' }
                    ]}
                    style={{ fontSize: '24px' }}
                    radioGroup={{ inline: true, className: css.radioFont }}
                    disabled={regionsLoading || regionOptions.length == 0 || !selectedRegion}
                    onChange={e => {
                      setUseExistingALB(e.currentTarget.value !== 'new')
                      setCreateOrExisting(e.currentTarget.value)
                      clearAccessPointMeta()
                    }}
                    className={css.radioFont}
                  />
                  <FormInput.Select
                    name="apCores"
                    items={apCoreOptions}
                    disabled={regionsLoading || !selectedRegion || !useExistingALB}
                    onChange={e => {
                      onApCoreChange(e.value as string)
                    }}
                    style={{ width: '220px' }}
                    placeholder={getString('ce.co.accessPoint.select.existingALB')}
                  />
                </Layout.Horizontal>
              </Container>
              <FormInput.Select
                name="certificate"
                label={getString('ce.co.accessPoint.select.aCertificate')}
                placeholder={getString('ce.co.accessPoint.select.certificate')}
                items={certificateOptions}
                onChange={e => {
                  formik.setFieldValue('certificate', e)
                  if (props.accessPoint.metadata) props.accessPoint.metadata.certificate_id = e.value as string // eslint-disable-line
                  setAccessPoint(props.accessPoint)
                }}
                disabled={certificatesLoading || certificateOptions.length == 0}
              />
              {!props.isRuleCreationMode && !useExistingALB ? (
                <FormInput.Select
                  name="vpc"
                  label={getString('ce.co.accessPoint.select.vpc')}
                  placeholder={getString('ce.co.accessPoint.select.vpc')}
                  items={vpcOptions}
                  onChange={e => {
                    formik.setFieldValue('vpc', e.value)
                    props.accessPoint.vpc = e.value as string
                    setAccessPoint(props.accessPoint)
                    setSelectedVpc(props.accessPoint.vpc)
                  }}
                  disabled={vpcsLoading || vpcOptions.length == 0 || props.isEditMod}
                />
              ) : null}
              <FormInput.MultiSelect
                name="securityGroups"
                label={getString('ce.co.accessPoint.select.securityGroups')}
                placeholder={getString('ce.co.accessPoint.select.securityGroups')}
                items={sgOptions}
                onChange={e => {
                  formik.setFieldValue('securityGroups', e)
                  // eslint-disable-next-line
                  if (props.accessPoint.metadata) {
                    // eslint-disable-next-line
                    props.accessPoint.metadata.security_groups = e.map(x => {
                      return x.value as string
                    })
                    setAccessPoint(props.accessPoint)
                  }
                }}
                disabled={sgsLoading || sgOptions.length == 0}
              />
              <Button
                intent="primary"
                text={getString('ce.co.accessPoint.proceed')}
                onClick={formik.submitForm}
                style={{ position: 'absolute', bottom: 0 }}
              ></Button>
            </Layout.Vertical>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default CreateTunnelStep
