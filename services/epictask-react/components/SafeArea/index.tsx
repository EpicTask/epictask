import { StyleSheet } from 'react-native'
import React, { ReactNode } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'

const SafeArea = ({children} : {children: ReactNode}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
        {children}
    </SafeAreaView>
  )
}

export default SafeArea

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
