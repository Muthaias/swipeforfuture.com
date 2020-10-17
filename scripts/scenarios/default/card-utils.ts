import {
    CardData,
    CardActionData,
    WorldQuery,
} from '../../../src/game/ContentTypes'
import {
    addAction,
} from '../../content-utils'

export function cardContent(
    image: string,
    title: string,
    text: string,
    location: string,
    [left, right]: [string, string],
): CardData {
    return {
        type: "card",
        isAvailableWhen: [{}],
        image: image,
        title: title,
        text: text,
        location: location,
        weight: 1,
        actions: {
            left: addAction({}, {}, left),
            right: addAction({}, {}, right),
        }
    };
}

export function cardGameProperties(
    card: CardData,
    isAvailableWhen: WorldQuery[],
    [left, right]: [CardActionData, CardActionData],
    weight: number,
): CardData {
    return {
        ...card,
        weight,
        isAvailableWhen,
        actions: {
            left: {
                ...left,
                description: card.actions.left.description
            },
            right: {
                ...right,
                description: card.actions.right.description,
            }
        }
    }
}