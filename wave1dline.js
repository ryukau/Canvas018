const C_d2 = 1 / 2
const ATTENUATION = 0.996
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
    cv.clearWhite()

    cv.context.lineWidth = 10
    var color
    for (let x = 0; x < width; ++x) {
        color = U.hsv2rgb(U.mod((line[0][x] + 1) * 0.5, 1), 1, 1)
        cv.context.fillStyle = U.toColorCode(color.r, color.g, color.b)
        cv.context.fillRect(x, 0, 1, cv.height)
    }
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
    wave[position] += 2

    // Hanning Window.
    // for (let i = 0; i < width; ++i) {
    //     wave[U.mod(left + i, wave.length)] += height * 0.5 * (1 - Math.cos(2 * Math.PI * i / (width - 1)))
    // }

    // ランダム。
    // for (let i = 0; i < width; ++i) {
    //     wave[U.mod(left + i, wave.length)] += 0.5 - Math.random()
    // }
}

// UI //

function onMouseDownCanvas(event) {
    var rect = event.target.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top
    pulse(line[0], x, (y + 1) / 2, 0.2)
}
