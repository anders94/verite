import React, { useState } from "react"
import { View, StyleSheet, Button } from "react-native"
import CredentialManifestPrompt from "../src/components/CredentialManifestPrompt"
import { requestIssuance } from "../src/lib/issuance"
import { saveManifest } from "../src/lib/manifestRegistry"
import { getOrCreateDidKey, saveCredential } from "../src/lib/storage"
import {
  decodeVerifiablePresentation,
  CredentialManifest
} from "../src/lib/verity"

export default function HomePage({ navigation }): Element {
  const [submissionUrl, setSubmissionUrl] = useState<string>()
  const [manifest, setManifest] = useState<CredentialManifest | null>()

  /**
   * When scanning a QR code, it will encode a JSON object with a manifestUrl
   * property. We will subsequently fetch that value to retrieve the full
   * manifest document. Afterward, we request credentials from the given
   * submissionUrl.
   */
  const onScan = async ({ _type, data }) => {
    // Parse QR Code Data
    const payload = JSON.parse(data)

    // We must request the credentials from the submissionUrl
    setSubmissionUrl(payload.submissionUrl)

    // Fetch manifest URL
    const manifestUrl = payload.manifestUrl
    const result = await fetch(manifestUrl)

    // Parse the manifest
    const manifest: CredentialManifest = await result.json()

    // Persist the manifest to the device
    await saveManifest(manifest)
    setManifest(manifest)
  }

  const onCancel = () => {
    setManifest(null)
  }

  const onConfirm = async () => {
    if (!submissionUrl || !manifest) {
      return
    }
    const did = await getOrCreateDidKey()
    const response = await requestIssuance(submissionUrl, did, manifest)
    if (response.status === 200) {
      // Parse JSON
      const presentationRaw = await response.json()

      // Decode the VP
      const presentation = await decodeVerifiablePresentation(
        presentationRaw.presentation
      )

      // Extract the issued VC
      // TODO: It would be more correct to use the descriptor map
      const credential =
        presentation.verifiablePresentation.verifiableCredential[0]

      // Persist the credential
      saveCredential(credential)

      // Navigate to the credential details page
      navigation.navigate("Details", { credential: credential })
    } else {
      console.log(response.status, await response.text())
      // TODO: error handling
    }
  }

  return (
    <View style={styles.container}>
      {manifest ? (
        <CredentialManifestPrompt
          credentialManifest={manifest}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      ) : (
        <Button
          title={"Scan QR Code"}
          onPress={() => navigation.navigate("Scanner", { onScan })}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  }
})
