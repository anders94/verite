import {
  EncodedVerificationSubmission,
  PresentationDefinition
} from "@centre/verity"
import { has } from "lodash"
import {
  processVerificationSubmission,
  messageToVerificationFailure
} from "../validators"
import { kycVerificationRequest } from "./requests"
import { ProcessedVerificationSubmission, ValidationError } from "types"

const kycPresentationDefinition =
  kycVerificationRequest().presentation_definition

export const PRESENTATION_DEFINITIONS: PresentationDefinition[] = [
  kycPresentationDefinition
]

export function findPresentationDefinitionById(
  id: string
): PresentationDefinition | undefined {
  return PRESENTATION_DEFINITIONS.find((p) => p.id === id)
}

export async function validateVerificationSubmission(
  verificationSubmission: EncodedVerificationSubmission
): Promise<ProcessedVerificationSubmission> {
  if (
    !hasPaths(verificationSubmission, [
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      messageToVerificationFailure(
        "Input doesn't have the required format for a Credential Application"
      )
    )
  }

  /**
   * Ensure there is a valid presentation definition
   */
  const presentationDefinition = findPresentationDefinitionById(
    verificationSubmission.presentation_submission.definition_id
  )
  if (!presentationDefinition) {
    throw new ValidationError(
      "Invalid Presentation Definition ID",
      messageToVerificationFailure(
        "This issuer doesn't accept submissions associated with the presentation definition id"
      )
    )
  }

  const processed = await processVerificationSubmission(
    verificationSubmission,
    presentationDefinition
  )
  return processed
}

function hasPaths(obj: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => has(obj, key))
}