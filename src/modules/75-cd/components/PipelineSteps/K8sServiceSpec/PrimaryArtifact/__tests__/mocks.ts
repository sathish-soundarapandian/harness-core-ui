export const templatewithRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: '<+input>',
      sources: [
        {
          identifier: 'source1',
          type: 'DockerRegistry',
          spec: {
            tag: '<+input>'
          }
        }
      ]
    }
  }
}
export const templateWithoutRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: '<+input>',
      sources: '<+input>'
    }
  }
}

export const initialValuesWithRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: 'source1',
      sources: [
        {
          identifier: 'source1',
          type: 'DockerRegistry',
          spec: {
            tag: ''
          }
        }
      ]
    }
  }
}
export const initialValuesWithoutRuntime = {
  artifacts: {
    primary: {
      primaryArtifactRef: 'source1'
    }
  }
}

export const formik = {
  initialValues: {
    identifier: 'serviceV2',
    stages: [
      {
        stage: {
          identifier: 'dev',
          type: 'Deployment',
          spec: {
            environment: {
              environmentInputs: {
                identifier: 'env',
                type: 'PreProduction',
                overrides: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'manifest',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              branch: ''
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        primaryArtifactRef: '',
                        sources: ''
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  values: {
    identifier: 'serviceV2',
    stages: [
      {
        stage: {
          identifier: 'dev',
          type: 'Deployment',
          spec: {
            environment: {
              environmentInputs: {
                identifier: 'env',
                type: 'PreProduction',
                overrides: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'manifest',
                        type: 'Values',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              branch: ''
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            service: {
              serviceInputs: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        primaryArtifactRef: 'source1',
                        sources: [
                          {
                            identifier: 'source1',
                            type: 'DockerRegistry',
                            spec: {
                              tag: ''
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  setValues: jest.fn(),
  setFieldValue: jest.fn()
}
export const stageContextValue = {
  getStageFormTemplate: jest.fn(() => '<+input>'),
  updateStageFormTemplate: jest.fn()
}
