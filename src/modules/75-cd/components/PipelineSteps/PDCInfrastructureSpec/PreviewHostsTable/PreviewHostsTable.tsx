import React, { useCallback, useState } from 'react'
import type { Column } from 'react-table'
import { useParams } from 'react-router-dom'
import { Layout, Table, Button, Label, ButtonSize, ButtonVariation, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/exports'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { useValidateHosts, HostValidationDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import css from '../PDCInfrastructureSpec.module.scss'

interface PreviewHostsTableProps {
  hosts: string[]
  secretIdentifier?: string
  tags?: string[]
}

const PreviewHostsTable = ({ hosts, secretIdentifier, tags }: PreviewHostsTableProps) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const [showPreviewHostBtn, setShowPreviewHostBtn] = useState(true)
  const [detailHosts, setDetailHosts] = useState([] as HostValidationDTO[])
  const [errors, setErrors] = useState([])

  const { mutate: validateHosts } = useValidateHosts({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      identifier: secretIdentifier as string
    }
  })

  const testConnection = async (testHost?: string) => {
    setErrors([])
    try {
      const validationHosts = testHost ? [testHost] : detailHosts.map(host => host.host || '')
      const hostResults = await validateHosts({ hosts: validationHosts, tags })
      if (hostResults.status === 'SUCCESS') {
        const tempMap: any = {}
        detailHosts.forEach(hostItem => {
          tempMap[hostItem.host || ''] = hostItem
        }, {})
        hostResults.data?.forEach(hostRes => {
          tempMap[hostRes.host || ''] = hostRes
        })
        setDetailHosts(Object.values(tempMap) as [])
      } else {
        setErrors(hostResults?.responseMessages || [])
      }
    } catch (e: any) {
      if (e.data?.responseMessages) {
        setErrors(e.data?.responseMessages)
      } else {
        showError(e.data.message || e.message)
      }
    }
  }

  const columns: Column<HostValidationDTO>[] = [
    {
      Header: getString('cd.steps.pdcStep.no').toUpperCase(),
      accessor: 'host',
      id: 'no',
      width: '6',
      Cell: ({ row }) => row.index + 1
    },
    {
      Header: getString('pipelineSteps.hostLabel').toUpperCase(),
      accessor: 'host',
      id: 'host',
      width: '20%',
      Cell: ({ row }) => row.original.host
    },
    {
      Header: '',
      accessor: 'status',
      id: 'status',
      width: '12%',
      Cell: ({ row }) => (
        <Text color={row.original.status === 'SUCCESS' ? Color.GREEN_400 : Color.RED_400}>{row.original.status}</Text>
      )
    },
    {
      Header: '',
      accessor: 'status',
      id: 'action',
      width: '22%',
      Cell: ({ row }) =>
        row.original.status === 'FAILED' ? (
          <Button
            onClick={() => testConnection(row.original.host || '')}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.SECONDARY}
          >
            {getString('retry')}
          </Button>
        ) : null
    },
    {
      Header: '',
      accessor: 'error',
      id: 'error',
      width: '40%',
      Cell: ({ row }) => (
        <Text font={{ size: 'small' }} color={Color.RED_400}>
          {row.original?.error?.message}
        </Text>
      )
    }
  ]

  const refreshHosts = useCallback(() => {
    setErrors([])
    setDetailHosts(
      hosts.map(
        host =>
          ({
            host: host,
            status: undefined
          } as HostValidationDTO)
      )
    )
  }, [hosts])

  return (
    <Layout.Vertical>
      {showPreviewHostBtn ? (
        <Button
          onClick={() => {
            setShowPreviewHostBtn(false)
            refreshHosts()
          }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.SECONDARY}
          width={140}
        >
          Preview Hosts
        </Button>
      ) : (
        <>
          <Layout.Horizontal spacing="normal" flex={{ justifyContent: 'space-between' }}>
            <Layout.Horizontal flex={{ alignItems: 'center' }} margin={{ bottom: 'small' }}>
              <Label className={'bp3-label ' + css.previewHostsLabel}>Preview Hosts</Label>
              <Button
                rightIcon="refresh"
                iconProps={{ size: 16 }}
                onClick={refreshHosts}
                size={ButtonSize.SMALL}
                variation={ButtonVariation.SECONDARY}
              >
                {getString('common.refresh')}
              </Button>
            </Layout.Horizontal>
            <Layout.Horizontal flex={{ alignItems: 'center' }} margin={{ bottom: 'small' }}>
              <Button
                onClick={() => testConnection()}
                size={ButtonSize.SMALL}
                variation={ButtonVariation.SECONDARY}
                disabled={detailHosts.length === 0 || !secretIdentifier}
              >
                {getString('common.smtp.testConnection')}
              </Button>
            </Layout.Horizontal>
          </Layout.Horizontal>
          {errors.length > 0 && <ErrorHandler responseMessages={errors} />}
          {detailHosts.length > 0 ? (
            <Table columns={columns} data={detailHosts} />
          ) : (
            <Label className={'bp3-label'} style={{ margin: 'auto' }}>
              No hosts provided
            </Label>
          )}
        </>
      )}
    </Layout.Vertical>
  )
}

export default PreviewHostsTable
