import { Table, Layout, Text, ButtonVariation, Button } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import React, { useMemo, useState } from 'react'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import css from '../DelegateCommandLineCreation.module.scss'
interface KuberntesManifestSizingTableProps {
  delegateType: string
}
const KuberntesManifestSizingTable: React.FC<KuberntesManifestSizingTableProps> = ({ delegateType }) => {
  const { getString } = useStrings()

  const { trackEvent } = useTelemetry()
  const [showTable, setShowTable] = useState<boolean>(false)
  const columns = useMemo(
    () => [
      {
        Header: getString('delegates.commandLineCreation.replicas'),
        accessor: 'replicas'
      },
      {
        Header: getString('delegates.commandLineCreation.totalMemory'),
        accessor: 'memory'
      },
      {
        Header: getString('delegates.commandLineCreation.numberOfParallel'),
        accessor: 'builds'
      }
    ],
    []
  )
  const data = useMemo(
    () => [
      {
        replicas: getString('delegates.commandLineCreation.replicas'),
        memory: getString('delegates.commandLineCreation.totalMemory'),
        builds: getString('delegates.commandLineCreation.numberOfParallel')
      },
      { replicas: '1', memory: '2 GB / 0.5 CPU', builds: '10' },
      { replicas: '2', memory: '4 GB / 1 CPU', builds: '20' },
      { replicas: '3', memory: '8 GB / 2 CPU', builds: '40' },
      { replicas: '4', memory: '16 GB / 4 CPU', builds: '80' }
    ],
    []
  )
  return (
    <>
      {!showTable && (
        <Text
          font={{ variation: FontVariation.SMALL }}
          color={Color.PRIMARY_7}
          icon={'nav-help'}
          iconProps={{
            color: Color.PRIMARY_7,
            size: 20,
            className: css.iconPointer,
            onClick: event => {
              event.stopPropagation()
              event.preventDefault()
              setShowTable(true)
              trackEvent(`${DelegateActions.DelegateCommandLineSizingGuideOpen}-${delegateType}`, {
                category: Category.DELEGATE
              })
            }
          }}
          margin={{ bottom: 'xxlarge' }}
        >
          <a
            rel="noreferrer"
            onClick={event => {
              event.stopPropagation()
              event.preventDefault()
              setShowTable(true)
              trackEvent(`${DelegateActions.DelegateCommandLineSizingGuideOpen}-${delegateType}`, {
                category: Category.DELEGATE
              })
            }}
          >
            {getString('delegates.commandLineCreation.delegateSizing')}
          </a>
        </Text>
      )}
      {showTable && (
        <Layout.Vertical
          spacing={'none'}
          className={css.troubleShootingContainer}
          margin={{ bottom: 'xlarge' }}
          padding={{ bottom: 'xxlarge', top: 'xxlarge', left: 'xxxlarge', right: 'xxxlarge' }}
        >
          <Layout.Horizontal
            flex={{ justifyContent: 'space-between', alignItems: 'center' }}
            margin={{ bottom: 'xlarge' }}
          >
            <Text
              font={{ variation: FontVariation.H6 }}
              icon={'nav-help'}
              iconProps={{ color: Color.PRIMARY_7, size: 20 }}
            >
              {getString('delegates.commandLineCreation.delegateSizing')}
            </Text>
            <Button
              text={getString('close')}
              icon="minus"
              variation={ButtonVariation.LINK}
              onClick={() => {
                setShowTable(false)
                trackEvent(`${DelegateActions.DelegateCommandLineSizingGuideClosed}-${delegateType}`, {
                  category: Category.DELEGATE
                })
              }}
            ></Button>
          </Layout.Horizontal>

          <Table
            columns={columns as any}
            bpTableProps={{ bordered: true, condensed: true, striped: true }}
            hideHeaders
            data={data}
          />
        </Layout.Vertical>
      )}
    </>
  )
}
export default KuberntesManifestSizingTable
