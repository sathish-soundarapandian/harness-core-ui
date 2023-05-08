export const expressionTrie = {
  value: 'Main',
  children: [
    {
      value: 'org',
      children: [
        {
          value: 'identifier',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'description',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'tags',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [],
      childExpressions: ['org.identifier', 'org.name', 'org.description', 'org.tags']
    },
    {
      value: 'variable',
      children: [
        {
          value: 'account',
          children: [
            {
              value: 'variable',
              children: [],
              childKeys: [],
              childExpressions: []
            },
            {
              value: 'VAR',
              children: [],
              childKeys: [],
              childExpressions: []
            },
            {
              value: 'DEMO_VAR',
              children: [],
              childKeys: [],
              childExpressions: []
            }
          ],
          childKeys: [],
          childExpressions: ['variable.account.variable', 'variable.account.VAR', 'variable.account.DEMO_VAR']
        }
      ],
      childKeys: ['account'],
      childExpressions: ['variable.account.variable', 'variable.account.VAR', 'variable.account.DEMO_VAR']
    },
    {
      value: 'project',
      children: [
        {
          value: 'identifier',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'description',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'tags',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [],
      childExpressions: ['project.identifier', 'project.name', 'project.description', 'project.tags']
    },
    {
      value: 'trigger',
      children: [
        {
          value: 'targetBranch',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'sourceBranch',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'prNumber',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'prTitle',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [],
      childExpressions: ['trigger.targetBranch', 'trigger.sourceBranch', 'trigger.prNumber', 'trigger.prTitle']
    },
    {
      value: 'account',
      children: [
        {
          value: 'name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'companyName',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [],
      childExpressions: ['account.name', 'account.companyName']
    },
    {
      value: 'pipeline',
      children: [
        {
          value: 'delegateSelectors',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'description',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'stages',
          children: [
            {
              value: 's1',
              children: [
                {
                  value: 'delegateSelectors',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'description',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'name',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'spec',
                  children: [
                    {
                      value: 'execution',
                      children: [
                        {
                          value: 'steps',
                          children: [
                            {
                              value: 'ShellScript_1',
                              children: [
                                {
                                  value: 'description',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'name',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'spec',
                                  children: [
                                    {
                                      value: 'delegateSelectors',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'onDelegate',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'source',
                                      children: [
                                        {
                                          value: 'spec',
                                          children: [
                                            {
                                              value: 'script',
                                              children: [],
                                              childKeys: [],
                                              childExpressions: []
                                            }
                                          ],
                                          childKeys: [],
                                          childExpressions: [
                                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script'
                                          ]
                                        },
                                        {
                                          value: 'type',
                                          children: [],
                                          childKeys: [],
                                          childExpressions: []
                                        }
                                      ],
                                      childKeys: [],
                                      childExpressions: [
                                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type'
                                      ]
                                    },
                                    {
                                      value: 'executionTarget',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'shell',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    }
                                  ],
                                  childKeys: ['source'],
                                  childExpressions: [
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type'
                                  ]
                                },
                                {
                                  value: 'timeout',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'when',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'endTs',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'identifier',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'startTs',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'type',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'output',
                                  children: [
                                    {
                                      value: 'outputVariables',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    }
                                  ],
                                  childKeys: [],
                                  childExpressions: [
                                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
                                  ]
                                }
                              ],
                              childKeys: ['spec'],
                              childExpressions: [
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
                                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
                              ]
                            }
                          ],
                          childKeys: ['ShellScript_1'],
                          childExpressions: [
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
                            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
                          ]
                        }
                      ],
                      childKeys: ['steps'],
                      childExpressions: [
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
                        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
                      ]
                    }
                  ],
                  childKeys: ['execution'],
                  childExpressions: [
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
                    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
                  ]
                },
                {
                  value: 'variables',
                  children: [
                    {
                      value: 'value',
                      children: [],
                      childKeys: [],
                      childExpressions: []
                    }
                  ],
                  childKeys: [],
                  childExpressions: ['pipeline.stages.s1.variables.value']
                },
                {
                  value: 'when',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'endTs',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'identifier',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'startTs',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'tags',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'type',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                }
              ],
              childKeys: ['spec'],
              childExpressions: [
                'pipeline.stages.s1.delegateSelectors',
                'pipeline.stages.s1.description',
                'pipeline.stages.s1.name',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
                'pipeline.stages.s1.variables.value',
                'pipeline.stages.s1.when',
                'pipeline.stages.s1.endTs',
                'pipeline.stages.s1.identifier',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
                'pipeline.stages.s1.startTs',
                'pipeline.stages.s1.tags',
                'pipeline.stages.s1.type',
                'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
              ]
            }
          ],
          childKeys: ['s1'],
          childExpressions: [
            'pipeline.stages.s1.delegateSelectors',
            'pipeline.stages.s1.description',
            'pipeline.stages.s1.name',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
            'pipeline.stages.s1.variables.value',
            'pipeline.stages.s1.when',
            'pipeline.stages.s1.endTs',
            'pipeline.stages.s1.identifier',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
            'pipeline.stages.s1.startTs',
            'pipeline.stages.s1.tags',
            'pipeline.stages.s1.type',
            'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
          ]
        },
        {
          value: 'endTs',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'executionId',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'identifier',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'properties',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'sequenceId',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'startTs',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'tags',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'triggerType',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'triggeredBy',
          children: [
            {
              value: 'email',
              children: [],
              childKeys: [],
              childExpressions: []
            },
            {
              value: 'name',
              children: [],
              childKeys: [],
              childExpressions: []
            }
          ],
          childKeys: [],
          childExpressions: ['pipeline.triggeredBy.email', 'pipeline.triggeredBy.name']
        },
        {
          value: 'variables',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: ['stages', 'triggeredBy'],
      childExpressions: [
        'pipeline.delegateSelectors',
        'pipeline.description',
        'pipeline.name',
        'pipeline.stages.s1.delegateSelectors',
        'pipeline.stages.s1.description',
        'pipeline.stages.s1.name',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
        'pipeline.stages.s1.variables.value',
        'pipeline.stages.s1.when',
        'pipeline.endTs',
        'pipeline.executionId',
        'pipeline.identifier',
        'pipeline.properties',
        'pipeline.sequenceId',
        'pipeline.stages.s1.endTs',
        'pipeline.stages.s1.identifier',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
        'pipeline.stages.s1.startTs',
        'pipeline.stages.s1.tags',
        'pipeline.stages.s1.type',
        'pipeline.startTs',
        'pipeline.tags',
        'pipeline.triggerType',
        'pipeline.triggeredBy.email',
        'pipeline.triggeredBy.name',
        'pipeline.variables',
        'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
      ]
    }
  ],
  childKeys: ['org', 'variable', 'project', 'trigger', 'account', 'pipeline'],
  childExpressions: [
    'org.identifier',
    'org.name',
    'org.description',
    'org.tags',
    'variable.account.variable',
    'variable.account.VAR',
    'variable.account.DEMO_VAR',
    'project.identifier',
    'project.name',
    'project.description',
    'project.tags',
    'trigger.targetBranch',
    'trigger.sourceBranch',
    'trigger.prNumber',
    'trigger.prTitle',
    'account.name',
    'account.companyName',
    'pipeline.delegateSelectors',
    'pipeline.description',
    'pipeline.name',
    'pipeline.stages.s1.delegateSelectors',
    'pipeline.stages.s1.description',
    'pipeline.stages.s1.name',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.description',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.name',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.onDelegate',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.timeout',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.when',
    'pipeline.stages.s1.variables.value',
    'pipeline.stages.s1.when',
    'pipeline.endTs',
    'pipeline.executionId',
    'pipeline.identifier',
    'pipeline.properties',
    'pipeline.sequenceId',
    'pipeline.stages.s1.endTs',
    'pipeline.stages.s1.identifier',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.endTs',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.identifier',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.executionTarget',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.shell',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.spec.source.type',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.startTs',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.type',
    'pipeline.stages.s1.startTs',
    'pipeline.stages.s1.tags',
    'pipeline.stages.s1.type',
    'pipeline.startTs',
    'pipeline.tags',
    'pipeline.triggerType',
    'pipeline.triggeredBy.email',
    'pipeline.triggeredBy.name',
    'pipeline.variables',
    'pipeline.stages.s1.spec.execution.steps.ShellScript_1.output.outputVariables'
  ]
}
