/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty as _isEmpty, defaultTo as _defaultTo, uniq } from 'lodash-es'
import type { FixedScheduleClient, GatewayDetails, Provider } from '@ce/components/COCreateGateway/models'
import type { CcmMetaData } from 'services/ce/services'
import type { HealthCheck, PortConfig, Service, ServiceDep } from 'services/lw'
import type { AccessPointScreenMode, YamlDependency } from '@ce/types'
import { providerLoadBalancerRefMap, PROVIDER_TYPES } from '@ce/constants'

export class Utils {
  static booleanToString(val: boolean): string {
    return val ? 'yes' : 'no'
  }

  static getTargetGroupObject(port: number, protocol: string): PortConfig {
    return {
      port,
      target_port: port, // eslint-disable-line
      action: 'forward',
      protocol: protocol.toLowerCase(),
      target_protocol: protocol.toLowerCase(), // eslint-disable-line
      redirect_url: '', // eslint-disable-line
      routing_rules: [], // eslint-disable-line
      server_name: '' // eslint-disable-line
    }
  }

  static isNumber(val: any): boolean {
    return !isNaN(val)
  }

  static isProviderAws = (provider: Provider): boolean => provider.value === 'aws'

  static isProviderAzure = (provider: Provider): boolean => provider.value === 'azure'

  static isProviderGcp = (provider: Provider): boolean => provider.value === 'gcp'

  static randomString(): string {
    return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
  }

  static getDefaultRuleHealthCheck = (): HealthCheck => ({
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    status_code_from: 200,
    status_code_to: 299
  })

  static toBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result || '').toString().replace(/^data:(.*,)?/, '') as string)
      reader.onerror = error => reject(error)
    })

  static getHyphenSpacedString = (str: string) => (str || '').trim().split(' ').join('-')

  static hyphenatedToSpacedString = (str: string) => (str || '').trim().split('-').join(' ')

  static isK8sRule = (details: GatewayDetails | Service) =>
    !_isEmpty(details?.routing?.k8s?.RuleJson || details?.metadata?.kubernetes_connector_id)

  static accountHasConnectors = (data: CcmMetaData): boolean => {
    return (
      data.awsConnectorsPresent ||
      data.azureConnectorsPresent ||
      data.gcpConnectorsPresent ||
      data.k8sClusterConnectorPresent
    )
  }

  static isFFEnabledForResource = (
    flags: string[] | undefined,
    featureFlagsMap: Record<string, boolean | undefined>
  ) => {
    let enableStatus = true
    if (!flags || _isEmpty(flags)) {
      return enableStatus
    }
    flags.forEach(_flag => {
      if (!featureFlagsMap[_flag]) {
        enableStatus = false
      }
    })
    return enableStatus
  }

  static fromServiceToYamlDependencies = (services: Service[] = [], dep: ServiceDep[] = []): YamlDependency[] => {
    return dep.map(_d => ({
      selector: {
        ruleName: services.find(_s => _s.id === _d.dep_id)?.name as string
      },
      wait: _d.delay_secs as number
    }))
  }

  static fromYamlToServiceDependencies = (services: Service[] = [], dep: YamlDependency[] = []): ServiceDep[] => {
    return dep.map(_d => ({
      delay_secs: _d.wait,
      dep_id: services.find(_s => _s.name === _d.selector.ruleName)?.id
    }))
  }

  static getLoadBalancerModalHeader = (
    mode: AccessPointScreenMode,
    provider: PROVIDER_TYPES,
    loadBalancerName = ''
  ) => {
    const lbRef = providerLoadBalancerRefMap[provider]
    const modeToHeaderMap: Record<AccessPointScreenMode, string> = {
      create: `Create a new ${lbRef}`,
      import: `The ${lbRef} ${loadBalancerName} requires additional Configuration`,
      edit: `Edit ${lbRef} ${loadBalancerName}`
    }
    return modeToHeaderMap[mode]
  }

  static getConditionalResult = (condition: boolean, result1: any, result2: any) => {
    return condition ? result1 : result2
  }

  static convertScheduleToClientSchedule = (schedule: any): FixedScheduleClient => {
    const { name, details, id } = schedule
    const type = !_isEmpty(details.uptime) ? 'uptime' : 'downtime'
    const typeDetails = details[type]
    const repeats = _defaultTo(typeDetails.days?.days, [])
    const allDay = typeDetails.days?.all_day
    const startTime = typeDetails.days?.start_time
    const endTime = typeDetails.days?.end_time
    const beginsOn = typeDetails.period?.start
    const endsOn = typeDetails.period?.end
    return {
      id,
      name,
      type,
      repeats,
      allDay,
      startTime,
      endTime,
      beginsOn,
      endsOn,
      everyday: repeats.length === 7,
      timezone: details.timezone,
      isDeleted: false
    }
  }

  static convertScheduleClientToSchedule = (
    schedule: FixedScheduleClient,
    id: { accountId: string; userId: string; ruleId: number; scheduleId?: number }
  ): any => {
    return {
      name: schedule.name,
      id: _defaultTo(id.scheduleId, schedule.id),
      account_id: id.accountId,
      created_by: id.userId,
      description: '',
      resources: [
        {
          ID: `${id.ruleId}`,
          Type: 'autostop_rule'
        }
      ],
      details: {
        timezone: schedule.timezone,
        [schedule.type]: {
          ...((!_isEmpty(schedule.repeats) || schedule.everyday) && {
            days: {
              days: schedule.repeats,
              all_day: schedule.allDay,
              start_time: schedule.startTime,
              end_time: schedule.endTime
            }
          }),
          ...(!_isEmpty(schedule.beginsOn) && {
            period: {
              start: schedule.beginsOn,
              end: schedule.endsOn
            }
          })
        }
      }
    }
  }

  static isUserAbortedRequest = (e: any) => {
    return e.message.includes('The user aborted a request')
  }

  static getAllCustomDomains = (serverNames: string[] = [], customDomains?: string[]): string[] => {
    return uniq([...serverNames, ..._defaultTo(customDomains, [])])
  }

  static getASErrorMessage = (e: any) => {
    return e?.data?.errors?.join('\n')
  }
}
