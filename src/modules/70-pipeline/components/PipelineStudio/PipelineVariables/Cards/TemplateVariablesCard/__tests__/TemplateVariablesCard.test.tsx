import React from 'react'
import { render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import TemplateVariablesCard, {
  TemplateVariablesCardProps
} from '@pipeline/components/PipelineStudio/PipelineVariables/Cards/TemplateVariablesCard/TemplateVariablesCard'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { NGVariable } from 'services/pipeline-ng'

const baseProps: TemplateVariablesCardProps = {
  variableVariables: [
    {
      name: 'var1',
      type: 'String',
      description: 'B7CvLEz5RaqKJhOukNZgoA',
      value: 'v3s1hLGDS0ucwF1X3Yek3g',
      __uuid: 'K6eF-MapS1OBUq0RWklMbA'
    },
    {
      name: 'var2',
      type: 'String',
      description: 'Ip_wDXFWRYy-2VdIR15Gsw',
      value: 'lhSYVGLTTfSNZnP4__5OXg',
      __uuid: 'E9LNEUVDQr-RiFsXwfvJUA'
    }
  ] as unknown as NGVariable[],
  variables: [
    {
      name: 'var1',
      type: 'String',
      value: '<+input>'
    },
    {
      name: 'var2',
      type: 'String',
      value: '<+input>'
    }
  ] as unknown as NGVariable[],
  metadataMap: {
    gqaH2BXmTZyxvmOFLpNoJw: {
      yamlProperties: {
        fqn: 'timeout',
        localName: 'timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    GJn52W6kTYSI7DsqZPNPGg: {
      yamlProperties: {
        fqn: 'name',
        localName: 'name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    lhSYVGLTTfSNZnP4__5OXg: {
      yamlProperties: {
        fqn: 'var2',
        localName: 'var2',
        variableName: 'var2',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: null,
      yamlExtraProperties: null
    },
    T2DTgZUuRkOERpQr_o76cA: {
      yamlProperties: {
        fqn: '',
        localName: '',
        variableName: '',
        aliasFQN: '',
        visible: false
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [
          {
            fqn: 'type',
            localName: 'type',
            variableName: 'type',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: 'identifier',
            localName: 'identifier',
            variableName: 'identifier',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: 'when',
            localName: 'when',
            variableName: 'when',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.startTs',
            localName: '.startTs',
            variableName: '',
            aliasFQN: '',
            visible: false
          },
          {
            fqn: '.endTs',
            localName: '.endTs',
            variableName: '',
            aliasFQN: '',
            visible: false
          }
        ],
        outputproperties: [
          {
            fqn: '.output.httpUrl',
            localName: '.output.httpUrl',
            variableName: '',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.output.httpMethod',
            localName: '.output.httpMethod',
            variableName: '',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.output.httpResponseCode',
            localName: '.output.httpResponseCode',
            variableName: '',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.output.httpResponseBody',
            localName: '.output.httpResponseBody',
            variableName: '',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.output.status',
            localName: '.output.status',
            variableName: '',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.output.errorMsg',
            localName: '.output.errorMsg',
            variableName: '',
            aliasFQN: '',
            visible: true
          },
          {
            fqn: '.output.outputVariables',
            localName: '.output.outputVariables',
            variableName: '',
            aliasFQN: '',
            visible: true
          }
        ]
      }
    },
    v3s1hLGDS0ucwF1X3Yek3g: {
      yamlProperties: {
        fqn: 'var1',
        localName: 'var1',
        variableName: 'var1',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: null,
      yamlExtraProperties: null
    },
    qnL_0ASKRtS0_XgGw64_Qw: {
      yamlProperties: {
        fqn: 'spec.method',
        localName: 'spec.method',
        variableName: 'method',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    'i50TW6K_T--8P6NFuaXPIw': {
      yamlProperties: {
        fqn: 'spec.requestBody',
        localName: 'spec.requestBody',
        variableName: 'requestBody',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    'pPxSQS7-RT6SjwPAPogE8Q': {
      yamlProperties: {
        fqn: 'description',
        localName: 'description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    'IvujVQy3R-21Ms3fmtV7kQ': {
      yamlProperties: {
        fqn: 'spec.assertion',
        localName: 'spec.assertion',
        variableName: 'assertion',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    eWLGvZ0UQPaYKx0lIx1vJg: {
      yamlProperties: {
        fqn: 'spec.url',
        localName: 'spec.url',
        variableName: 'url',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    },
    BcxVAZUQR7egzk4sci8h1g: {
      yamlProperties: {
        fqn: 'spec.delegateSelectors',
        localName: 'spec.delegateSelectors',
        variableName: 'delegateSelectors',
        aliasFQN: '',
        visible: true
      },
      yamlOutputProperties: {
        fqn: '',
        localName: ''
      },
      yamlExtraProperties: {
        properties: [],
        outputproperties: []
      }
    }
  } as any,
  stepsFactory: factory,
  updateVariables: noop,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
}

describe('<TemplateVariablesCard/> tests', () => {
  test('should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateVariablesCard {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
