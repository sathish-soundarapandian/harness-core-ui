/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'
import { isEmpty as _isEmpty } from 'lodash-es'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Icon,
  Layout,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { Dialog } from '@blueprintjs/core'
import { useToaster } from '@common/exports'
import {
  AccessPoint,
  useAllRegions,
  useAllResourceGroups,
  useAllVPCs,
  useAllSubnets,
  useAllPublicIps,
  useAllCertificates,
  CertificateData
} from 'services/lw'
import type { AccessPointScreenMode } from '@ce/types'
import CertificateUpload from './CertificateUploadScreen'
import css from '../COGatewayAccess/COGatewayAccess.module.scss'

export interface AzureApFormVal {
  ip?: string
  region: string
  resourceGroup: string
  sku: string
  subnet?: string
  virtualNetwork: string
  certificate: string
  newCertificate?: CertificateData
  fe_ip_name?: string
  subnet_name?: string
  func_region: string
}

interface AzureAccessPointFormProps {
  onSave: (savedAp: AccessPoint) => void
  cloudAccountId: string
  handlePreviousClick: (values: AzureApFormVal) => void
  lbCreationInProgress: boolean
  handleFormSubmit: (val: AzureApFormVal) => void
  loadBalancer: AccessPoint
  mode: AccessPointScreenMode
}

const SKUItems: SelectOption[] = [
  { label: 'SKU 1, Small', value: 'sku1_small' },
  { label: 'SKU 1, Medium', value: 'sku1_medium' },
  { label: 'SKU 1, Large', value: 'sku1_large' },
  { label: 'SKU2', value: 'sku2' }
]

const DEFAULT_FUNC_REGION = 'westus2'

type AllFieldsKey = keyof AzureApFormVal & keyof CertificateData

const lbFieldToFormFieldMap: Record<string, keyof AllFieldsKey> = {
  'metadata.fe_ip_id': 'ip',
  region: 'region',
  'metadata.resource_group': 'resourceGroup',
  'metadata.size': 'sku',
  'metadata.subnet_id': 'subnet',
  vpc: 'virtualNetwork',
  'metadata.certificate_id': 'certificate',
  'metadata.certificate.name': 'name',
  'metadata.certificate.password': 'password',
  'metadata.certificate.content': 'content',
  'metadata.func_region': 'func_region'
}

const AzureAccessPointForm: React.FC<AzureAccessPointFormProps> = props => {
  const { cloudAccountId, lbCreationInProgress, loadBalancer, mode } = props
  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'
  const { accountId } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { showSuccess } = useToaster()

  const [regionsOptions, setRegionsOptions] = useState<SelectOption[]>([])
  const [resourceGroupsOptions, setResourceGroupsOptions] = useState<SelectOption[]>([])
  const [vpcOptions, setVpcOptions] = useState<SelectOption[]>([])
  const [subnetsOptions, setSubnetsOptions] = useState<SelectOption[]>([])
  const [publicIpsOptions, setPublicIpsOptions] = useState<SelectOption[]>([])
  const [certificatesOptions, setCertificatesOptions] = useState<SelectOption[]>([])
  const [selectedRegion, setSelectedRegion] = useState<SelectOption>()
  const [selectedVpc, setSelectedVpc] = useState<SelectOption>()
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<SelectOption>()
  const [newCertificate, setNewCertificate] = useState<CertificateData | undefined>(loadBalancer.metadata?.certificate)
  const [newFrontendIp, setNewFrontendIp] = useState<SelectOption | undefined>(
    loadBalancer.metadata?.fe_ip_name
      ? { label: loadBalancer.metadata.fe_ip_name, value: loadBalancer.metadata.fe_ip_name }
      : undefined
  )
  const [newSubnet, setNewSubnet] = useState<SelectOption | undefined>(
    loadBalancer.metadata?.subnet_name
      ? { label: loadBalancer.metadata.subnet_name, value: loadBalancer.metadata.subnet_name }
      : undefined
  )
  const [editableFieldsMap, setEditableFieldsMap] = useState<Record<string, boolean>>({})

  const { data: regions, loading: regionsLoading } = useAllRegions({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  const {
    data: resourceGroups,
    loading: resourceGroupsLoading,
    refetch: refetchResourceGroups
  } = useAllResourceGroups({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId, // eslint-disable-line
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
      cloud_account_id: cloudAccountId,
      region: (selectedRegion?.value || loadBalancer.region) as string,
      resource_group_name: (selectedResourceGroup?.value || loadBalancer.metadata?.resource_group) as string,
      accountIdentifier: accountId
    },
    lazy: true
  })

  const {
    data: subnets,
    loading: subnetsLoading,
    refetch: subnetsReload
  } = useAllSubnets({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId,
      region: (selectedRegion?.value || loadBalancer.region) as string,
      vpc: (selectedVpc?.label || loadBalancer.vpc) as string,
      resource_group_name: (selectedResourceGroup?.value || loadBalancer.metadata?.resource_group) as string,
      accountIdentifier: accountId
    },
    lazy: true
  })

  const {
    data: publicIps,
    loading: publicIpsLoading,
    refetch: publicIpsReload
  } = useAllPublicIps({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: cloudAccountId,
      region: (selectedRegion?.value || loadBalancer.region) as string,
      vpc: (selectedVpc?.label || loadBalancer.vpc) as string,
      resource_group_name: (selectedResourceGroup?.value || loadBalancer.metadata?.resource_group) as string,
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
      cloud_account_id: cloudAccountId,
      region: (selectedRegion?.value || loadBalancer.region) as string,
      resource_group_name: (selectedResourceGroup?.value || loadBalancer.metadata?.resource_group) as string,
      accountIdentifier: accountId,
      ...(loadBalancer.metadata?.app_gateway_id && { app_gateway_id: loadBalancer.metadata?.app_gateway_id })
    },
    lazy: true
  })

  useEffect(() => {
    if (mode !== 'create') {
      const editMap: Record<string, boolean> = {}
      loadBalancer.editables?.forEach(field => {
        const key = lbFieldToFormFieldMap[field]
        editMap[key as string] = true
      })
      setEditableFieldsMap(editMap)
    }
  }, [])

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
    setRegionsOptions(loaded)
    const savedRegion = loadBalancer.region && loaded.find(_option => _option.value === loadBalancer.region)
    if (savedRegion) setSelectedRegion(savedRegion)
  }, [regions, loadBalancer.region])

  useEffect(() => {
    if (resourceGroups?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      resourceGroups?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.name as string
        }
      }) || []
    setResourceGroupsOptions(loaded)
    const savedResourceGroup =
      loadBalancer.metadata?.resource_group &&
      loaded.find(_option => _option.value === loadBalancer.metadata?.resource_group)
    if (savedResourceGroup) setSelectedResourceGroup(savedResourceGroup)
  }, [resourceGroups, loadBalancer.metadata?.resource_group])

  useEffect(() => {
    if (selectedRegion?.value && selectedResourceGroup?.value) {
      vpcsReload()
      certificatesReload()
    }
  }, [selectedRegion, selectedResourceGroup])

  useEffect(() => {
    if (vpcs?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      vpcs?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setVpcOptions(loaded)
    const savedVpc = loadBalancer.vpc && loaded.find(_option => _option.value === loadBalancer.vpc)
    if (savedVpc) setSelectedVpc(savedVpc)
  }, [vpcs, loadBalancer.vpc])

  useEffect(() => {
    if (subnets?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      subnets?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setSubnetsOptions(loaded)
  }, [subnets])

  useEffect(() => {
    if (publicIps?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      publicIps?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setPublicIpsOptions(loaded)
  }, [publicIps])

  useEffect(() => {
    if (certificates?.response?.length == 0) {
      return
    }
    const loaded: SelectOption[] =
      certificates?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setCertificatesOptions(loaded)
  }, [certificates])

  useEffect(() => {
    if (selectedRegion?.value && selectedVpc?.label && selectedResourceGroup?.value) {
      subnetsReload({
        queryParams: {
          cloud_account_id: cloudAccountId,
          region: selectedRegion?.value as string,
          vpc: selectedVpc?.label as string,
          resource_group_name: selectedResourceGroup?.value as string,
          accountIdentifier: accountId
        }
      })
      publicIpsReload({
        queryParams: {
          cloud_account_id: cloudAccountId,
          region: selectedRegion?.value as string,
          vpc: selectedVpc?.label as string,
          resource_group_name: selectedResourceGroup?.value as string,
          accountIdentifier: accountId
        }
      })
    }
  }, [selectedRegion, selectedResourceGroup, selectedVpc])

  const [openUploadCertiModal, closeUploadCertiModal] = useModalHook(() => {
    return (
      <Dialog
        onClose={closeUploadCertiModal}
        isOpen={true}
        style={{
          width: 650,
          padding: 40,
          position: 'relative',
          minHeight: 300
        }}
        enforceFocus={false}
      >
        <CertificateUpload
          editableFieldsMap={editableFieldsMap}
          mode={props.mode}
          onSubmit={_certificateDetails => {
            showSuccess(`Added ${_certificateDetails.name} successfully`)
            setNewCertificate(_certificateDetails)
            closeUploadCertiModal()
          }}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={closeUploadCertiModal}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-certi-upload-modal'}
        />
      </Dialog>
    )
  }, [editableFieldsMap])

  const isFormValid = (validStatus: boolean) => {
    return (
      validStatus ||
      (loadBalancer.region &&
        loadBalancer.vpc &&
        loadBalancer.metadata?.resource_group &&
        (loadBalancer.metadata.subnet_id || loadBalancer.metadata.subnet_name) &&
        (loadBalancer.metadata.fe_ip_id || loadBalancer.metadata.fe_ip_name) &&
        loadBalancer.metadata.size)
    )
  }

  const isNewSubnetAdded = (subnetVal?: string) => {
    return _isEmpty(subnetsOptions.find(option => option.value === subnetVal))
  }

  const isNewFeIpAdded = (feIpVal?: string) => {
    return _isEmpty(publicIpsOptions.find(option => option.value === feIpVal))
  }

  const getValuesToSave = (values: AzureApFormVal): AzureApFormVal => {
    return {
      ...values,
      newCertificate,
      ...(isNewSubnetAdded(values.subnet)
        ? { subnet_name: values.subnet as string, subnet: undefined }
        : { subnet_name: undefined, subnet: values.subnet }),
      ...(isNewFeIpAdded(values.ip)
        ? { fe_ip_name: values.ip as string, ip: undefined }
        : { fe_ip_name: undefined, ip: values.ip })
    }
  }

  const handleSubmit = (values: AzureApFormVal) => {
    props.handleFormSubmit(getValuesToSave(values))
  }

  const handleBackClick = (values: AzureApFormVal) => {
    props.handlePreviousClick(getValuesToSave(values))
  }

  const renderRefreshButton = (cb: () => any, enforceRefresh?: boolean) =>
    (isCreateMode || enforceRefresh) && (
      <Button intent="none" text="Refresh" onClick={_ => cb()} minimal icon="refresh" />
    )

  return (
    <Container>
      <Formik
        initialValues={{
          ip: newFrontendIp ? (newFrontendIp.value as string) : loadBalancer.metadata?.fe_ip_id || '',
          region: loadBalancer.region || '',
          resourceGroup: loadBalancer.metadata?.resource_group || '',
          sku: loadBalancer.metadata?.size || '',
          subnet: newSubnet ? (newSubnet.value as string) : loadBalancer.metadata?.subnet_id || '',
          virtualNetwork: loadBalancer.vpc || '',
          certificate: loadBalancer.metadata?.certificate_id || '',
          func_region: loadBalancer.metadata?.func_region || DEFAULT_FUNC_REGION
        }}
        formName="azureAccessPt"
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          ip: Yup.string().required(),
          region: Yup.string().required(),
          resourceGroup: Yup.string().required(),
          sku: Yup.string().required(),
          subnet: Yup.string().required(),
          virtualNetwork: Yup.string().required(),
          func_region: Yup.string().required()
        })}
      >
        {({ submitForm, isValid, dirty, values }) => (
          <FormikForm>
            <div className={css.formFieldRow}>
              <FormInput.Select
                label={'Region*'}
                placeholder={'Select region'}
                name="region"
                items={regionsOptions}
                onChange={regionItem => {
                  setSelectedRegion(regionItem)
                }}
                disabled={isEditMode ? !editableFieldsMap['region'] : !_isEmpty(values.region) ? false : regionsLoading}
              />
            </div>
            <div className={cx(css.formFieldRow, css.flexRow)}>
              <FormInput.Select
                label={'Resource Group*'}
                placeholder={'Select resource group'}
                name="resourceGroup"
                items={resourceGroupsOptions}
                disabled={
                  isEditMode
                    ? !editableFieldsMap['resourceGroup']
                    : !_isEmpty(values.resourceGroup)
                    ? false
                    : resourceGroupsLoading
                }
                onChange={resourceItem => {
                  setSelectedResourceGroup(resourceItem)
                }}
              />
              {renderRefreshButton(refetchResourceGroups)}
            </div>
            <div className={css.formFieldRow}>
              {!isCreateMode && (
                <div className={css.flexRow}>
                  <FormInput.Select
                    label={'Certificate (optional)'}
                    placeholder={'Select certificate'}
                    name={'certificate'}
                    selectProps={{
                      allowCreatingNewItems: true
                    }}
                    items={certificatesOptions}
                    disabled={
                      isEditMode
                        ? !editableFieldsMap['certificate']
                        : !_isEmpty(values.certificate)
                        ? false
                        : certificatesLoading || !selectedRegion || !selectedResourceGroup
                    }
                  />
                  {renderRefreshButton(certificatesReload, true)}
                </div>
              )}
              {isCreateMode && <label className={css.certiLabel}>{'Certificate (optional)'}</label>}
              <div className={css.uploadCtaContainer}>
                <span onClick={openUploadCertiModal} className={css.uploadText}>
                  + Upload a certificate
                </span>
                {newCertificate && (
                  <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                    <Text>
                      <Icon name={'command-artifact-check'} /> {newCertificate?.name}
                    </Text>
                    <Icon
                      name={'trash'}
                      color={Color.RED_700}
                      onClick={() => setNewCertificate(undefined)}
                      title={'delete'}
                    />
                  </Layout.Horizontal>
                )}
              </div>
            </div>
            <div className={cx(css.formFieldRow, css.flexRow)}>
              <FormInput.Select
                label={'Virtual Network*'}
                placeholder={'Select virtual network'}
                name="virtualNetwork"
                items={vpcOptions}
                disabled={
                  isEditMode
                    ? !editableFieldsMap['virtualNetwork']
                    : !_isEmpty(values.virtualNetwork)
                    ? false
                    : vpcsLoading || !selectedRegion
                }
                onChange={vpcItem => {
                  setSelectedVpc(vpcItem)
                }}
              />
              {renderRefreshButton(vpcsReload)}
            </div>
            <div className={cx(css.formFieldRow, css.flexRow)}>
              <FormInput.Select
                label={'Subnet*'}
                placeholder={'Select subnet'}
                name="subnet"
                items={subnetsOptions}
                value={newSubnet}
                onChange={_subnet => setNewSubnet(_subnet)}
                selectProps={{
                  allowCreatingNewItems: true
                }}
                disabled={
                  isEditMode
                    ? !editableFieldsMap['subnet']
                    : !_isEmpty(values.subnet)
                    ? false
                    : subnetsLoading || !selectedVpc
                }
              />
              {renderRefreshButton(subnetsReload)}
            </div>
            <div className={cx(css.formFieldRow, css.flexRow)}>
              <FormInput.Select
                label={'Frontend IP*'}
                placeholder={'Select IP'}
                name="ip"
                items={publicIpsOptions}
                selectProps={{
                  allowCreatingNewItems: true
                }}
                value={newFrontendIp}
                onChange={_ip => setNewFrontendIp(_ip)}
                disabled={
                  isEditMode
                    ? !editableFieldsMap['ip']
                    : !_isEmpty(values.ip)
                    ? false
                    : publicIpsLoading || !selectedRegion || !selectedVpc || !selectedResourceGroup
                }
              />
              {renderRefreshButton(publicIpsReload)}
            </div>
            <div className={css.formFieldRow}>
              <FormInput.Select
                label={'SKU*'}
                placeholder={'Select SKU'}
                name="sku"
                items={SKUItems}
                disabled={isEditMode && !editableFieldsMap['sku']}
              />
            </div>
            <div className={css.formFieldRow}>
              <FormInput.Select
                label={'Azure Function Region*'}
                placeholder={'Select region'}
                name="func_region"
                items={regionsOptions}
                // onChange={regionItem => {
                //   setSelectedRegion(regionItem)
                // }}
                disabled={
                  isEditMode
                    ? !editableFieldsMap['func_region']
                    : !_isEmpty(values.func_region)
                    ? false
                    : regionsLoading
                }
              />
            </div>
            <Layout.Horizontal style={{ marginTop: 100 }}>
              <Button minimal icon={'chevron-left'} onClick={() => handleBackClick(values)}>
                Back
              </Button>
              {!lbCreationInProgress && (
                <Button intent={'primary'} onClick={submitForm} disabled={!isFormValid(!(!isValid || !dirty))}>
                  Save
                </Button>
              )}
              {lbCreationInProgress && (
                <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
              )}
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default AzureAccessPointForm
