type WorldState = {}

interface CardDescription {
    image: string
    title: string
    text: string
    weight: number
}

export interface CardActionData {
    description?: string
    modifierType?: 'add' | 'set' | 'replace'
    modifier?: {
        environment?: number
        people?: number
        security?: number
        money?: number
    }
    flags?: {
        [x: string]: boolean
    }
}

export interface CardData extends CardDescription {
    isAvailableWhen: WorldQuery[]
    actions: {
        left: CardActionData
        right: CardActionData
    }
}

type WorldStateRange = [number, number]

export interface WorldQuery {
    state?: {
        [x: string]: WorldStateRange,
    }
    flags?: {
        [x: string]: boolean
    }
}

// -----------------------------

interface WorldEvent {
    probability: number
    shouldTriggerWhen?: WorldQuery[]
    initialEventCardId: EventCardId
}

type EventCards = {
    [eventCardId: string]: EventCard
}

interface EventCard extends CardDescription {
    actions: {
        left: EventCardActionData
        right: EventCardActionData
    }
}

type EventCardId = string

interface EventCardActionData extends CardActionData {
    nextEventCardId: EventCardId
}
