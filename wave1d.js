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
    pulse(line[i], width / 2, width / 4, 0.2)
}

animate()

function animate() {
    updateCanvas()
    step()
    requestAnimationFrame(animate)
}

function updateCanvas() {
    cv.clearWhite()
    cv.context.save()
    cv.context.translate(0, cv.Center.y)

    cv.context.lineWidth = 10
    cv.context.strokeStyle = "#aaaaff"
    cv.context.fillStyle = "#aaaaff"
    cv.context.lineJoin = "round"
    cv.context.beginPath()
    cv.context.moveTo(0, line[0][0] * cv.Center.x)
    for (let x = 1; x < width; ++x) {
        cv.context.lineTo(x, line[0][x] * cv.Center.x)
    }
    cv.context.lineTo(width, line[0][width - 1] * cv.Center.x)
    cv.context.lineTo(cv.width, cv.height)
    cv.context.lineTo(0, cv.height)
    cv.context.closePath()
    cv.context.fill()

    cv.context.restore()
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
    // インパルス。
    // wave[cv.Center.x] += 1

    // Hanning Window.
    var left = Math.floor(position - width * 0.5)
    for (let i = 0; i < width; ++i) {
        wave[U.mod(left + i, wave.length)] += height * 0.5 * (1 - Math.cos(2 * Math.PI * i / (width - 1)))
    }

    // ランダム。
    // var left = position - width * 0.5
    // for (let i = 0; i < width; ++i) {
    //     wave[U.mod(left + i, wave.length)] += 0.5 - Math.random()
    // }
}

// UI //

function onMouseDownCanvas(event) {
    var rect = event.target.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top
    pulse(line[0], x, (y + 1) / 2, 0.02)
}
