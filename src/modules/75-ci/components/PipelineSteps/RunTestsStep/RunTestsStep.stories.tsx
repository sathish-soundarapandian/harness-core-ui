/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  factory,
  TestStepWidget,
  TestStepWidgetProps
} from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { RunTestsStep as RunTestsStepComponent } from './RunTestsStep'

factory.registerStep(new RunTestsStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / RunTestsStep',
  // eslint-disable-next-line react/display-name
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const RunTestsStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}

RunTestsStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.RunTests,
    description: 'Description',
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      image: 'image',
      language: 'java',
      buildTool: 'maven',
      args: '-Dmaven.test.failure.ignore=true -T 2C test -e -Dbuild.number=${BUILD_NUMBER}',
      packages: 'io.harness., software.wings., migrations.',
      runOnlySelectedTests: false,
      testAnnotations: 'org.junit.Test, org.junit.jupiter.api.Test, org.testng.annotations.Test',
      preCommand: 'pre command',
      postCommand: 'post command',
      reports: {
        type: 'JUnit',
        spec: {
          paths: ['path1.xml', 'path2.xml', 'path3.xml', 'path4.xml', 'path5.xml']
        }
      },
      envVariables: {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      },
      outputVariables: [{ name: 'variable1' }, { name: 'variable2' }, { name: 'variable3' }, { name: 'variable4' }],
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: 'always',
      resources: {
        limits: {
          memory: '128Mi',
          cpu: '0.2'
        }
      }
    }
  },
  type: StepType.RunTests,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.RunTests,
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      image: RUNTIME_INPUT_VALUE,
      args: RUNTIME_INPUT_VALUE,
      packages: RUNTIME_INPUT_VALUE,
      runOnlySelectedTests: RUNTIME_INPUT_VALUE,
      testAnnotations: RUNTIME_INPUT_VALUE,
      preCommand: RUNTIME_INPUT_VALUE,
      postCommand: RUNTIME_INPUT_VALUE,
      reports: {
        type: 'JUnit',
        spec: {
          paths: RUNTIME_INPUT_VALUE
        }
      },
      envVariables: RUNTIME_INPUT_VALUE,
      outputVariables: RUNTIME_INPUT_VALUE,
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  allValues: {
    type: StepType.RunTests,
    name: 'Test A',
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      image: RUNTIME_INPUT_VALUE,
      args: RUNTIME_INPUT_VALUE,
      packages: RUNTIME_INPUT_VALUE,
      runOnlySelectedTests: RUNTIME_INPUT_VALUE,
      testAnnotations: RUNTIME_INPUT_VALUE,
      preCommand: RUNTIME_INPUT_VALUE,
      postCommand: RUNTIME_INPUT_VALUE,
      reports: {
        type: 'JUnit',
        spec: {
          paths: RUNTIME_INPUT_VALUE
        }
      },
      envVariables: RUNTIME_INPUT_VALUE,
      outputVariables: RUNTIME_INPUT_VALUE,
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.name',
          localName: 'step.runTests.name'
        }
      },
      'step-description': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.description',
          localName: 'step.runTests.description'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.timeout',
          localName: 'step.runTests.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.connectorRef',
          localName: 'step.runTests.spec.connectorRef'
        }
      },
      'step-image': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.image',
          localName: 'step.runTests.spec.image'
        }
      },
      'step-language': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.language',
          localName: 'step.runTests.spec.language'
        }
      },
      'step-buildTool': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.buildTool',
          localName: 'step.runTests.spec.buildTool'
        }
      },
      'step-args': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.args',
          localName: 'step.runTests.spec.args'
        }
      },
      'step-packages': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.packages',
          localName: 'step.runTests.spec.packages'
        }
      },
      'step-runOnlySelectedTests': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.runOnlySelectedTests',
          localName: 'step.runTests.spec.runOnlySelectedTests'
        }
      },
      'step-testAnnotations': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.testAnnotations',
          localName: 'step.runTests.spec.testAnnotations'
        }
      },
      'step-preCommand': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.preCommand',
          localName: 'step.runTests.spec.preCommand'
        }
      },
      'step-postCommand': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.postCommand',
          localName: 'step.runTests.spec.postCommand'
        }
      },
      'step-reportPaths': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.reports.spec.paths',
          localName: 'step.runTests.spec.reports.spec.paths'
        }
      },
      'step-envVariables': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.spec.runTests.envVariables',
          localName: 'step.runTests.spec.envVariables'
        }
      },
      'step-outputVariables': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.outputVariables',
          localName: 'step.runTests.spec.outputVariables'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.pull',
      //     localName: 'step.runTests.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.resources.limits.memory',
          localName: 'step.runTests.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.runTests.spec.resources.limits.cpu',
          localName: 'step.runTests.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.RunTests,
      identifier: 'runTests',
      name: 'step-name',
      description: 'step-description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        image: 'step-image',
        language: 'step-language',
        buildTool: 'step-buildTool',
        args: 'step-args',
        packages: 'step-packages',
        runOnlySelectedTests: 'step-runOnlySelectedTests',
        testAnnotations: 'step-testAnnotations',
        preCommand: 'step-preCommand',
        postCommand: 'step-postCommand',
        reports: {
          spec: {
            paths: 'step-reportPaths'
          }
        },
        envVariables: 'step-envVariables',
        outputVariables: 'step-outputVariables',
        // TODO: Right now we do not support Image Pull Policy but will do in the future
        // pull: 'step-pull',
        resources: {
          limits: {
            memory: 'step-limitMemory',
            cpu: 'step-limitCPU'
          }
        }
      }
    }
  }
}
