// https://identity.foundation/presentation-exchange/#input-descriptor-object

import { Schema } from "./Schema"

export type InputDescriptorConstraintStatus = {
  directive: "required" | "allowed" | "disallowed"
}

export type InputDescriptorConstraintStatuses = {
  active?: InputDescriptorConstraintStatus
  suspended?: InputDescriptorConstraintStatus
  revoked?: InputDescriptorConstraintStatus
}

export type InputDescriptorConstraintSubjectConstraint = {
  field_id: string[]
  directive: "required" | "preferred"
}

export type InputDescriptorConstraintFilter = {
  type: string
  format?: string
  pattern?: string
  minimum?: string | number
  minLength?: number
  maxLength?: number
  exclusiveMinimum?: string | number
  exclusiveMaximum?: string | number
  maximum?: string | number
  const?: string | number
  enum?: string[] | number[]
  not?: InputDescriptorConstraintFilter
}

export type InputDescriptorConstraintField = {
  path: string[]
  id?: string
  purpose?: string
  filter?: InputDescriptorConstraintFilter
  predicate?: "required" | "preferred"
}

export type InputDescriptorConstraints = {
  limit_disclosure?: "required" | "preferred"
  statuses?: InputDescriptorConstraintStatuses
  subject_is_issuer?: "required" | "preferred"
  is_holder?: InputDescriptorConstraintSubjectConstraint[]
  same_subject?: InputDescriptorConstraintSubjectConstraint[]
  fields?: InputDescriptorConstraintField[]
}

export type InputDescriptor = {
  id: string
  schema: Schema[]
  group?: string
  name?: string
  purpose?: string
  constaints?: InputDescriptorConstraints
}