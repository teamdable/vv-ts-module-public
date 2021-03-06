import {DateRangeNode} from './dateRangeNode'
import {DateRangeCollisionExecutor} from './dateRangeCollisionExecutor'

export class DateRangeApplier {

    static apply(
        isInclude: boolean, topNode: DateRangeNode,
        dateRangeList: Array<{ from: Date, to: Date }>
    ): DateRangeNode | undefined {
        return isInclude ? this.applyIncludes(topNode, dateRangeList) : this.applyExcludes(topNode, dateRangeList)
    }

    static applyIncludes(topNode: DateRangeNode, dateRangeList: Array<{ from: Date, to: Date }>): DateRangeNode {
        let result = topNode
        dateRangeList.forEach((dateRange) => {
            let target: DateRangeNode | undefined = result
            while (!!target) {
                const targetDateRange = target.dateRange

                new DateRangeCollisionExecutor(dateRange, targetDateRange)
                    .startInTarget(() => targetDateRange.to = dateRange.to)
                    .endInTarget(() => targetDateRange.from = dateRange.from)
                    .stickToTargetStart(() => targetDateRange.from = dateRange.from)
                    .stickToTargetEnd(() => targetDateRange.to = dateRange.to)
                    .coverTarget(() => {
                        targetDateRange.from = dateRange.from
                        targetDateRange.to = dateRange.to
                    })
                    .noCollisionAhead(() => {
                        const insertionNode = new DateRangeNode(dateRange)
                        if (!target!.prev) {
                            result = insertionNode
                        } else {
                            target!.prev.next = insertionNode
                        }
                        insertionNode.next = target
                    })
                    .noCollisionBehind(() => {
                        if (!target!.next) {
                            const insertionNode = new DateRangeNode(dateRange)
                            target!.next = insertionNode
                            target = insertionNode
                        }
                    })
                    .execute()

                let nextNode: DateRangeNode | undefined = target.next
                while (!!nextNode && nextNode.dateRange.from <= targetDateRange.to) {
                    targetDateRange.to = targetDateRange.to > nextNode.dateRange.to ? targetDateRange.to : nextNode.dateRange.to
                    nextNode = nextNode.next
                }
                target.next = nextNode
                target = target.next
            }
        })
        return result
    }

    static applyExcludes(topNode: DateRangeNode, dateRangeList: Array<{ from: Date, to: Date }>): DateRangeNode | undefined {
        let result: DateRangeNode | undefined = topNode
        dateRangeList.forEach((dateRange) => {
            let target = result
            while (!!target) {
                const targetDateRange = target.dateRange

                new DateRangeCollisionExecutor(dateRange, targetDateRange)
                    .insideTarget(() => {
                        const insertionNode = new DateRangeNode({ from: new Date(dateRange.from), to: new Date(targetDateRange.to) })
                        targetDateRange.to = dateRange.from
                        insertionNode.next = target!.next
                        target!.next = insertionNode
                    })
                    .startInTarget(() => targetDateRange.to = dateRange.from)
                    .endInTarget(() => targetDateRange.from = dateRange.to)
                    .coverTarget(() => {
                        if (!!target!.prev) {
                            target!.prev.next = target?.next
                        } else {
                            result = target?.next
                        }
                    })
                    .execute()

                target = target.next
            }
        })
        return result
    }
}