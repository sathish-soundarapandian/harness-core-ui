/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { InstanceTypes } from '../InstanceDropdownField'

export const countRequiredValues = {
  identifier: 'App_Resize_Step',
  type: 'AppResize',
  timeout: '10m',
  spec: {
    newAppInstances: {
      spec: { value: '' },
      type: InstanceTypes.Count
    },
    oldAppInstances: {
      spec: { value: '10' },
      type: InstanceTypes.Percentage
    }
  },
  name: 'App Resize Step'
}

export const negativeCountVal = {
  identifier: 'App_Resize_Step',
  type: 'AppResize',
  timeout: '10m',
  spec: {
    newAppInstances: {
      spec: { value: -1 },
      type: InstanceTypes.Count
    },
    oldAppInstances: {
      spec: { value: '10' },
      type: InstanceTypes.Percentage
    }
  },
  name: 'App Resize Step'
}

export const percentageValues = {
  identifier: 'App_Resize_Step',
  type: 'AppResize',
  timeout: '10m',
  spec: {
    newAppInstances: {
      spec: { value: '' },
      type: InstanceTypes.Percentage
    },
    oldAppInstances: {
      spec: { value: '10' },
      type: InstanceTypes.Percentage
    }
  },
  name: 'App Resize Step'
}

export const negativePercentageValues = {
  identifier: 'App_Resize_Step',
  type: 'AppResize',
  timeout: '10m',
  spec: {
    newAppInstances: {
      spec: { value: -1 },
      type: InstanceTypes.Percentage
    },
    oldAppInstances: {
      spec: { value: '10' },
      type: InstanceTypes.Percentage
    }
  },
  name: 'App Resize Step'
}
export const percentageMoreThan100Values = {
  identifier: 'App_Resize_Step',
  type: 'AppResize',
  timeout: '10m',
  spec: {
    newAppInstances: {
      spec: { value: 102 },
      type: InstanceTypes.Percentage
    },
    oldAppInstances: {
      spec: { value: '10' },
      type: InstanceTypes.Percentage
    }
  },
  name: 'App Resize Step'
}
