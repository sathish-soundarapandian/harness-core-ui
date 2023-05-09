export const expressionTrie = {
  value: 'Main',
  valueTillHere: '',
  children: [
    {
      value: 'org',
      valueTillHere: 'org',
      children: [
        {
          value: 'identifier',
          valueTillHere: 'org.identifier',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'name',
          valueTillHere: 'org.name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'description',
          valueTillHere: 'org.description',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'tags',
          valueTillHere: 'org.tags',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [
        {
          key: 'identifier',
          value: 'org.identifier'
        },
        {
          key: 'name',
          value: 'org.name'
        },
        {
          key: 'description',
          value: 'org.description'
        },
        {
          key: 'tags',
          value: 'org.tags'
        }
      ],
      childExpressions: ['org.identifier', 'org.name', 'org.description', 'org.tags']
    },
    {
      value: 'variable',
      valueTillHere: 'variable',
      children: [
        {
          value: 'account',
          valueTillHere: 'variable.account',
          children: [
            {
              value: 'variable',
              valueTillHere: 'variable.account.variable',
              children: [],
              childKeys: [],
              childExpressions: []
            },
            {
              value: 'VAR',
              valueTillHere: 'variable.account.VAR',
              children: [],
              childKeys: [],
              childExpressions: []
            },
            {
              value: 'DEMO_VAR',
              valueTillHere: 'variable.account.DEMO_VAR',
              children: [],
              childKeys: [],
              childExpressions: []
            }
          ],
          childKeys: [
            {
              key: 'variable',
              value: 'variable.account.variable'
            },
            {
              key: 'VAR',
              value: 'variable.account.VAR'
            },
            {
              key: 'DEMO_VAR',
              value: 'variable.account.DEMO_VAR'
            }
          ],
          childExpressions: ['variable.account.variable', 'variable.account.VAR', 'variable.account.DEMO_VAR']
        }
      ],
      childKeys: [
        {
          key: 'account',
          value: 'variable.account'
        }
      ],
      childExpressions: ['variable.account.variable', 'variable.account.VAR', 'variable.account.DEMO_VAR']
    },
    {
      value: 'project',
      valueTillHere: 'project',
      children: [
        {
          value: 'identifier',
          valueTillHere: 'project.identifier',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'name',
          valueTillHere: 'project.name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'description',
          valueTillHere: 'project.description',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'tags',
          valueTillHere: 'project.tags',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [
        {
          key: 'identifier',
          value: 'project.identifier'
        },
        {
          key: 'name',
          value: 'project.name'
        },
        {
          key: 'description',
          value: 'project.description'
        },
        {
          key: 'tags',
          value: 'project.tags'
        }
      ],
      childExpressions: ['project.identifier', 'project.name', 'project.description', 'project.tags']
    },
    {
      value: 'trigger',
      valueTillHere: 'trigger',
      children: [
        {
          value: 'targetBranch',
          valueTillHere: 'trigger.targetBranch',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'sourceBranch',
          valueTillHere: 'trigger.sourceBranch',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'prNumber',
          valueTillHere: 'trigger.prNumber',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'prTitle',
          valueTillHere: 'trigger.prTitle',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [
        {
          key: 'targetBranch',
          value: 'trigger.targetBranch'
        },
        {
          key: 'sourceBranch',
          value: 'trigger.sourceBranch'
        },
        {
          key: 'prNumber',
          value: 'trigger.prNumber'
        },
        {
          key: 'prTitle',
          value: 'trigger.prTitle'
        }
      ],
      childExpressions: ['trigger.targetBranch', 'trigger.sourceBranch', 'trigger.prNumber', 'trigger.prTitle']
    },
    {
      value: 'account',
      valueTillHere: 'account',
      children: [
        {
          value: 'name',
          valueTillHere: 'account.name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'companyName',
          valueTillHere: 'account.companyName',
          children: [],
          childKeys: [],
          childExpressions: []
        }
      ],
      childKeys: [
        {
          key: 'name',
          value: 'account.name'
        },
        {
          key: 'companyName',
          value: 'account.companyName'
        }
      ],
      childExpressions: ['account.name', 'account.companyName']
    },
    {
      value: 'pipeline',
      valueTillHere: 'pipeline',
      children: [
        {
          value: 'delegateSelectors',
          valueTillHere: 'pipeline.delegateSelectors',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'description',
          valueTillHere: 'pipeline.description',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'name',
          valueTillHere: 'pipeline.name',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'stages',
          valueTillHere: 'pipeline.stages',
          children: [
            {
              value: 'stage1',
              valueTillHere: 'pipeline.stages.stage1',
              children: [
                {
                  value: 'delegateSelectors',
                  valueTillHere: 'pipeline.stages.stage1.delegateSelectors',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'description',
                  valueTillHere: 'pipeline.stages.stage1.description',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'name',
                  valueTillHere: 'pipeline.stages.stage1.name',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'spec',
                  valueTillHere: 'pipeline.stages.stage1.spec',
                  children: [
                    {
                      value: 'execution',
                      valueTillHere: 'pipeline.stages.stage1.spec.execution',
                      children: [
                        {
                          value: 'steps',
                          valueTillHere: 'pipeline.stages.stage1.spec.execution.steps',
                          children: [
                            {
                              value: 'ShellScript_1',
                              valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1',
                              children: [
                                {
                                  value: 'description',
                                  valueTillHere:
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'name',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'spec',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec',
                                  children: [
                                    {
                                      value: 'delegateSelectors',
                                      valueTillHere:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'onDelegate',
                                      valueTillHere:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'source',
                                      valueTillHere:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source',
                                      children: [
                                        {
                                          value: 'spec',
                                          valueTillHere:
                                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec',
                                          children: [
                                            {
                                              value: 'script',
                                              valueTillHere:
                                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                              children: [],
                                              childKeys: [],
                                              childExpressions: []
                                            }
                                          ],
                                          childKeys: [
                                            {
                                              key: 'script',
                                              value:
                                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script'
                                            }
                                          ],
                                          childExpressions: [
                                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script'
                                          ]
                                        },
                                        {
                                          value: 'type',
                                          valueTillHere:
                                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
                                          children: [],
                                          childKeys: [],
                                          childExpressions: []
                                        }
                                      ],
                                      childKeys: [
                                        {
                                          key: 'spec',
                                          value:
                                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec'
                                        },
                                        {
                                          key: 'type',
                                          value:
                                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type'
                                        }
                                      ],
                                      childExpressions: [
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type'
                                      ]
                                    },
                                    {
                                      value: 'executionTarget',
                                      valueTillHere:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'shell',
                                      valueTillHere:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    }
                                  ],
                                  childKeys: [
                                    {
                                      key: 'delegateSelectors',
                                      value:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors'
                                    },
                                    {
                                      key: 'onDelegate',
                                      value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate'
                                    },
                                    {
                                      key: 'source',
                                      value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source'
                                    },
                                    {
                                      key: 'executionTarget',
                                      value:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget'
                                    },
                                    {
                                      key: 'shell',
                                      value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell'
                                    }
                                  ],
                                  childExpressions: [
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type'
                                  ]
                                },
                                {
                                  value: 'timeout',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'when',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'endTs',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'identifier',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'startTs',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'type',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'output',
                                  valueTillHere: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output',
                                  children: [
                                    {
                                      value: 'outputVariables',
                                      valueTillHere:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    }
                                  ],
                                  childKeys: [
                                    {
                                      key: 'outputVariables',
                                      value:
                                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
                                    }
                                  ],
                                  childExpressions: [
                                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
                                  ]
                                }
                              ],
                              childKeys: [
                                {
                                  key: 'description',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description'
                                },
                                {
                                  key: 'name',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name'
                                },
                                {
                                  key: 'spec',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec'
                                },
                                {
                                  key: 'timeout',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout'
                                },
                                {
                                  key: 'when',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when'
                                },
                                {
                                  key: 'endTs',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs'
                                },
                                {
                                  key: 'identifier',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier'
                                },
                                {
                                  key: 'startTs',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs'
                                },
                                {
                                  key: 'type',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type'
                                },
                                {
                                  key: 'output',
                                  value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output'
                                }
                              ],
                              childExpressions: [
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
                                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
                              ]
                            }
                          ],
                          childKeys: [
                            {
                              key: 'ShellScript_1',
                              value: 'pipeline.stages.stage1.spec.execution.steps.ShellScript_1'
                            }
                          ],
                          childExpressions: [
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
                            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
                          ]
                        }
                      ],
                      childKeys: [
                        {
                          key: 'steps',
                          value: 'pipeline.stages.stage1.spec.execution.steps'
                        }
                      ],
                      childExpressions: [
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
                        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
                      ]
                    }
                  ],
                  childKeys: [
                    {
                      key: 'execution',
                      value: 'pipeline.stages.stage1.spec.execution'
                    }
                  ],
                  childExpressions: [
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
                    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
                  ]
                },
                {
                  value: 'when',
                  valueTillHere: 'pipeline.stages.stage1.when',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'endTs',
                  valueTillHere: 'pipeline.stages.stage1.endTs',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'identifier',
                  valueTillHere: 'pipeline.stages.stage1.identifier',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'startTs',
                  valueTillHere: 'pipeline.stages.stage1.startTs',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'tags',
                  valueTillHere: 'pipeline.stages.stage1.tags',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'type',
                  valueTillHere: 'pipeline.stages.stage1.type',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'variables',
                  valueTillHere: 'pipeline.stages.stage1.variables',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                }
              ],
              childKeys: [
                {
                  key: 'delegateSelectors',
                  value: 'pipeline.stages.stage1.delegateSelectors'
                },
                {
                  key: 'description',
                  value: 'pipeline.stages.stage1.description'
                },
                {
                  key: 'name',
                  value: 'pipeline.stages.stage1.name'
                },
                {
                  key: 'spec',
                  value: 'pipeline.stages.stage1.spec'
                },
                {
                  key: 'when',
                  value: 'pipeline.stages.stage1.when'
                },
                {
                  key: 'endTs',
                  value: 'pipeline.stages.stage1.endTs'
                },
                {
                  key: 'identifier',
                  value: 'pipeline.stages.stage1.identifier'
                },
                {
                  key: 'startTs',
                  value: 'pipeline.stages.stage1.startTs'
                },
                {
                  key: 'tags',
                  value: 'pipeline.stages.stage1.tags'
                },
                {
                  key: 'type',
                  value: 'pipeline.stages.stage1.type'
                },
                {
                  key: 'variables',
                  value: 'pipeline.stages.stage1.variables'
                }
              ],
              childExpressions: [
                'pipeline.stages.stage1.delegateSelectors',
                'pipeline.stages.stage1.description',
                'pipeline.stages.stage1.name',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
                'pipeline.stages.stage1.when',
                'pipeline.stages.stage1.endTs',
                'pipeline.stages.stage1.identifier',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
                'pipeline.stages.stage1.startTs',
                'pipeline.stages.stage1.tags',
                'pipeline.stages.stage1.type',
                'pipeline.stages.stage1.variables',
                'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables'
              ]
            },
            {
              value: 'stage2',
              valueTillHere: 'pipeline.stages.stage2',
              children: [
                {
                  value: 'delegateSelectors',
                  valueTillHere: 'pipeline.stages.stage2.delegateSelectors',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'description',
                  valueTillHere: 'pipeline.stages.stage2.description',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'name',
                  valueTillHere: 'pipeline.stages.stage2.name',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'spec',
                  valueTillHere: 'pipeline.stages.stage2.spec',
                  children: [
                    {
                      value: 'execution',
                      valueTillHere: 'pipeline.stages.stage2.spec.execution',
                      children: [
                        {
                          value: 'steps',
                          valueTillHere: 'pipeline.stages.stage2.spec.execution.steps',
                          children: [
                            {
                              value: 'ShellScript_1',
                              valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1',
                              children: [
                                {
                                  value: 'description',
                                  valueTillHere:
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'name',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'spec',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec',
                                  children: [
                                    {
                                      value: 'delegateSelectors',
                                      valueTillHere:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'onDelegate',
                                      valueTillHere:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'source',
                                      valueTillHere:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source',
                                      children: [
                                        {
                                          value: 'spec',
                                          valueTillHere:
                                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec',
                                          children: [
                                            {
                                              value: 'script',
                                              valueTillHere:
                                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                              children: [],
                                              childKeys: [],
                                              childExpressions: []
                                            }
                                          ],
                                          childKeys: [
                                            {
                                              key: 'script',
                                              value:
                                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script'
                                            }
                                          ],
                                          childExpressions: [
                                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script'
                                          ]
                                        },
                                        {
                                          value: 'type',
                                          valueTillHere:
                                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
                                          children: [],
                                          childKeys: [],
                                          childExpressions: []
                                        }
                                      ],
                                      childKeys: [
                                        {
                                          key: 'spec',
                                          value:
                                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec'
                                        },
                                        {
                                          key: 'type',
                                          value:
                                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type'
                                        }
                                      ],
                                      childExpressions: [
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type'
                                      ]
                                    },
                                    {
                                      value: 'executionTarget',
                                      valueTillHere:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    },
                                    {
                                      value: 'shell',
                                      valueTillHere:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    }
                                  ],
                                  childKeys: [
                                    {
                                      key: 'delegateSelectors',
                                      value:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors'
                                    },
                                    {
                                      key: 'onDelegate',
                                      value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate'
                                    },
                                    {
                                      key: 'source',
                                      value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source'
                                    },
                                    {
                                      key: 'executionTarget',
                                      value:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget'
                                    },
                                    {
                                      key: 'shell',
                                      value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell'
                                    }
                                  ],
                                  childExpressions: [
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type'
                                  ]
                                },
                                {
                                  value: 'timeout',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'when',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'endTs',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'identifier',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'startTs',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'type',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
                                  children: [],
                                  childKeys: [],
                                  childExpressions: []
                                },
                                {
                                  value: 'output',
                                  valueTillHere: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output',
                                  children: [
                                    {
                                      value: 'outputVariables',
                                      valueTillHere:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables',
                                      children: [],
                                      childKeys: [],
                                      childExpressions: []
                                    }
                                  ],
                                  childKeys: [
                                    {
                                      key: 'outputVariables',
                                      value:
                                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
                                    }
                                  ],
                                  childExpressions: [
                                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
                                  ]
                                }
                              ],
                              childKeys: [
                                {
                                  key: 'description',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description'
                                },
                                {
                                  key: 'name',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name'
                                },
                                {
                                  key: 'spec',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec'
                                },
                                {
                                  key: 'timeout',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout'
                                },
                                {
                                  key: 'when',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when'
                                },
                                {
                                  key: 'endTs',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs'
                                },
                                {
                                  key: 'identifier',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier'
                                },
                                {
                                  key: 'startTs',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs'
                                },
                                {
                                  key: 'type',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type'
                                },
                                {
                                  key: 'output',
                                  value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output'
                                }
                              ],
                              childExpressions: [
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
                                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
                              ]
                            }
                          ],
                          childKeys: [
                            {
                              key: 'ShellScript_1',
                              value: 'pipeline.stages.stage2.spec.execution.steps.ShellScript_1'
                            }
                          ],
                          childExpressions: [
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
                            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
                          ]
                        }
                      ],
                      childKeys: [
                        {
                          key: 'steps',
                          value: 'pipeline.stages.stage2.spec.execution.steps'
                        }
                      ],
                      childExpressions: [
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
                        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
                      ]
                    }
                  ],
                  childKeys: [
                    {
                      key: 'execution',
                      value: 'pipeline.stages.stage2.spec.execution'
                    }
                  ],
                  childExpressions: [
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
                    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
                  ]
                },
                {
                  value: 'when',
                  valueTillHere: 'pipeline.stages.stage2.when',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'endTs',
                  valueTillHere: 'pipeline.stages.stage2.endTs',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'identifier',
                  valueTillHere: 'pipeline.stages.stage2.identifier',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'startTs',
                  valueTillHere: 'pipeline.stages.stage2.startTs',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'tags',
                  valueTillHere: 'pipeline.stages.stage2.tags',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'type',
                  valueTillHere: 'pipeline.stages.stage2.type',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                },
                {
                  value: 'variables',
                  valueTillHere: 'pipeline.stages.stage2.variables',
                  children: [],
                  childKeys: [],
                  childExpressions: []
                }
              ],
              childKeys: [
                {
                  key: 'delegateSelectors',
                  value: 'pipeline.stages.stage2.delegateSelectors'
                },
                {
                  key: 'description',
                  value: 'pipeline.stages.stage2.description'
                },
                {
                  key: 'name',
                  value: 'pipeline.stages.stage2.name'
                },
                {
                  key: 'spec',
                  value: 'pipeline.stages.stage2.spec'
                },
                {
                  key: 'when',
                  value: 'pipeline.stages.stage2.when'
                },
                {
                  key: 'endTs',
                  value: 'pipeline.stages.stage2.endTs'
                },
                {
                  key: 'identifier',
                  value: 'pipeline.stages.stage2.identifier'
                },
                {
                  key: 'startTs',
                  value: 'pipeline.stages.stage2.startTs'
                },
                {
                  key: 'tags',
                  value: 'pipeline.stages.stage2.tags'
                },
                {
                  key: 'type',
                  value: 'pipeline.stages.stage2.type'
                },
                {
                  key: 'variables',
                  value: 'pipeline.stages.stage2.variables'
                }
              ],
              childExpressions: [
                'pipeline.stages.stage2.delegateSelectors',
                'pipeline.stages.stage2.description',
                'pipeline.stages.stage2.name',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
                'pipeline.stages.stage2.when',
                'pipeline.stages.stage2.endTs',
                'pipeline.stages.stage2.identifier',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
                'pipeline.stages.stage2.startTs',
                'pipeline.stages.stage2.tags',
                'pipeline.stages.stage2.type',
                'pipeline.stages.stage2.variables',
                'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
              ]
            }
          ],
          childKeys: [
            {
              key: 'stage1',
              value: 'pipeline.stages.stage1'
            },
            {
              key: 'stage2',
              value: 'pipeline.stages.stage2'
            }
          ],
          childExpressions: [
            'pipeline.stages.stage1.delegateSelectors',
            'pipeline.stages.stage1.description',
            'pipeline.stages.stage1.name',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
            'pipeline.stages.stage1.when',
            'pipeline.stages.stage2.delegateSelectors',
            'pipeline.stages.stage2.description',
            'pipeline.stages.stage2.name',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
            'pipeline.stages.stage2.when',
            'pipeline.stages.stage1.endTs',
            'pipeline.stages.stage1.identifier',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
            'pipeline.stages.stage1.startTs',
            'pipeline.stages.stage1.tags',
            'pipeline.stages.stage1.type',
            'pipeline.stages.stage1.variables',
            'pipeline.stages.stage2.endTs',
            'pipeline.stages.stage2.identifier',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
            'pipeline.stages.stage2.startTs',
            'pipeline.stages.stage2.tags',
            'pipeline.stages.stage2.type',
            'pipeline.stages.stage2.variables',
            'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables',
            'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
          ]
        },
        {
          value: 'variables',
          valueTillHere: 'pipeline.variables',
          children: [
            {
              value: 'pipelineVariable',
              valueTillHere: 'pipeline.variables.pipelineVariable',
              children: [],
              childKeys: [],
              childExpressions: []
            }
          ],
          childKeys: [
            {
              key: 'pipelineVariable',
              value: 'pipeline.variables.pipelineVariable'
            }
          ],
          childExpressions: ['pipeline.variables.pipelineVariable']
        },
        {
          value: 'endTs',
          valueTillHere: 'pipeline.endTs',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'executionId',
          valueTillHere: 'pipeline.executionId',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'identifier',
          valueTillHere: 'pipeline.identifier',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'properties',
          valueTillHere: 'pipeline.properties',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'sequenceId',
          valueTillHere: 'pipeline.sequenceId',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'startTs',
          valueTillHere: 'pipeline.startTs',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'tags',
          valueTillHere: 'pipeline.tags',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'triggerType',
          valueTillHere: 'pipeline.triggerType',
          children: [],
          childKeys: [],
          childExpressions: []
        },
        {
          value: 'triggeredBy',
          valueTillHere: 'pipeline.triggeredBy',
          children: [
            {
              value: 'email',
              valueTillHere: 'pipeline.triggeredBy.email',
              children: [],
              childKeys: [],
              childExpressions: []
            },
            {
              value: 'name',
              valueTillHere: 'pipeline.triggeredBy.name',
              children: [],
              childKeys: [],
              childExpressions: []
            }
          ],
          childKeys: [
            {
              key: 'email',
              value: 'pipeline.triggeredBy.email'
            },
            {
              key: 'name',
              value: 'pipeline.triggeredBy.name'
            }
          ],
          childExpressions: ['pipeline.triggeredBy.email', 'pipeline.triggeredBy.name']
        }
      ],
      childKeys: [
        {
          key: 'delegateSelectors',
          value: 'pipeline.delegateSelectors'
        },
        {
          key: 'description',
          value: 'pipeline.description'
        },
        {
          key: 'name',
          value: 'pipeline.name'
        },
        {
          key: 'stages',
          value: 'pipeline.stages'
        },
        {
          key: 'variables',
          value: 'pipeline.variables'
        },
        {
          key: 'endTs',
          value: 'pipeline.endTs'
        },
        {
          key: 'executionId',
          value: 'pipeline.executionId'
        },
        {
          key: 'identifier',
          value: 'pipeline.identifier'
        },
        {
          key: 'properties',
          value: 'pipeline.properties'
        },
        {
          key: 'sequenceId',
          value: 'pipeline.sequenceId'
        },
        {
          key: 'startTs',
          value: 'pipeline.startTs'
        },
        {
          key: 'tags',
          value: 'pipeline.tags'
        },
        {
          key: 'triggerType',
          value: 'pipeline.triggerType'
        },
        {
          key: 'triggeredBy',
          value: 'pipeline.triggeredBy'
        }
      ],
      childExpressions: [
        'pipeline.delegateSelectors',
        'pipeline.description',
        'pipeline.name',
        'pipeline.stages.stage1.delegateSelectors',
        'pipeline.stages.stage1.description',
        'pipeline.stages.stage1.name',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
        'pipeline.stages.stage1.when',
        'pipeline.stages.stage2.delegateSelectors',
        'pipeline.stages.stage2.description',
        'pipeline.stages.stage2.name',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
        'pipeline.stages.stage2.when',
        'pipeline.variables.pipelineVariable',
        'pipeline.endTs',
        'pipeline.executionId',
        'pipeline.identifier',
        'pipeline.properties',
        'pipeline.sequenceId',
        'pipeline.stages.stage1.endTs',
        'pipeline.stages.stage1.identifier',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
        'pipeline.stages.stage1.startTs',
        'pipeline.stages.stage1.tags',
        'pipeline.stages.stage1.type',
        'pipeline.stages.stage1.variables',
        'pipeline.stages.stage2.endTs',
        'pipeline.stages.stage2.identifier',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
        'pipeline.stages.stage2.startTs',
        'pipeline.stages.stage2.tags',
        'pipeline.stages.stage2.type',
        'pipeline.stages.stage2.variables',
        'pipeline.startTs',
        'pipeline.tags',
        'pipeline.triggerType',
        'pipeline.triggeredBy.email',
        'pipeline.triggeredBy.name',
        'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables',
        'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
      ]
    }
  ],
  childKeys: [
    {
      key: 'org',
      value: 'org'
    },
    {
      key: 'variable',
      value: 'variable'
    },
    {
      key: 'project',
      value: 'project'
    },
    {
      key: 'trigger',
      value: 'trigger'
    },
    {
      key: 'account',
      value: 'account'
    },
    {
      key: 'pipeline',
      value: 'pipeline'
    }
  ],
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
    'pipeline.stages.stage1.delegateSelectors',
    'pipeline.stages.stage1.description',
    'pipeline.stages.stage1.name',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.description',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.name',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.onDelegate',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.spec.script',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.timeout',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.when',
    'pipeline.stages.stage1.when',
    'pipeline.stages.stage2.delegateSelectors',
    'pipeline.stages.stage2.description',
    'pipeline.stages.stage2.name',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.description',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.name',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.delegateSelectors',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.onDelegate',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.spec.script',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.timeout',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.when',
    'pipeline.stages.stage2.when',
    'pipeline.variables.pipelineVariable',
    'pipeline.endTs',
    'pipeline.executionId',
    'pipeline.identifier',
    'pipeline.properties',
    'pipeline.sequenceId',
    'pipeline.stages.stage1.endTs',
    'pipeline.stages.stage1.identifier',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.endTs',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.identifier',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.executionTarget',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.shell',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.spec.source.type',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.startTs',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.type',
    'pipeline.stages.stage1.startTs',
    'pipeline.stages.stage1.tags',
    'pipeline.stages.stage1.type',
    'pipeline.stages.stage1.variables',
    'pipeline.stages.stage2.endTs',
    'pipeline.stages.stage2.identifier',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.endTs',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.identifier',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.executionTarget',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.shell',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.spec.source.type',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.startTs',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.type',
    'pipeline.stages.stage2.startTs',
    'pipeline.stages.stage2.tags',
    'pipeline.stages.stage2.type',
    'pipeline.stages.stage2.variables',
    'pipeline.startTs',
    'pipeline.tags',
    'pipeline.triggerType',
    'pipeline.triggeredBy.email',
    'pipeline.triggeredBy.name',
    'pipeline.stages.stage1.spec.execution.steps.ShellScript_1.output.outputVariables',
    'pipeline.stages.stage2.spec.execution.steps.ShellScript_1.output.outputVariables'
  ]
}
