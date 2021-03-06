"use strict";
var DateRangeNode = require('./dateRange/dateRangeNode');
var DateRangeCollisionApplier = require('./dateRange/dateRangeCollisionApplier');
module.exports = class DateRangeApplier {
    static apply(allow, topNode, dateRangeList) {
        return allow ? this.applyAllow(topNode, dateRangeList) : this.applyDeny(topNode, dateRangeList);
    }
    static applyAllow(topNode, dateRangeList) {
        let result = topNode;
        dateRangeList.forEach((dateRange) => {
            let target = result;
            while (!!target) {
                const targetDateRange = target.dateRange;
                new DateRangeCollisionApplier(dateRange, targetDateRange)
                    .startInTarget(() => targetDateRange.to = dateRange.to)
                    .endInTarget(() => targetDateRange.from = dateRange.from)
                    .stickToTargetStart(() => targetDateRange.from = dateRange.from)
                    .stickToTargetEnd(() => targetDateRange.to = dateRange.to)
                    .coverTarget(() => {
                    targetDateRange.from = dateRange.from;
                    targetDateRange.to = dateRange.to;
                })
                    .noCollisionAhead(() => {
                    const insertionNode = new DateRangeNode(dateRange);
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
                        const insertionNode = new DateRangeNode(dateRange);
                        target.next = insertionNode;
                        target = insertionNode;
                    }
                })
                    .apply();
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
    static applyDeny(topNode, dateRangeList) {
        let result = topNode;
        dateRangeList.forEach((dateRange) => {
            let target = result;
            while (!!target) {
                const targetDateRange = target.dateRange;
                new DateRangeCollisionApplier(dateRange, targetDateRange)
                    .insideTarget(() => {
                    const insertionNode = new DateRangeNode({ from: new Date(dateRange.from), to: new Date(targetDateRange.to) });
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
                    .apply();
                target = target.next;
            }
        });
        return result;
    }
};
