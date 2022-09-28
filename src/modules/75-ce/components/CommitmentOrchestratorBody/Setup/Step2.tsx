/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import {
  Checkbox,
  Color,
  Container,
  ExpandingSearchInput,
  FontVariation,
  Icon,
  Layout,
  Select,
  SelectOption,
  Table,
  Text
} from '@harness/uicore'
import type { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import {
  FiltersResponse,
  SetupInstanceType,
  SetupInstanceTypesResponse,
  useFetchFilters,
  useFetchSetupInstanceTypes
} from 'services/lw-co'
import { ExcludedInstanceType, useSetupContext } from './SetupContext'
import css from './Setup.module.scss'

interface InstanceTypeTableProps {
  filterData: { regions: SelectOption[]; instanceFamilies: SelectOption[] }
}

const DEFAULT_INSTANCE_FAMILY_OPTION: SelectOption = {
  label: 'All Instance families',
  value: ''
}
const DEFAULT_REGION_OPTION: SelectOption = {
  label: 'All Regions',
  value: ''
}

const Step2: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [instanceFamilies, setInstanceFamilies] = useState<SelectOption[]>([DEFAULT_INSTANCE_FAMILY_OPTION])
  const [regions, setRegions] = useState<SelectOption[]>([DEFAULT_REGION_OPTION])

  const { mutate: fetchFilters } = useFetchFilters({
    accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    fetchFilters({}).then((res: FiltersResponse) => {
      const { region, instance_family } = defaultTo(res.response, {})
      setRegions([
        DEFAULT_REGION_OPTION,
        ...defaultTo(region, []).map((reg: string) => ({
          label: reg,
          value: reg
        }))
      ])
      setInstanceFamilies([
        DEFAULT_INSTANCE_FAMILY_OPTION,
        ...defaultTo(instance_family, []).map((opt: string) => ({
          label: opt,
          value: opt
        }))
      ])
    })
  }, [])

  return (
    <Layout.Vertical spacing={'medium'} className={css.step2Cont}>
      <Text font={{ variation: FontVariation.H4 }}>
        {getString('ce.commitmentOrchestration.setup.steps.step2Label')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} className={css.desc}>
        {getString('ce.commitmentOrchestration.setup.step2.description')}
      </Text>
      <Container>
        <Layout.Horizontal className={css.proTipSection}>
          <Text icon="lightbulb" iconProps={{ color: Color.BLUE_500 }} color={Color.BLUE_600} className={css.tipKey}>
            {getString('ce.commitmentOrchestration.setup.step2.proTipLabel')}
          </Text>
          <Text font={{ variation: FontVariation.BODY }}>
            {' ' + getString('ce.commitmentOrchestration.setup.step2.proTipText')}
          </Text>
        </Layout.Horizontal>
      </Container>
      <InstanceTypeTable filterData={{ regions, instanceFamilies }} />
    </Layout.Vertical>
  )
}

const InstanceTypeTable: React.FC<InstanceTypeTableProps> = ({ filterData }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { setupData, setSetupData } = useSetupContext()
  const [tableData, setTableData] = useState<SetupInstanceType[]>([])
  const [filteredTableData, setFilteredTableData] = useState<SetupInstanceType[]>([])
  const [instancesInclusionMap, setInstancesInclusionMap] = useState<Record<string, boolean>>({})

  const { mutate: fetchInstanceTypes, loading } = useFetchSetupInstanceTypes({
    accountId,
    queryParams: {
      accountIdentifier: accountId,
      start_date: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL),
      end_date: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL)
    }
  })

  const cols: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'id',
        width: '5%',
        Cell: tableProps => (
          <Checkbox
            checked={instancesInclusionMap[tableProps.row.original.instance_type]}
            onChange={
              /* istanbul ignore next */ e => {
                setInstancesInclusionMap(prev => ({
                  ...prev,
                  [tableProps.row.original.instance_type]: e.currentTarget.checked
                }))
                let dataToSave = defaultTo(get(setupData, 'excludedInstances'), [])
                if (!e.currentTarget.checked) {
                  dataToSave.push(tableProps.row.original)
                } else {
                  dataToSave = dataToSave.filter(item => item.instance_type !== tableProps.row.original.instance_type)
                }
                saveExcludedInstances(dataToSave)
              }
            }
          />
        )
      },
      {
        accessor: 'instance_type',
        Header: getString('ce.co.rulesTableHeaders.name'),
        width: '20%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'region',
        Header: getString('regionLabel'),
        width: '20%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'compute_spend',
        Header: () => (
          <Container>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.commitmentOrchestration.computeSpend')}
            </Text>
            <Text>{`(${getString('ce.commitmentOrchestration.setup.step2.past30Days')})`}</Text>
          </Container>
        ),
        width: '20%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'coverage_percentage',
        Header: getString('ce.commitmentOrchestration.setup.step2.tableHeaders.coveragePerc'),
        width: '20%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'machine_type',
        Header: getString('ce.co.accessPoint.machineType'),
        width: '20%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      }
    ],
    [setupData?.excludedInstances, instancesInclusionMap]
  )

  /* istanbul ignore next */
  const saveExcludedInstances = (instances: ExcludedInstanceType[]) => {
    setSetupData?.({
      ...setupData,
      excludedInstances: instances
    })
  }

  useEffect(() => {
    const instanceType = get(setupData, 'instanceFilters.instanceFamily', null)
    const region = get(setupData, 'instanceFilters.region', null)
    fetchInstanceTypes({
      instance_types: /* istanbul ignore next */ instanceType && instanceType.value ? [instanceType.value] : [],
      regions: /* istanbul ignore next */ region && region.value ? [region.value] : []
    }).then((res: SetupInstanceTypesResponse) => {
      const prevExcludedList = defaultTo(get(setupData, 'excludedInstances'), [])
      const dataResponse = defaultTo(res.response, [])

      const includedInstancesStatusMap: Record<string, boolean> = {}
      const excludedInstancesStatusMap: Record<string, boolean> = {}
      dataResponse.forEach(item => {
        includedInstancesStatusMap[item.instance_type as string] = true
      })
      prevExcludedList.forEach(item => {
        excludedInstancesStatusMap[item.instance_type] = false
      })
      setTableData(dataResponse)
      setFilteredTableData(dataResponse)
      setInstancesInclusionMap({ ...includedInstancesStatusMap, ...excludedInstancesStatusMap })
    })
  }, [
    /* istanbul ignore next */ setupData?.instanceFilters?.instanceFamily,
    /* istanbul ignore next */ setupData?.instanceFilters?.region
  ])

  return (
    <Container className={css.instanceTypeTableCont}>
      <Layout.Vertical spacing={'medium'}>
        <Layout.Horizontal flex>
          <ExpandingSearchInput
            alwaysExpanded
            placeholder={getString('ce.commitmentOrchestration.setup.step2.searchPlaceholder')}
          />
          <Layout.Horizontal spacing={'medium'}>
            <Select
              name="instanceFamily"
              items={filterData.instanceFamilies}
              defaultSelectedItem={DEFAULT_INSTANCE_FAMILY_OPTION}
              value={get(setupData, 'instanceFilters.instanceFamily')}
              onChange={item => {
                setFilteredTableData(
                  tableData.filter(
                    /* istanbul ignore next */
                    instance =>
                      instance.instance_type?.includes(item.value as string) &&
                      (setupData?.instanceFilters?.region?.value
                        ? instance.region === setupData?.instanceFilters?.region?.value
                        : true)
                  )
                )
                /* istanbul ignore next */
                setSetupData?.({
                  ...setupData,
                  instanceFilters: {
                    ...setupData?.instanceFilters,
                    instanceFamily: item
                  }
                })
              }}
            />
            <Select
              name="region"
              items={filterData.regions}
              defaultSelectedItem={DEFAULT_REGION_OPTION}
              value={get(setupData, 'instanceFilters.region')}
              onChange={item => {
                setFilteredTableData(
                  tableData.filter(
                    /* istanbul ignore next */
                    instance =>
                      (item.value ? instance.region === item.value : true) &&
                      instance.instance_type?.includes(
                        (setupData?.instanceFilters?.instanceFamily?.value || '') as string
                      )
                  )
                )
                /* istanbul ignore next */
                setSetupData?.({
                  ...setupData,
                  instanceFilters: {
                    ...setupData?.instanceFilters,
                    region: item
                  }
                })
              }}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
        {loading ? (
          /* istanbul ignore next */ <Layout.Horizontal
            flex={{ justifyContent: 'center', alignItems: 'center' }}
            margin={{ top: 'large' }}
          >
            <Icon name="spinner" size={28} />
          </Layout.Horizontal>
        ) : (
          <Container className={css.instanceTableWrapper}>
            <Table bpTableProps={{}} columns={cols} data={filteredTableData} />
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}

export default Step2
