import type { Node, Edge } from 'reactflow'
import { MarkerType } from 'reactflow'

const nodeDefaults: Partial<Node> = {
  type: 'fourSided',
  style: { opacity: 0.2 }
}

export const defaultNodes: Node[] = [
  {
    id: 'prereq_exists',
    position: { x: 300, y: 100 },
    data: { label: 'Prerequisite exists?', includeTop: false },
    ...nodeDefaults
  },
  {
    id: 'prereq_passes',
    position: { x: 500, y: 200 },
    data: { label: 'Prerequisite passes?' },
    ...nodeDefaults
  },
  {
    id: 'flag_enabled',
    position: { x: 300, y: 300 },
    data: { label: 'Flag enabled?' },
    ...nodeDefaults
  },
  {
    id: 'target_rules_exists',
    position: { x: 300, y: 400 },
    data: { label: 'Target rules exist?' },
    ...nodeDefaults
  },
  {
    id: 'target_rules_passes',
    position: { x: 500, y: 500 },
    data: { label: 'Target rules pass?' },
    ...nodeDefaults
  },
  {
    id: 'target_group_rules_exists',
    position: { x: 300, y: 600 },
    data: { label: 'Target group rules exist?' },
    ...nodeDefaults
  },

  {
    id: 'target_group_rules_passes',
    position: { x: 500, y: 700 },
    data: { label: 'Target group rules pass?' },
    ...nodeDefaults
  },
  {
    id: 'return_variation',
    type: 'output',
    position: { x: 800, y: 400 },
    data: { label: 'Return variation', finalDestination: true, includeRight: false, includeLeft: true },
    ...nodeDefaults
  }
]

const edgeDefaults: Partial<Edge> = {
  style: { opacity: 0.2 },
  markerEnd: { type: MarkerType.ArrowClosed },
  type: 'smoothstep'
}

const yup: Edge['label'] & Partial<Edge> = {
  label: 'Yes',
  ...edgeDefaults
}

const nope: Edge['label'] & Partial<Edge> = {
  label: 'No',
  ...edgeDefaults
}

export const defaultEdges: Edge[] = [
  {
    id: 'prereq_exists-prereq_passes-yes',
    source: 'prereq_exists',
    sourceHandle: 'prereq_exists-right',
    target: 'prereq_passes',
    ...yup
  },
  {
    id: 'prereq_exists-flag_enabled-no',
    source: 'prereq_exists',
    sourceHandle: 'prereq_exists-bottom',
    target: 'flag_enabled',
    ...nope
  },
  {
    id: 'prereq_passes-flag_enabled-yes',
    source: 'prereq_passes',
    sourceHandle: 'prereq_passes-bottom',
    target: 'flag_enabled',
    ...yup
  },
  {
    id: 'prereq_passes-return_variation-no',
    source: 'prereq_passes',
    sourceHandle: 'prereq_passes-right',
    target: 'return_variation',
    ...nope
  },
  {
    id: 'flag_enabled-target_rules_exists-yes',
    source: 'flag_enabled',
    sourceHandle: 'flag_enabled-bottom',
    target: 'target_rules_exists',
    ...yup
  },
  {
    id: 'flag_enabled-return_variation-no',
    source: 'flag_enabled',
    sourceHandle: 'flag_enabled-right',
    target: 'return_variation',
    ...nope
  },
  {
    id: 'target_rules_exists-target_rules_passes-yes',
    source: 'target_rules_exists',
    sourceHandle: 'target_rules_exists-right',
    target: 'target_rules_passes',
    ...yup
  },
  {
    id: 'target_rules_exists-target_group_rules_exists-no',
    source: 'target_rules_exists',
    sourceHandle: 'target_rules_exists-bottom',
    target: 'target_group_rules_exists',
    ...nope
  },
  {
    id: 'target_rules_passes-target_group_rules_exists-no',
    source: 'target_rules_passes',
    sourceHandle: 'target_rules_passes-bottom',
    target: 'target_group_rules_exists',
    ...nope
  },
  {
    id: 'target_rules_passes-return_variation-yes',
    source: 'target_rules_passes',
    sourceHandle: 'target_rules_passes-right',
    target: 'return_variation',
    targetHandle: 'return_variation-left',
    ...yup
  },
  {
    id: 'target_group_rules_exists-target_group_rules_passes-yes',
    source: 'target_group_rules_exists',
    sourceHandle: 'target_group_rules_exists-bottom',
    target: 'target_group_rules_passes',
    ...yup
  },
  {
    id: 'target_group_rules_exists-return_variation-no',
    source: 'target_group_rules_exists',
    sourceHandle: 'target_group_rules_exists-right',
    target: 'return_variation',
    targetHandle: 'return_variation-bottom',
    ...nope
  },
  {
    id: 'target_group_rules_passes-return_variation-yes',
    source: 'target_group_rules_passes',
    sourceHandle: 'target_group_rules_passes-bottom',
    target: 'return_variation',
    targetHandle: 'return_variation-bottom',
    ...yup
  },
  {
    id: 'target_group_rules_passes-return_variation-no',
    source: 'target_group_rules_passes',
    sourceHandle: 'target_group_rules_passes-right',
    target: 'return_variation',
    targetHandle: 'return_variation-bottom',
    ...nope
  }
]
