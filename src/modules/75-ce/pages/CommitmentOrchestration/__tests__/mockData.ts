/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedConfigResponse = {
  response: {
    config: {
      exclusion_list: [
        {
          instance_type: 't2.micro',
          region: 'us-east-1'
        }
      ]
    },
    enabled: false
  }
}

export const mockedSummaryResponse = {
  response: {
    compute_spend: 62.0327013728,
    ondemand_spend: 12,
    savings_plans_spend: 41.0903013728,
    reservations_spend: 8.9424,
    coverage_percentage: {
      savings_plan: 14.046901601963949,
      reserved_instances: 16.814363398229816,
      ondemand: 69.13873499980623
    },
    utilization_percentage: {
      savings_plan: 100,
      reserved_instances: 83.33333333333333
    },
    savings: {
      total: 5.273210527199999,
      percentage: 0.08500694650567302
    }
  }
}

export const mockedFiltersResponse = {
  response: {
    region: ['ap-south-1', 'us-west-1', 'us-east-1', 'ap-southeast-1', 'eu-west-2', 'ca-central-1', 'us-west-2'],
    instance_family: ['t2', 'm5', 'i3', 'c5', 'c6a', 't3a', 'm4', 't3'],
    account_id: ['357919113896', '868001352780']
  }
}

export const mockedComputeCoverageResponse = {
  response: {
    'OnDemand Instances': {
      table: {
        total_cost: 82.35274533820001,
        on_demand_cost: 82.35274533820001,
        total_hours: 913.1802047872,
        on_demand_hours: 913.1802047872
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          coverage_cost: 41.0903013728
        },
        {
          date: '2022-07-14T00:00:00Z',
          coverage_cost: 41.2624439654
        }
      ]
    },
    'Reserved Instances': {
      table: {
        total_cost: 15.5136,
        total_hours: 456,
        ri_coverage_hours: 456
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          coverage_cost: 7.7568
        },
        {
          date: '2022-07-14T00:00:00Z',
          coverage_cost: 7.7568
        }
      ]
    },
    'Savings Plans': {
      table: {
        total_cost: 32.1080210544,
        total_hours: 64.2160421088
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          coverage_cost: 16.0540105272
        },
        {
          date: '2022-07-14T00:00:00Z',
          coverage_cost: 16.0540105272
        }
      ]
    }
  }
}

export const mockedSavingsResponse = {
  response: {
    'OnDemand Instances': {
      table: {
        total: 82.35274533820001
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          coverage_cost: 41.0903013728
        },
        {
          date: '2022-07-14T00:00:00Z',
          coverage_cost: 16.0540105272
        }
      ]
    },
    'Reserved Instances': {
      table: {
        total: 15.5136
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          coverage_cost: 7.7568
        },
        {
          date: '2022-07-14T00:00:00Z',
          coverage_cost: 16.0540105272
        }
      ]
    },
    'Savings Plans': {
      table: {
        total_cost: 32.1080210544,
        total_hours: 64.2160421088
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          coverage_cost: 16.0540105272
        },
        {
          date: '2022-07-14T00:00:00Z',
          coverage_cost: 16.0540105272
        }
      ]
    }
  }
}

export const mockedUtilisationResponse = {
  response: {
    'OnDemand Instances': {
      table: {
        compute_spend: 82.35,
        utilization: 80,
        percentage: 90
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          utilization_percentage: 41.0903013728
        },
        {
          date: '2022-07-13T00:00:00Z',
          utilization_percentage: 100
        }
      ]
    },
    'Reserved Instances': {
      table: {
        compute_spend: 15.5136,
        utilization: 80,
        percentage: 90
      },
      chart: [
        {
          date: '2022-07-13T00:00:00Z',
          utilization_percentage: 7.7568
        },
        {
          date: '2022-07-13T00:00:00Z',
          utilization_percentage: 100
        }
      ]
    }
  }
}

export const mockedInstanceTypes = {
  response: [
    {
      instance_type: 'c5.large',
      region: 'ap-southeast-1',
      compute_spend: 360.923684208,
      coverage_percentage: 0,
      machine_type: 'Linux/UNIX'
    },
    {
      instance_type: 't3.micro',
      region: 'ap-southeast-1',
      compute_spend: 1.1520000000000001,
      coverage_percentage: 100,
      machine_type: 'Linux/UNIX'
    }
  ]
}
