'use strict'
import CanvasBase from './CanvasBase'
import Curve from './Curve'

const TWO_PI = 2 * Math.PI
const HALF_PI = Math.PI / 2

class LissajousCurveTable extends CanvasBase {
    constructor(...args) {
        super(...args)

        this.rows = 5
        this.cols = this.rows

        this.colWidth = Math.floor(this.canvas.width / (this.rows + 1))
        this.diameter = this.colWidth * 0.75
        this.radius = this.diameter / 2

        this.curveVertices = []
        this.hueOffset = 190
        this.stepSize = 0.014

        let maxVerticesPerCurve = Math.floor(TWO_PI / this.stepSize)

        for (let j = 0; j < this.rows; j++) {
            this.curveVertices[j] = []
            for (let i = 0; i < this.cols; i++) {
                if (i === j) {
                    this.curveVertices[j][i] = new Curve(Math.floor(TWO_PI / (this.stepSize * (i + 1))))
                } else {
                    this.curveVertices[j][i] = new Curve(maxVerticesPerCurve)
                }
            }
        }
    }

    init() {
        this.draw()
    }

    draw() {
        let angle = 0
        this.updateFrame(() => {
            this.clearCanvas()

            for (let j = 0; j < this.rows; j++) {
                let centerX = this.colWidth + j * this.colWidth + this.colWidth / 2
                let centerY = this.colWidth / 2
                let x = this.radius * Math.sin(angle * (j + 1) + HALF_PI)
                let y = this.radius * Math.sin(angle * (j + 1))
                
                this.drawCircle(centerX, centerY, j) // control rows
                this.drawCircle(centerY, centerX, j) // control cols

                this.drawMovingDot(centerX + x, centerY + y, j) // moving dots for control rows
                this.drawMovingDot(centerY + x, centerX + y, j) // moving dots for control cols

                this.drawGuideLine(centerX + x, centerY + y, j) // moving guide-line for control rows
                this.drawGuideLine(centerY + x, centerX + y, j) // moving guide-line for control cols

                for (let i = 0; i < this.cols; i++) {
                    const centerX = this.colWidth + i * this.colWidth + this.colWidth / 2
                    const centerY = this.colWidth + j * this.colWidth + this.colWidth / 2
                    const x = this.radius * Math.sin(angle * (i + 1) + HALF_PI)

                    this.curveVertices[j][i].push({
                        x: centerX + x,
                        y: centerY + y
                    })
                    this.ctx.strokeStyle = this.dynamicColor(Math.max(i, j))
                    this.curveVertices[j][i].draw(this.ctx)
                    this.drawMovingDot(centerX + x, centerY + y, Math.max(i, j), 3)
                }
            }

            angle = parseFloat((angle + this.stepSize).toPrecision(4))
            if (angle > TWO_PI) {
                angle = 0
            }
        })
    }

    dynamicColor(index, alpha = 1) {
        const hue = (((index + 1) * 30) + this.hueOffset) % 361
        return `hsla(${hue}, 85%, 60%, ${alpha})`
    }

    drawCircle(x, y, index) {
        this.ctx.strokeStyle = this.dynamicColor(index)
        this.ctx.lineWidth = 2

        this.ctx.beginPath()
        this.ctx.arc(x, y, this.radius, 0, TWO_PI)
        this.ctx.stroke()
    }

    drawMovingDot(x, y, index, size = 3.5) {
        this.ctx.fillStyle = this.dynamicColor(index)

        this.ctx.beginPath()
        this.ctx.arc(x, y, size, 0, TWO_PI)
        this.ctx.fill()
    }

    drawGuideLine(x, y, index) {
        this.ctx.strokeStyle = this.dynamicColor(index, 0.2)
        this.ctx.lineWidth = 2

        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        
        // determine if the line is horizontal or vertical
        if (y > this.colWidth) {
            this.ctx.lineTo(this.canvas.width, y)
        } else {
            this.ctx.lineTo(x, this.canvas.height)
        }

        this.ctx.stroke()
    }
}

const curveTable = new LissajousCurveTable()
curveTable.init()