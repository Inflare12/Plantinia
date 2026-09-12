package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.model.BoundingBox

@Composable
fun BoundingBoxOverlay(
    imageRes: Int = R.drawable.sample_plant_leaf,
    boxes: List<BoundingBox>,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(260.dp)
            .clip(RoundedCornerShape(16.dp))
    ) {
        Image(
            painter = painterResource(id = imageRes),
            contentDescription = "Diagnosed Plant Foliage",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        Canvas(modifier = Modifier.fillMaxSize()) {
            val canvasW = size.width
            val canvasH = size.height

            boxes.forEach { box ->
                val left = box.xMin * canvasW
                val top = box.yMin * canvasH
                val right = box.xMax * canvasW
                val bottom = box.yMax * canvasH
                val width = right - left
                val height = bottom - top

                // Semi-transparent detection region fill
                drawRoundRect(
                    color = Color(0x33EF4444),
                    topLeft = Offset(left, top),
                    size = Size(width, height),
                    cornerRadius = CornerRadius(8.dp.toPx(), 8.dp.toPx())
                )

                // High-visibility detection bounding box outline
                drawRoundRect(
                    color = Color(0xFFEF4444),
                    topLeft = Offset(left, top),
                    size = Size(width, height),
                    cornerRadius = CornerRadius(8.dp.toPx(), 8.dp.toPx()),
                    style = Stroke(width = 3.dp.toPx())
                )

                // Corner accents for AI scanner feel
                val cornerLen = 14.dp.toPx()
                val cornerStroke = 4.dp.toPx()
                // Top-Left
                drawLine(Color.White, Offset(left, top), Offset(left + cornerLen, top), cornerStroke)
                drawLine(Color.White, Offset(left, top), Offset(left, top + cornerLen), cornerStroke)
                // Bottom-Right
                drawLine(Color.White, Offset(right, bottom), Offset(right - cornerLen, bottom), cornerStroke)
                drawLine(Color.White, Offset(right, bottom), Offset(right, bottom - cornerLen), cornerStroke)
            }
        }
    }
}
