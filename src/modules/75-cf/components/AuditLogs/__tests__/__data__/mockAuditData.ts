/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockAuditData = {
  status: 'SUCCESS',
  data: {
    itemCount: 5,
    pageCount: 1,
    pageIndex: 0,
    pageSize: 15,
    auditTrails: [
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662481077742,
        instructionSet: [
          {
            Kind: 'removeService',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: 'de77dcc7-0c65-4c18-a1ec-84e83e86e03c',
        objectBefore: 'd0456d79-be0c-4686-acda-29a422b57739',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662481047423,
        instructionSet: [
          {
            Kind: 'addService',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: 'd0456d79-be0c-4686-acda-29a422b57739',
        objectBefore: '3fb491a5-a98c-45d0-b935-a4783981738b',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480810562,
        instructionSet: [
          {
            Kind: 'updateClause',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '3fb491a5-a98c-45d0-b935-a4783981738b',
        objectBefore: '80ba8940-bc7c-4a4f-87cd-d672ddd48bcf',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addRule',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'reorderRules',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateRule',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'removeRule',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addTargetsToVariationTargetMap',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateOffVariation',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addPrerequisite',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updatePrerequisite',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'removePrerequisite',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'clearVariationTargetMapping',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'setDefaultOffVariation',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'setDefaultOnVariation',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addVariation',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              description: 'g',
              identifier: 'gh',
              name: 'gh',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              value: 'g'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateVariation',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'deleteVariation',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addTargetToFlagsVariationTargetMap',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'setAutoCommit',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'setEnabled',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateDescription',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateName',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updatePermanent',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addToExcludeList',
            Parameters: {
              segmentID: '03e0dbf0-09dd-4e2e-b52c-432ae58e3581',
              targets: ['targ1']
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addToIncludeList',
            Parameters: {
              segmentID: '03e0dbf0-09dd-4e2e-b52c-432ae58e3581',
              targets: ['targ2']
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'removeFromIncludeList',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'removeFromExcludeList',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addClause',
            Parameters: {
              attribute: 'name',
              negate: false,
              op: 'starts_with',
              segmentID: '03e0dbf0-09dd-4e2e-b52c-432ae58e3581',
              values: ['green']
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'removeClause',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'setFeatureFlagState',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              state: 'off'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'setFeatureFlagState',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              state: 'on'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'removeTargetsToVariationTargetMap',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              variation: 'test variation',
              targets: ['targ1']
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addSegmentToVariationTargetMap',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              variation: 'test variation',
              segment: 'teset segment'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'addTag',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateTag',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateDefaultServe',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              bucketBy: 'test bucketby'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662480689659,
        instructionSet: [
          {
            Kind: 'updateDefaultServe',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              identifier: 'test',
              name: 'test',
              organizationIdentifier: 'default',
              projectIdentifier: 'mock project',
              variation: 'test variation'
            }
          }
        ],
        objectAfter: '951038c3-f6c3-4dd4-9db5-b4445a2b8cd4',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      }
    ]
  }
}

export const mockNoAuditData = {
  status: 'SUCCESS',
  data: {
    itemCount: 0,
    pageCount: 1,
    pageIndex: 0,
    pageSize: 15,
    auditTrails: []
  }
}
