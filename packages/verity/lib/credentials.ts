import { verifyCredential, verifyPresentation } from "did-jwt-vc"
import {
  JWT,
  JwtCredentialPayload,
  JwtPresentationPayload,
  RevocationList2021Status,
  VerificationError,
  VerifiableCredential,
  RevocableCredential,
  RevocationListCredential,
  Verifiable,
  W3CCredential,
  W3CPresentation
} from "../types"
import { didKeyResolver } from "./didKey"

export function verifiablePresentationPayload(
  subject: string,
  vcJwt: VerifiableCredential | VerifiableCredential[] = []
): JwtPresentationPayload {
  return {
    sub: subject,
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: subject,
      verifiableCredential: [vcJwt].flat()
    }
  }
}

export function verifiableCredentialPayload(
  type: string,
  subject: string,
  attestation: Record<string, unknown>,
  credentialStatus?: RevocationList2021Status
): JwtCredentialPayload {
  const payload = {
    sub: subject,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://verity.id/identity"
      ],
      type: ["VerifiableCredential", type],
      credentialSubject: {
        [type]: attestation,
        id: subject
      }
    }
  }

  if (credentialStatus) {
    Object.assign(payload, { credentialStatus: credentialStatus })
  }

  return payload
}

export function kycAmlVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>,
  credentialStatus: RevocationList2021Status
): JwtCredentialPayload {
  return verifiableCredentialPayload(
    "KYCAMLAttestation",
    subject,
    attestation,
    credentialStatus
  )
}

export function creditScoreVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>,
  credentialStatus: RevocationList2021Status
): JwtCredentialPayload {
  return verifiableCredentialPayload(
    "CreditScoreAttestation",
    subject,
    attestation,
    credentialStatus
  )
}

/**
 * Decodes a JWT with a Verifiable Credential payload.
 */
export async function decodeVerifiableCredential(
  vcJwt: JWT
): Promise<
  Verifiable<W3CCredential> | RevocableCredential | RevocationListCredential
> {
  try {
    const res = await verifyCredential(vcJwt, didKeyResolver)
    return res.verifiableCredential
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Credential",
      err
    )
  }
}

/**
 * Decode a JWT with a Verifiable Presentation payload.
 */
export async function decodeVerifiablePresentation(
  vpJwt: JWT
): Promise<Verifiable<W3CPresentation>> {
  try {
    const res = await verifyPresentation(vpJwt, didKeyResolver)
    return res.verifiablePresentation
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Presentation",
      err
    )
  }
}