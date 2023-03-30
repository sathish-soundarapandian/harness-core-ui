/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const pluginsWithoutRequiredField = {
  status: 'SUCCESS',
  data: {
    totalPages: 3,
    totalItems: 570,
    pageItemCount: 200,
    pageSize: 200,
    content: [
      {
        name: 'AWS CloudFormation',
        description:
          'The CloudFormation plugin can be used to create/update or delete stacks, and to validate templates.',
        kind: 'harness',
        logo: 'https://storage.googleapis.com/harness-plugins/logos/harness/cloudformation@latest',
        repo: 'https://github.com/robertstettner/drone-cloudformation',
        image: 'robertstettner/drone-cloudformation',
        uses: '',
        inputs: [
          {
            name: 'parallel',
            description: 'whether to run the batch in parallel.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'stackname',
            description: 'the name of the CloudFormation stack. Required for all but validate mode.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'region',
            description: 'the AWS region to deploy to.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'access_key',
            description: 'the AWS access key.',
            required: false,
            secret: true,
            default: null,
            allowed_values: null
          },
          {
            name: 'batch',
            description: 'an array of configurations.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'mode',
            description: 'Mode to run the plugin, options are createOrUpdate, create, delete, validate.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'template',
            description: 'the path to the CloudFormation template. Required for all but delete mode.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'params',
            description: 'object of parameters to feed into the template. Not needed for validate and delete modes.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'secret_key',
            description: 'the AWS secret key.',
            required: false,
            secret: true,
            default: null,
            allowed_values: null
          }
        ]
      }
    ]
  }
}

export const pluginsWithRequiredField = {
  status: 'SUCCESS',
  data: {
    totalPages: 3,
    totalItems: 570,
    pageItemCount: 200,
    pageSize: 200,
    content: [
      {
        name: 'AWS CloudFormation',
        description:
          'The CloudFormation plugin can be used to create/update or delete stacks, and to validate templates.',
        kind: 'harness',
        logo: 'https://storage.googleapis.com/harness-plugins/logos/harness/cloudformation@latest',
        repo: 'https://github.com/robertstettner/drone-cloudformation',
        image: 'robertstettner/drone-cloudformation',
        uses: '',
        inputs: [
          {
            name: 'parallel',
            description: 'whether to run the batch in parallel.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'stackname',
            description: 'the name of the CloudFormation stack. Required for all but validate mode.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'region',
            description: 'the AWS region to deploy to.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'access_key',
            description: 'the AWS access key.',
            required: false,
            secret: true,
            default: null,
            allowed_values: null
          },
          {
            name: 'batch',
            description: 'an array of configurations.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'mode',
            description: 'Mode to run the plugin, options are createOrUpdate, create, delete, validate.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'template',
            description: 'the path to the CloudFormation template. Required for all but delete mode.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'params',
            description: 'object of parameters to feed into the template. Not needed for validate and delete modes.',
            required: false,
            secret: false,
            default: null,
            allowed_values: null
          },
          {
            name: 'secret_key',
            description: 'the AWS secret key.',
            required: true,
            secret: true,
            default: null,
            allowed_values: null
          },
          {
            name: 'role',
            description: 'required role',
            required: true,
            secret: true,
            default: null,
            allowed_values: null
          }
        ]
      }
    ]
  }
}
