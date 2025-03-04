export enum StageTypeEnum {
    // 'annotate' | 'review' | 'acceptance' | 'quality'
    ANNOTATE = 'annotate',
    REVIEW = 'review',
    ACCEPTANCE = 'acceptance',
    VIEW = 'view',
    QUALITY = 'quality',
    COMPLETED = 'completed',
    // MODIFY = 'modify',
    EMPTY = 'empty',
}

export enum StatusToStage {
    NEED_ACCEPTANCE = 'acceptance',
    COMPLETED = 'completed',
}

export enum TaskItemStatusEnum {
    NOT_STARTED = 'NOT_STARTED',
    ONGOING = 'ONGOING',
    NEED_ACCEPTANCE = 'NEED_ACCEPTANCE',
    COMPLETED = 'COMPLETED',
}

export enum rejectWorkEnum {
    ORIGINAL = 'ORIGINAL',
    NEW = 'NEW',
}

/** Claim Time Enum */
export enum TimeStatusEnum {
    PAUSED = 'PAUSED',
    WORKING = 'WORKING',
    TIMEOUT = 'TIMEOUT',
    DONE = 'DONE',
}
