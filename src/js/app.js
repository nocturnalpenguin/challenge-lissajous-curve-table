'use strict'
import CanvasBase from './CanvasBase'

const TWO_PI = 2 * Math.PI
const HALF_PI = Math.PI / 2

class LissajousCurveTable extends CanvasBase {
    constructor(...args) {
        super(...args)

        this.bgCanvas = document.querySelector('#background-canvas')
        this.bgCanvas.width = this.canvas.width
        this.bgCanvas.height = this.canvas.height
        this.bgCanvas.style.width = this.canvas.style.width
        this.bgCanvas.style.height = this.canvas.style.height

        this.bgctx = this.bgCanvas.getContext('2d')
        
        this.rows = 5
        this.cols = 5

        this.colWidth = Math.floor(this.canvas.width / (Math.max(this.rows, this.cols) + 1))
        this.diameter = this.colWidth * 0.75
        this.radius = this.diameter / 2

        this.allVertices = {}
        this.curves = []
        this.hueOffset = 190
        this.lineWidth = 4
        this.stepSize = 0.015
        this.maxIndex = Math.ceil(TWO_PI / this.stepSize)

        this.resizeCallbacks = [this.backgroundCanvasResize.bind(this)]
    }

    init() {
        this.attachControls()
        this.generateAnimationVertives()
        this.drawBackgroundCanvas()
        this.startAnimation()
    }

    startAnimation() {
        this.ctx.lineWidth = this.lineWidth
        
        let index = 0
        let curveDrawFinished = false
        let curveDrawnToBackground = false
        this.updateFrame(() => {
            this.clearCanvas()

            if (curveDrawFinished && !curveDrawnToBackground) {
                this.drawCurves(this.bgctx, this.maxIndex)
                curveDrawnToBackground = true
            } else if (!curveDrawnToBackground){
                this.drawCurves(this.ctx, index)
            }


            for (let j = 0, rowFrameLen = this.allVertices.rows[index].length; j < rowFrameLen; j++) {
                this.drawMovingDot(
                    this.allVertices.rows[index][j].centerX + this.allVertices.rows[index][j].x, 
                    this.allVertices.rows[index][j].centerY + this.allVertices.rows[index][j].y, 
                    this.allVertices.rows[index][j].index
                )
                this.drawGuideLine(
                    this.allVertices.rows[index][j].centerX + this.allVertices.rows[index][j].x,
                    this.allVertices.rows[index][j].centerY + this.allVertices.rows[index][j].y,
                    this.allVertices.rows[index][j].index
                )
            }

            for (let i = 0, colFrameLen = this.allVertices.cols[index].length; i < colFrameLen; i++) {
                this.drawMovingDot(
                    this.allVertices.cols[index][i].centerX + this.allVertices.cols[index][i].x, 
                    this.allVertices.cols[index][i].centerY + this.allVertices.cols[index][i].y, 
                    this.allVertices.cols[index][i].index
                )
                this.drawGuideLine(
                    this.allVertices.cols[index][i].centerX + this.allVertices.cols[index][i].x,
                    this.allVertices.cols[index][i].centerY + this.allVertices.cols[index][i].y,
                    this.allVertices.cols[index][i].index
                )
            }

            index++

            if (index >= this.maxIndex) {
                index = 0
                curveDrawFinished = true
            }
        })
    }

    generateAnimationVertives() {
        this.allVertices = {
            rows: [],
            cols: [],
            curves: []
        }

        for (let angle = 0; angle < TWO_PI; angle = parseFloat((angle + this.stepSize).toPrecision(4))) {
            const rowFrameData = []
            const colFrameData = []
            
            for (let j = 0; j < this.rows; j++) {
                const centerX = this.colWidth + j * this.colWidth + this.colWidth / 2
                const centerY = this.colWidth / 2
                const x = this.radius * Math.sin(angle * (j + 1) + HALF_PI)
                const y = this.radius * Math.sin(angle * (j + 1))
                
                rowFrameData.push({ centerX, centerY, x, y, index: j })
            }
            
            for (let i = 0; i < this.cols; i++) {
                const centerX = this.colWidth / 2
                const centerY = this.colWidth + i * this.colWidth + this.colWidth / 2
                const x = this.radius * Math.sin(angle * (i + 1) + HALF_PI)
                const y = this.radius * Math.sin(angle * (i + 1))
                
                colFrameData.push({ centerX, centerY, x, y, index: i })
            }
            
            this.allVertices.rows.push(rowFrameData)
            this.allVertices.cols.push(colFrameData)
        }

        for (let j = 0; j < this.rows; j++) {
            if (!this.allVertices.curves[j]) {
                this.allVertices.curves[j] = []
            }
            for (let i = 0; i < this.cols; i++) {
                this.allVertices.curves[j][i] = []

                for (let angle = 0; angle < TWO_PI; angle = parseFloat((angle + this.stepSize).toPrecision(4))) {
                    const centerX = this.colWidth + j * this.colWidth + this.colWidth / 2
                    const centerY = this.colWidth + i * this.colWidth + this.colWidth / 2
                    const x = this.radius * Math.sin(angle * (j + 1) + HALF_PI)
                    const y = this.radius * Math.sin(angle * (i + 1))

                    this.allVertices.curves[j][i].push({
                        x: centerX + x,
                        y: centerY + y
                    })
                }
            }
        }
    }

    drawBackgroundCanvas() {
        this.bgctx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height)
        this.bgctx.lineWidth = this.lineWidth

        for (let j = 0; j < this.rows; j++) {
            const x = this.colWidth + j * this.colWidth + this.colWidth / 2
            const y = this.colWidth / 2

            this.drawCircle(this.bgctx, x, y, j)
        }

        for (let i = 0; i < this.cols; i++) {
            const x = this.colWidth / 2
            const y = this.colWidth + i * this.colWidth + this.colWidth / 2

            this.drawCircle(this.bgctx, x, y, i)
        }
    }

    dynamicColor(index, alpha = 1) {
        const hue = (((index + 1) * 30) + this.hueOffset) % 361
        return `hsla(${hue}, 85%, 60%, ${alpha})`
    }

    drawCircle(ctx, x, y, index) {
        ctx.strokeStyle = this.dynamicColor(index)

        ctx.beginPath()
        ctx.arc(x, y, this.radius, 0, TWO_PI)
        ctx.stroke()
    }

    drawMovingDot(x, y, index, size = this.lineWidth * 1.25) {
        this.ctx.fillStyle = this.dynamicColor(index)

        this.ctx.beginPath()
        this.ctx.arc(x, y, size, 0, TWO_PI)
        this.ctx.fill()
    }

    drawGuideLine(x, y, index) {
        this.ctx.strokeStyle = this.dynamicColor(index)
        this.ctx.lineWidth = 1

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

    drawCurves(ctx, index) {
        ctx.lineWidth = this.lineWidth
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                ctx.beginPath()
                ctx.strokeStyle = this.dynamicColor(Math.max(j, i))
                for (let c = 1; c <= index; c++) {
                    ctx.moveTo(this.allVertices.curves[j][i][c - 1].x, this.allVertices.curves[j][i][c - 1].y)
                    if (c < this.maxIndex) {
                        ctx.lineTo(this.allVertices.curves[j][i][c].x, this.allVertices.curves[j][i][c].y)
                    } else {
                        ctx.lineTo(this.allVertices.curves[j][i][0].x, this.allVertices.curves[j][i][0].y)
                    }
                }
                ctx.stroke()
            }
        }
    }

    restartAnimation() {
        this.colWidth = Math.floor(this.canvas.width / (Math.max(this.rows, this.cols) + 1))
        this.diameter = this.colWidth * 0.75
        this.radius = this.diameter / 2

        this.stopFrameUpdate()
        this.clearCanvas()
        this.generateAnimationVertives()
        this.drawBackgroundCanvas()
        this.startAnimation()
    }

    backgroundCanvasResize() {
        this.bgCanvas.width = this.canvas.width
        this.bgCanvas.height = this.canvas.height
        this.bgCanvas.style.width = this.canvas.style.width
        this.bgCanvas.style.height = this.canvas.style.height
        
        this.restartAnimation()
    }

    attachControls() {
        const rowsInput = document.querySelector('#controls input[name="rows"]')
        const colsInput = document.querySelector('#controls input[name="cols"]')

        rowsInput.addEventListener('input', this.updateInputValueLabel)
        colsInput.addEventListener('input', this.updateInputValueLabel)

        rowsInput.addEventListener('change', (e) => this.controlListener(e, 'rows'))
        colsInput.addEventListener('change', (e) => this.controlListener(e, 'cols'))
    }

    controlListener(e, property) {
        this[property] = Number(e.target.value)
        this.restartAnimation()
    }

    updateInputValueLabel(e) {
        e.target.parentElement.parentElement.querySelector('td small').innerText = e.target.value
    }
}

const curveTable = new LissajousCurveTable()
curveTable.init()