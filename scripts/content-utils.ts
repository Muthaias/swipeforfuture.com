// GOAL: composable functions to generate content based on ContentTypes + variable input
// GOAL: export JSON
// GOAL: Save game world scenario to specific folder

import {
    CardData,
    EventCard,
    GameWorld,
    StatDefinition,
    CardActionData,
    WorldQuery,
    EventCardActionData,
} from '../src/game/ContentTypes'

export type Scenario = {
    id: string
} & GameWorld

export interface ScenarioBuilder {
    run: () => Scenario
}

/**
 * Create a card template to be use to construct additional cards
 * Templates are used to create partial cards
 *
 * @param cardData The must have data for a template card
 * @param extras Optional additional data that is seldom reused from a template
 */
export function createCardTemplate(
    cardData: Pick<CardData, 'image' | 'location' | 'weight'>,
    extras: Partial<Pick<CardData, 'title' | 'text'>> = {},
): CardData {
    return {
        type: 'card',
        ...cardData,
        ...{
            title: '',
            text: '',
            ...extras,
        },
        isAvailableWhen: [],
        actions: {
            left: { modifier: {} },
            right: { modifier: {} },
        },
    }
}

/**
 * Create an event card based on a template, to avoid repetition
 *
 * @param template The card template to extend
 * @param override Fields to override
 */
export function createEventCardFromTemplate(
    { image, title, text, location, weight }: CardData,
    override: Partial<EventCard>,
): EventCard {
    const eventCard: EventCard = {
        image,
        title,
        text,
        location,
        weight,
        type: 'event',
        actions: {
            left: {
                ...addAction({}),
                nextEventCardId: null,
            },
            right: {
                ...addAction({}),
                nextEventCardId: null,
            },
        },
    }

    return {
        ...eventCard,
        ...override,
    }
}

/**
 * Create a card based on a template, to avoid repetition
 *
 * @param template The card template to extend
 * @param override Fields to override
 */
export function createCardFromTemplate(
    template: CardData,
    override: Partial<CardData>,
): CardData {
    return {
        ...template,
        ...override,
    }
}

/*
    IDEA: User stories

    As a card developer I would like to:
    - Use card templates in order to reduce work duplication
    - Use worldquery templates
    - Use action templates
    - Create convenience function for creating a card that only should trigger once (using a unique flag)
*/

export function unsplashImage(id: string): string {
    return `https://images.unsplash.com/photo-${id}?fit=crop&w=800&q=60`
}

// Credit: https://gist.github.com/mathewbyrne/1280286
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}

export function worldQuery(
    state: WorldQuery['state'] = {},
    flags: WorldQuery['flags'] = {},
): WorldQuery {
    return {
        state,
        flags,
    }
}

export const setAction = action('set')
export const addAction = action('add')
export const replaceAction = action('replace')

export function action(
    type: CardActionData['modifier']['type'],
): (
    state?: CardActionData['modifier']['state'],
    flags?: CardActionData['modifier']['flags'],
) => CardActionData {
    return (state = {}, flags = {}) => {
        return {
            modifier: {
                type,
                state,
                flags,
            },
        }
    }
}

/**
 * Create an EventCard action to modify the state & flags and possibly point to another EventCard.
 *
 * @param action The action to trigger upon swipe.
 * @param eventCardId The next EventCard to trigger, or null to stop the event.
 */
export function eventCardAction(
    action: CardActionData,
    eventCardId: EventCardActionData['nextEventCardId'] = null,
): EventCardActionData {
    return {
        ...action,
        nextEventCardId: eventCardId,
    }
}

/**
 * Generate a unique cardRef to identify cards
 *
 * @param debugHint A string to identify the cardRef and help debugging
 */
export const cardRef: (debugHint: string) => string = createRefFactory('card')

/**
 * Generate a unique propRef to identify properties
 *
 * @param debugHint A string to identify the propRef and help debugging
 */
export const propRef: (debugHint: string) => string = createRefFactory('prop')

/**
 * Generate a reference factory in order to use separate reference contexts
 *
 * @param type A string to identify the type of reference to create
 */
function createRefFactory(type: string) {
    const typeSlug = slugify(type)
    let ticker = 0

    return (debugHint: string) => {
        const prefix = slugify(debugHint)
        return `${prefix}:${typeSlug}:${ticker++}`
    }
}

export function stat(
    name: string,
    icon: string,
    iconSize?: string,
): StatDefinition {
    return {
        id: slugify(name),
        name,
        icon,
        iconSize,
    }
}
