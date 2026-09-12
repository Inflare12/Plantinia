package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = PlantiniaGreenDarkPrimary,
    onPrimary = PlantiniaGreenDarkOnPrimary,
    primaryContainer = PlantiniaGreenDarkContainer,
    onPrimaryContainer = PlantiniaGreenDarkOnContainer,
    secondary = PlantiniaSageDarkSecondary,
    tertiary = PlantiniaAmberTertiary,
    background = PlantiniaDarkBackground,
    surface = PlantiniaDarkSurface,
    surfaceVariant = PlantiniaDarkSurfaceVariant,
  )

private val LightColorScheme =
  lightColorScheme(
    primary = PlantiniaGreenLightPrimary,
    onPrimary = PlantiniaGreenLightOnPrimary,
    primaryContainer = PlantiniaGreenLightContainer,
    onPrimaryContainer = PlantiniaGreenLightOnContainer,
    secondary = PlantiniaSageLightSecondary,
    tertiary = PlantiniaAmberTertiary,
    tertiaryContainer = PlantiniaAmberContainer,
    background = PlantiniaLightBackground,
    surface = PlantiniaLightSurface,
    surfaceVariant = PlantiniaLightSurfaceVariant,
    onBackground = Color(0xFF191C1A),
    onSurface = Color(0xFF191C1A),
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = false, // Use Plantinia signature theme by default
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }

      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}

