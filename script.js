var sketch = require('sketch')
var UI = require('sketch/ui')

function onRun(context) {
  var doc = sketch.getSelectedDocument()
  var textLayer = doc.selectedLayers.layers[0]

  if (!textLayer || textLayer.type !== 'Text') {
    UI.message("⚠️ Please select a text layer!")
    return
  }

  showNativeUI(textLayer)
}

function showNativeUI(textLayer) {
  var alert = NSAlert.alloc().init()
  alert.setMessageText("Circular Text Settings")
  alert.setInformativeText("Adjust the sliders for live preview. Click Apply to confirm.")

  var accessoryView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 120))

  // Radius Slider
  var radiusLabel = createLabel("Radius:", NSMakeRect(0, 100, 100, 20))
  var radiusSlider = createSlider(50, 300, 100, NSMakeRect(100, 100, 200, 20))
  accessoryView.addSubview(radiusLabel)
  accessoryView.addSubview(radiusSlider)

  // Spacing Slider
  var spacingLabel = createLabel("Spacing:", NSMakeRect(0, 70, 100, 20))
  var spacingSlider = createSlider(0.5, 2, 1, NSMakeRect(100, 70, 200, 20))
  accessoryView.addSubview(spacingLabel)
  accessoryView.addSubview(spacingSlider)

  // Alignment Dropdown
  var alignmentLabel = createLabel("Alignment:", NSMakeRect(0, 40, 100, 20))
  var alignmentDropdown = createDropdown(["Center", "Left", "Right"], NSMakeRect(100, 40, 200, 25))
  accessoryView.addSubview(alignmentLabel)
  accessoryView.addSubview(alignmentDropdown)

  alert.setAccessoryView(accessoryView)
  alert.addButtonWithTitle("Apply")
  var resetButton = alert.addButtonWithTitle("Reset") // Capturing Reset Button
  alert.addButtonWithTitle("Cancel")

  // Live Preview on Slider
  radiusSlider.setCOSJSTargetFunction(() => {
    updatePreview(textLayer, radiusSlider.floatValue(), spacingSlider.floatValue(), alignmentDropdown.titleOfSelectedItem().toLowerCase())
  })
  
  spacingSlider.setCOSJSTargetFunction(() => {
    updatePreview(textLayer, radiusSlider.floatValue(), spacingSlider.floatValue(), alignmentDropdown.titleOfSelectedItem().toLowerCase())
  })

  // Reset Button
  resetButton.setCOSJSTargetFunction(() => {
    resetTextLayer(textLayer) // Resets Text
    radiusSlider.setFloatValue(100) // Reset Slider Values
    spacingSlider.setFloatValue(1)
    alignmentDropdown.selectItemAtIndex(0)

    UI.message("🔄 Text reset!")
  })

  // Show UI Dialog
  var response = alert.runModal()

  if (response != 1000) { // If Cancel is clicked
    var parent = textLayer.parent

    // Remove circular text layers
    parent.layers.forEach(layer => {
      if (layer.name === "CircularText") layer.remove()
    })

    UI.message("❌ Canceled") 
    return
  }

  // Apply final changes
  updatePreview(textLayer, radiusSlider.floatValue(), spacingSlider.floatValue(), alignmentDropdown.titleOfSelectedItem().toLowerCase())
  UI.message("✅ Applied circular text")
}

function updatePreview(textLayer, radius, spacing, alignment, curveDirection) {
  createCircularText(textLayer, radius, spacing, alignment, curveDirection)
}

function createCircularText(textLayer, radius, spacing, alignment) {
  var doc = sketch.getSelectedDocument()
  var parent = textLayer.parent
  var text = textLayer.text
  var charCount = text.length

  if (charCount === 0) {
    UI.message("⚠️ Empty text layer!")
    return
  }

  var centerX = textLayer.frame.x + textLayer.frame.width / 2
  var centerY = textLayer.frame.y + textLayer.frame.height / 2
  var angleStep = (2 * Math.PI) / (charCount * spacing)

  // Remove old circular text layers
  parent.layers.forEach(layer => {
    if (layer.name === "CircularText") layer.remove()
  })

  for (var i = 0; i < charCount; i++) {
    var char = text[i]
    var angle = i * angleStep - Math.PI / 2

    var x = centerX + radius * Math.cos(angle)
    var y = centerY + radius * Math.sin(angle)

    var newText = new sketch.Text({
      parent: parent,
      text: char,
      frame: { x: x, y: y, width: 20, height: 20 },
      style: {
        alignment: sketch.Text.Alignment.center,
        borders: [], // **🔥 Removes Borders**
        fills: [{ color: textLayer.style.textColor }], // **🔥 Matches Text Color**
        fontSize: textLayer.style.fontSize, // **🔥 Keeps Font Size**
        fontFamily: textLayer.style.fontFamily, // **🔥 Keeps Font Family**
        fontWeight: textLayer.style.fontWeight, // **🔥 Keeps Font Weight**
      },
      name: "CircularText"
    })

    // Rotate each letter to follow the curve
    newText.transform.rotation = (angle * 180) / Math.PI + 90

    // Adjust alignment
    if (alignment === "left") newText.frame.x -= 10
    else if (alignment === "right") newText.frame.x += 10
  }
}

function resetTextLayer(textLayer) {
  var parent = textLayer.parent

  // Remove circular text layers
  parent.layers.forEach(layer => {
    if (layer.name === "CircularText") layer.remove()
  })

  // Restore original text layer visibility
  textLayer.hidden = false
}

// Helper functions to create UI elements
function createLabel(text, frame) {
  var label = NSTextField.alloc().initWithFrame(frame)
  label.setStringValue(text)
  label.setBezeled(false)
  label.setDrawsBackground(false)
  label.setEditable(false)
  label.setSelectable(false)
  return label
}

function createSlider(min, max, value, frame) {
  var slider = NSSlider.alloc().initWithFrame(frame)
  slider.setMinValue(min)
  slider.setMaxValue(max)
  slider.setFloatValue(value)
  slider.setContinuous(true)
  return slider
}

function createDropdown(options, frame) {
  var dropdown = NSPopUpButton.alloc().initWithFrame(frame)
  dropdown.addItemsWithTitles(options)
  return dropdown
}

module.exports = { onRun }







