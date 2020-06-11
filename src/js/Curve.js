export default class Curve{
    constructor(maxVertices) {
        this.vertices = []
        this.maxVertices = maxVertices
    }

    push(point) {
        if (this.vertices.length >= this.maxVertices) {
            this.vertices.shift()
        }
        return this.vertices.push(point)
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.lineCap = 'round'
        ctx.lineWidth = 2

        this.vertices.forEach((vertex, index) => {
            const previousVertex = this.vertices[index - 1] || vertex

            ctx.moveTo(previousVertex.x, previousVertex.y)
            ctx.lineTo(vertex.x, vertex.y)
        })

        ctx.stroke()
    }
}