package com.digibachatmobile

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {

    // 👇 This will show the splash screen on app start
    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this)  // show splash
        super.onCreate(savedInstanceState)
    }

    // 👇 This tells RN which component to load
    override fun getMainComponentName(): String = "DigiBachatMobile"

    // 👇 New Architecture delegate
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
