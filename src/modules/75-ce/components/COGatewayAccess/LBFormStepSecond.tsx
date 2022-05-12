/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Menu } from '@blueprintjs/core'
import { Button, Formik, FormikForm, FormInput, Icon, Layout, SelectOption } from '@wings-software/uicore'
import { AccessPoint, useAllCertificates, useAllRegions, useAllSecurityGroups, useAllVPCs } from 'services/lw'
import type { AccessPointScreenMode } from '@ce/types'
// import {
//   ConnectorReferenceField,
//   ConnectorReferenceFieldProps
// } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useStrings } from 'framework/strings'
// import { Scope } from '@common/interfaces/SecretsInterface'
import css from './COGatewayAccess.module.scss'

interface LBFormStepSecondProps {
  handleSubmit?: (values: FormValue) => void
  loadBalancer: AccessPoint
  cloudAccountId: string
  setNewLoadBalancer: (lbPayload: AccessPoint) => void
  handlePreviousClick: () => void
  isSaving: boolean
  mode: AccessPointScreenMode
}

export interface FormValue {
  //   cloudConnector?: {
  //     label?: string
  //     value?: string
  //     scope?: Scope
  //   }
  securityGroups?: Array<SelectOption>
  accessPointRegion?: string
  certificate?: string
  vpc?: string
}

const lbFieldToFormFieldMap: Record<string, keyof FormValue> = {
  'metadata.security_groups': 'securityGroups',
  'metadata.certificate_id': 'certificate',
  region: 'accessPointRegion',
  vpc: 'vpc'
}

const LBFormStepSecond: React.FC<LBFormStepSecondProps> = props => {
  const { handleSubmit, loadBalancer, cloudAccountId, setNewLoadBalancer, handlePreviousClick, isSaving, mode } = props
  const isEditMode = mode === 'edit' || !_isEmpty(loadBalancer.id)
  const { getString } = useStrings()

  const [regionOptions, setRegionOptions] = useState<SelectOption[]>([])
  const [vpcOptions, setvpcOptions] = useState<SelectOption[]>([])
  const [sgOptions, setSGOptions] = useState<SelectOption[]>([])
  const [certificateOptions, setCertificateOptions] = useState<SelectOption[]>([])
  const [selectedCloudAccount] = useState<string>(cloudAccountId)
  const [selectedRegion, setSelectedRegion] = useState<string>(loadBalancer.region as string)
  const [selectedVpc, setSelectedVpc] = useState<string | undefined>(loadBalancer.vpc as string)
  const [editableFieldsMap, setEditableFieldsMap] = useState<Record<string, boolean>>({})

  const { accountId } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()

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
    if (mode !== 'create') {
      const editMap: Record<string, boolean> = {}
      loadBalancer.editables?.forEach(field => {
        const key = lbFieldToFormFieldMap[field]
        editMap[key] = true
      })
      setEditableFieldsMap(editMap)
    }
  }, [])

  useEffect(() => {
    if (regions?.response?.length === 0) {
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
      //   setAccessPointMeta('', [], '')
    }
  }, [selectedRegion])

  useEffect(() => {
    if (selectedVpc) sgsReload()
  }, [selectedVpc])

  useEffect(() => {
    if (vpcs?.response?.length === 0) {
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
    if (securityGroups?.response?.length === 0) {
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
    if (certificates?.response?.length === 0) {
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

  return (
    <Formik<FormValue>
      initialValues={{
        vpc: loadBalancer.vpc,
        accessPointRegion: loadBalancer.region,
        securityGroups:
          loadBalancer.metadata?.security_groups?.map(x => {
            return {
              value: x,
              label: x
            }
          }) || [],
        certificate: loadBalancer.metadata?.certificate_id // eslint-disable-line
      }}
      formName="lbFormSecond"
      onSubmit={values => handleSubmit?.(values)}
    >
      {({ submitForm, setFieldValue }) => (
        <FormikForm>
          <Layout.Horizontal className={css.formFieldRow}>
            <FormInput.Select
              name="accessPointRegion"
              label={getString('ce.co.accessPoint.select.regionToInstall')}
              placeholder={getString('pipeline.regionPlaceholder')}
              items={regionOptions}
              onChange={e => {
                const updatedLb = { ...loadBalancer }
                updatedLb.region = e.value as string
                setNewLoadBalancer(updatedLb)
                setSelectedRegion(updatedLb.region as string)
                setFieldValue('accessPointRegion', e.value)
              }}
              //   disabled={regionsLoading || regionOptions.length == 0 || props.isEditMod}
              // TODO: replace it with original one above after testing
              disabled={
                isEditMode ? !editableFieldsMap['accessPointRegion'] : regionsLoading || regionOptions.length === 0
              }
            />
            <FormInput.Select
              name="certificate"
              label={getString('ce.co.accessPoint.select.aCertificate')}
              placeholder={getString('ce.co.accessPoint.select.certificate')}
              items={certificateOptions}
              onChange={e => {
                setFieldValue('certificate', e.value)
                const updatedLb = { ...loadBalancer }
                if (updatedLb.metadata) updatedLb.metadata.certificate_id = e.value as string // eslint-disable-line
                setNewLoadBalancer(updatedLb)
              }}
              disabled={
                isEditMode ? !editableFieldsMap['certificate'] : certificatesLoading || certificateOptions.length === 0
              }
            />
          </Layout.Horizontal>
          <Layout.Horizontal className={css.formFieldRow}>
            <FormInput.Select
              name="vpc"
              label={getString('ce.co.accessPoint.select.vpc')}
              placeholder={getString('ce.co.accessPoint.select.vpc')}
              items={vpcOptions}
              onChange={e => {
                setFieldValue('vpc', e.value)
                const updatedLb = { ...loadBalancer }
                updatedLb.vpc = e.value as string
                setNewLoadBalancer(updatedLb)
                setSelectedVpc(updatedLb.vpc)
              }}
              //   disabled={vpcsLoading || vpcOptions.length === 0 || props.isEditMod}
              // TODO: replace it with original one above after testing
              disabled={isEditMode ? !editableFieldsMap['vpc'] : vpcsLoading || vpcOptions.length === 0}
            />
            <FormInput.MultiSelect
              name="securityGroups"
              label={getString('ce.co.accessPoint.select.securityGroups')}
              placeholder={getString('ce.co.accessPoint.select.securityGroups')}
              multiSelectProps={{
                itemRender: (_item, { handleClick }) => (
                  <Menu.Item
                    key={_item.label}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '5px 10px' }}
                    onClick={handleClick}
                    text={_item.label}
                  />
                )
              }}
              items={sgOptions}
              onChange={e => {
                setFieldValue('securityGroups', e)
                // eslint-disable-next-line
                const updatedLb = { ...loadBalancer }
                if (updatedLb.metadata) {
                  // eslint-disable-next-line
                  updatedLb.metadata.security_groups = e.map(x => {
                    return x.value as string
                  })
                  setNewLoadBalancer(updatedLb)
                }
              }}
              disabled={isEditMode ? !editableFieldsMap['securityGroups'] : sgsLoading || sgOptions.length === 0}
            />
          </Layout.Horizontal>
          <Layout.Horizontal style={{ marginTop: 220 }}>
            <Button
              text={'Back'}
              icon={'chevron-left'}
              onClick={handlePreviousClick}
              style={{ marginRight: 'var(--spacing-large)' }}
            ></Button>
            {isSaving && <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />}
            {!isSaving && (
              <Button
                intent="primary"
                text={'Save Load Balancer'}
                onClick={submitForm}
                disabled={!selectedRegion && !selectedVpc && _isEmpty(loadBalancer.metadata?.security_groups)}
              ></Button>
            )}
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}

export default LBFormStepSecond
