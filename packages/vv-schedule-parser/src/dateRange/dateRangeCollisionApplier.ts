module.exports = class DateRangeCollisionApplier {

    private dateRange: { from: Date, to: Date }
    private targetDateRange: { from: Date, to: Date }

    private insideTargetFN?: () => void
    private startInTargetFN?: () => void
    private endInTargetFN?: () => void
    private coverTargetFN?: () => void
    private stickToTargetStartFN?: () => void
    private stickToTargetEndFN?: () => void
    private noCollisionAheadFN?: () => void
    private noCollisionBehindFN?: () => void

    constructor(dateRange: { from: Date, to: Date },
        targetDateRange: { from: Date, to: Date }) {
        this.dateRange = dateRange
        this.targetDateRange = targetDateRange
    }

    public insideTarget(fn: () => void): DateRangeCollisionApplier {
        this.insideTargetFN = fn
        return this
    }

    public startInTarget(fn: () => void): DateRangeCollisionApplier {
        this.startInTargetFN = fn
        return this
    }

    public endInTarget(fn: () => void): DateRangeCollisionApplier {
        this.endInTargetFN = fn
        return this
    }

    public coverTarget(fn: () => void): DateRangeCollisionApplier {
        this.coverTargetFN = fn
        return this
    }

    public stickToTargetStart(fn: () => void): DateRangeCollisionApplier {
        this.stickToTargetEndFN = fn
        return this
    }

    public stickToTargetEnd(fn: () => void): DateRangeCollisionApplier {
        this.stickToTargetEndFN = fn
        return this
    }

    public noCollisionAhead(fn: () => void): DateRangeCollisionApplier {
        this.noCollisionAheadFN = fn
        return this
    }

    public noCollisionBehind(fn: () => void): DateRangeCollisionApplier {
        this.noCollisionBehindFN = fn
        return this
    }

    public apply(): boolean {
        if (this.dateRange.from > this.targetDateRange.from && this.dateRange.to < this.targetDateRange.to) { // inside
            this.insideTargetFN?.()
        } else if (this.dateRange.from <= this.targetDateRange.from && this.dateRange.to >= this.targetDateRange.to) { // cover
            this.coverTargetFN?.()
        } else if (this.dateRange.from > this.targetDateRange.from && this.dateRange.from < this.targetDateRange.to) { // start in target
            this.startInTargetFN?.()
        } else if (this.dateRange.to > this.targetDateRange.from && this.dateRange.to < this.targetDateRange.to) { // end in target
            this.endInTargetFN?.()
        } else if (this.dateRange.to.getTime() == this.targetDateRange.from.getTime()) { // stick to start
            this.stickToTargetStartFN?.()
        } else if (this.dateRange.from.getTime() == this.targetDateRange.to.getTime()) { // stick to end
            this.stickToTargetEndFN?.()
        } else {
            if (this.dateRange.to < this.targetDateRange.from) {
                this.noCollisionAheadFN?.()
            } else if (this.dateRange.from > this.targetDateRange.to) {
                this.noCollisionBehindFN?.()
            }
            return false
        }
        return true
    }
}