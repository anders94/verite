import { BarCodeScanner } from "expo-barcode-scanner"
import React, { useState, useEffect } from "react"
import { Text, View, StyleSheet, Button } from "react-native"

export default function Scanner({ navigation, route }): Element {
  const { onScan } = route.params
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [hasPermission])

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    onScan({ type, data })
    navigation.goBack()
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera. Go to settings and enable it.</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
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
