"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeApplier = void 0;
const dateRangeNode_1 = require("./dateRangeNode");
const dateRangeCollisionExecutor_1 = require("./dateRangeCollisionExecutor");
class DateRangeApplier {
    static apply(isInclude, topNode, dateRangeList) {
        return isInclude ? this.applyIncludes(topNode, dateRangeList) : this.applyExcludes(topNode, dateRangeList);
    }
    static applyIncludes(topNode, dateRangeList) {
        let result = topNode;
        dateRangeList.forEach((dateRange) => {
            let target = result;
            while (!!target) {
                const targetDateRange = target.dateRange;
                new dateRangeCollisionExecutor_1.DateRangeCollisionExecutor(dateRange, targetDateRange)
                    .startInTarget(() => targetDateRange.to = dateRange.to)
                    .endInTarget(() => targetDateRange.from = dateRange.from)
                    .stickToTargetStart(() => targetDateRange.from = dateRange.from)
                    .stickToTargetEnd(() => targetDateRange.to = dateRange.to)
                    .coverTarget(() => {
                    targetDateRange.from = dateRange.from;
                    targetDateRange.to = dateRange.to;
                })
                    .noCollisionAhead(() => {
                    const insertionNode = new dateRangeNode_1.DateRangeNode(dateRange);
                    if (!target.prev) {
                        result = insertionNode;
                    }
                    else {
                        target.prev.next = insertionNode;
                    }
                    insertionNode.next = target;
                })
                    .noCollisionBehind(() => {
                    if (!target.next) {
                        const insertionNode = new dateRangeNode_1.DateRangeNode(dateRange);
                        target.next = insertionNode;
                        target = insertionNode;
                    }
                })
                    .execute();
                let nextNode = target.next;
                while (!!nextNode && nextNode.dateRange.from <= targetDateRange.to) {
                    targetDateRange.to = targetDateRange.to > nextNode.dateRange.to ? targetDateRange.to : nextNode.dateRange.to;
                    nextNode = nextNode.next;
                }
                target.next = nextNode;
                target = target.next;
            }
        });
        return result;
    }
    static applyExcludes(topNode, dateRangeList) {
        let result = topNode;
        dateRangeList.forEach((dateRange) => {
            let target = result;
            while (!!target) {
                const targetDateRange = target.dateRange;
                new dateRangeCollisionExecutor_1.DateRangeCollisionExecutor(dateRange, targetDateRange)
                    .insideTarget(() => {
                    const insertionNode = new dateRangeNode_1.DateRangeNode({ from: new Date(dateRange.from), to: new Date(targetDateRange.to) });
                    targetDateRange.to = dateRange.from;
                    insertionNode.next = target.next;
                    target.next = insertionNode;
                })
                    .startInTarget(() => targetDateRange.to = dateRange.from)
                    .endInTarget(() => targetDateRange.from = dateRange.to)
                    .coverTarget(() => {
                    if (!!target.prev) {
                        target.prev.next = target === null || target === void 0 ? void 0 : target.next;
                    }
                    else {
                        result = target === null || target === void 0 ? void 0 : target.next;
                    }
                })
                    .execute();
                target = target.next;
            }
        });
        return result;
    }
}
exports.DateRangeApplier = DateRangeApplier;
