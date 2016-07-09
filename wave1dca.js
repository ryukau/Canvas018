const C_d2 = 1 / 2
const ATTENUATION = 0.9975
const NEIGHBOUR = 16

var width = 512
var height = 512
var cv = new Canvas(width, height)
cv.canvas.addEventListener("mousedown", onMouseDownCanvas, false)

// line[i] は t + i の波の状態。tは時間。
var line = []
for (let i = 0; i < 3; ++i) {
    line.push(new Array(width).fill(0))
}
pulse(line[0], width / 2, width / 4, 0.2)

animate()

function animate() {
    updateCanvas()
    step()
    requestAnimationFrame(animate)
}

function updateCanvas() {
    var pixels = cv.CurrentPixels,
        x, y, index, prev_index, color, value

    // 縦にスライド。
    for (x = 0; x < width; ++x) {
        for (y = 0; y < height - 1; ++y) {
            index = (y * width + x) * 4
            prev_index = ((y + 1) * width + x) * 4
            pixels[index + 0] = pixels[prev_index + 0]
            pixels[index + 1] = pixels[prev_index + 1]
            pixels[index + 2] = pixels[prev_index + 2]
            pixels[index + 3] = pixels[prev_index + 3]
        }
    }

    y = (height - 1) * width
    for (x = 0; x < line[0].length; ++x) {
        value = U.mod(line[0][x], 1)
        color = U.hsv2rgb(value, 1, 1)
        index = (y + x) * 4
        pixels[index + 0] = color.r
        pixels[index + 1] = color.g
        pixels[index + 2] = color.b
        pixels[index + 3] = 255
    }

    cv.putPixels()
}

// Discretizing the wave equation
// http://www.mtnmath.com/whatrh/node66.html
function step() {
    swapLine()
    for (let i = 0; i < width; ++i) {
        line[0][i] = C_d2 * laplacian(line[1], i, NEIGHBOUR) - line[2][i] + 2 * line[1][i]
        line[0][i] *= ATTENUATION
    }
}

function swapLine() {
    var temp = line[2]
    line[2] = line[1]
    line[1] = line[0]
    line[0] = temp.fill(0)
}

function laplacian(wave, index, num_neighbour) {
    var sum = 0,
        sum_denom = 0,
        length = wave.length,
        left, right, denom
    for (let i = 1; i <= num_neighbour; ++i) {
        left = U.mod(index - 1, length)
        right = (index + 1) % length
        denom = 1 / i
        sum += denom * (wave[left] + wave[right])
        sum_denom += denom
    }
    return (sum - 2 * sum_denom * wave[index]) / sum_denom
}

function pulse(wave, position, width, height) {
    var left = Math.floor(position - width * 0.5)

    // インパルス。
    // wave[position] += 1

    // Hanning Window.
    for (let i = 0; i < width; ++i) {
        wave[U.mod(left + i, wave.length)] += height * 0.5 * (1 - Math.cos(2 * Math.PI * i / (width - 1)))
    }

    // ランダム。
    // for (let i = 0; i < width; ++i) {
    //     wave[U.mod(left + i, wave.length)] += 4 * height * (0.5 - Math.random())
    // }
}

// UI //

function onMouseDownCanvas(event) {
    var rect = event.target.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top
    pulse(line[0], x % line[0].length, (y + 1) / 2, 0.2)
    //console.log(line[1], x, y)
}
