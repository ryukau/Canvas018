//
// TODO: 船を浮かべる。
//
class Wave {
    constructor(width, height) {
        this.ATTENUATION = 0.996

        // this.wave[i][x][y] は t + i の波の状態。tは時間。
        this.wave = []
        for (let i = 0; i < 3; ++i) {
            this.wave.push([])
            for (let x = 0; x < width; ++x) {
                this.wave[i].push(new Array(height).fill(0))
            }
        }
        // this.pulse(width / 2, height / 2, 32, 0.2)
    }

    get width() {
        return this.wave[0].length
    }

    get height() {
        return this.wave[0][0].length
    }

    step() {
        var wave = this.wave
        this.swapLine()
        for (let x = 0; x < wave[0].length; ++x) {
            for (let y = 0; y < wave[0][0].length; ++y) {
                wave[0][x][y] = 0.25 * this.laplacian(x, y) - wave[2][x][y] + 2 * wave[1][x][y]
                wave[0][x][y] *= this.ATTENUATION
            }
        }
    }

    swapLine() {
        var temp = this.wave[2]
        for (let x = 0; x < temp.length; ++x) {
            temp[x].fill(0)
        }

        this.wave[2] = this.wave[1]
        this.wave[1] = this.wave[0]
        this.wave[0] = temp
    }

    laplacian(x, y) {
        var wave = this.wave,
            x_max = wave[0].length,
            y_max = wave[0][0].length,
            n = U.mod(y - 1, y_max),
            e = U.mod(x - 1, x_max),
            s = (y + 1) % y_max,
            w = (x + 1) % x_max,
            xy_ratio = y_max / x_max,
            y_sum = xy_ratio * (wave[1][x][n] + wave[1][x][s])
        return (y_sum + wave[1][e][y] + wave[1][w][y] - 2 * (1 + xy_ratio) * wave[1][x][y])
    }

    pulse(x, y, rad, power) {
        x = Math.floor(x)
        y = Math.floor(y)
        // インパルス。
        //this.wave[0][x][y] += power

        // Hanning Window.
        var left = Math.floor(x - rad * 0.5)
        for (let i = 0; i < rad; ++i) {
            this.wave[0][U.mod(left + i, this.wave[0].length)][y] += power * 0.5 * (1 - Math.cos(2 * Math.PI * i / (rad - 1)))
        }
    }

    draw(canvas) {
        var wave = this.wave
        canvas.context.save()
        canvas.context.translate(0, -0.5 * canvas.height / wave[0][0].length)

        canvas.context.lineWidth = 1
        canvas.context.lineJoin = "round"

        var denom = 1 / wave[0][0].length,
            color
        for (let y = 0; y < wave[0][0].length; ++y) {
            color = U.hsv2rgb(y * denom, 1 - 0.5 * (y + 1) * denom, 1)
            canvas.context.fillStyle = U.toColorCode(color.r, color.g, color.b)
            canvas.context.translate(0, canvas.height * denom)
            canvas.context.beginPath()
            canvas.context.moveTo(0, wave[0][0][y] * canvas.Center.x)
            for (let x = 1; x < width; ++x) {
                canvas.context.lineTo(x, wave[0][x][y] * canvas.Center.x)
            }
            canvas.context.lineTo(canvas.width, canvas.height)
            canvas.context.lineTo(0, canvas.height)
            canvas.context.closePath()
            canvas.context.fill()
        }

        canvas.context.restore()
    }
}

var width = 512
var height = 512
var cv = new Canvas(width, height)
cv.canvas.addEventListener("mousedown", onMouseDownCanvas, false)

var wave = new Wave(width, 32)

animate()

function animate() {
    updateCanvas()
    wave.step()
    requestAnimationFrame(animate)
}

function updateCanvas() {
    cv.clearWhite()
    wave.draw(cv)
}

// UI //

function onMouseDownCanvas(event) {
    var rect = event.target.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top
    wave.pulse(
        x,
        wave.height * y / cv.height,
        32 * Math.random(),
        0.01 + 0.5 * U.randomPow(2)
    )
}
