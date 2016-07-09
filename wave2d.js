//
// TODO: カエルや魚を泳がせる。蓮の花でも浮かべる。
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
        this.pulse(width / 2, height / 2, 32, 2)
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
        rad = Math.floor(rad)

        // インパルス。
        // this.wave[0][x][y] += power

        // Hanning Window.
        // var left = Math.floor(x - rad * 0.5),
        //     pi2_rad = 2 * Math.PI / (rad - 1),
        //     x_index
        // for (let i = 0; i < rad; ++i) {
        //     x_index = U.mod(left + i, this.wave[0].length)
        //     this.wave[0][x_index][y] += power * 0.5 * (1 - Math.cos(i * pi2_rad))
        // }

        // 距離。
        var left = Math.floor(x - rad * 0.5),
            top = Math.floor(y - rad * 0.5),
            xx, yy, _x, _y, x_c, y_c, length, denom
        for (xx = 0; xx < rad; ++xx) {
            for (yy = 0; yy < rad; ++yy) {
                _x = U.mod(left + xx, this.wave[0].length)
                _y = U.mod(top + yy, this.wave[0][0].length)
                x_c = xx - rad * 0.5
                y_c = yy - rad * 0.5
                length = Math.sqrt(x_c * x_c + y_c * y_c)
                denom = (length === 0) ? 1 : 1 / length
                this.wave[0][_x][_y] += power * 0.3 * denom
            }
        }
    }

    draw(canvas) {
        var pixels = cv.pixels,
            x, y, index, color

        for (x = 0; x < width; ++x) {
            for (y = 0; y < height; ++y) {
                color = Math.min((Math.abs(1 + this.wave[0][x][y]) * 190), 256)

                index = (y * width + x) * 4
                pixels[index + 0] = color * 0.1
                pixels[index + 1] = color * 0.8
                pixels[index + 2] = color
                pixels[index + 3] = 255
            }
        }
        canvas.putPixels()
    }

    reflection(n, m) {
        var mod = n % m,
            isOdd = mod % 2
        return isOdd ? m - mod : mod
    }
}

var width = 512
var height = 512
var cv = new Canvas(width, height)
cv.canvas.addEventListener("mousedown", onMouseDownCanvas, false)

var wave = new Wave(width, height)

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
        y,
        32 * Math.random(),
        0.3 + 0.3 * U.randomPow(2)
    )
}
