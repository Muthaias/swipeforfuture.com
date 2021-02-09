import { Experimental, GameWorld } from './ContentTypes'

export function gameWorld2Experimental(
    gameWorld: GameWorld,
): Experimental.GameWorld {
    const cards: Experimental.CardData[] = [
        ...gameWorld.cards.map<Experimental.CardData>((c, index) => ({
            ...c,
            id: '__standard_' + index,
        })),
        ...Object.keys(gameWorld.eventCards).map<Experimental.CardData>(
            (cardId) => {
                const c = gameWorld.eventCards[cardId]
                const card: Experimental.CardData = {
                    ...c,
                    actions: {
                        left: {
                            ...c.actions.left,
                            ...(c.actions.left.nextEventCardId
                                ? { nextCardId: c.actions.left.nextEventCardId }
                                : {}),
                        },
                        right: {
                            ...c.actions.right,
                            ...(c.actions.right.nextEventCardId
                                ? {
                                      nextCardId:
                                          c.actions.right.nextEventCardId,
                                  }
                                : {}),
                        },
                    },
                    id: cardId,
                    isAvailableWhen: [],
                }
                return card
            },
        ),
    ]
    const events: Experimental.WorldEvent[] = gameWorld.events.map((event) => ({
        ...event,
        cardId: event.initialEventCardId,
    }))
    return {
        stats: gameWorld.stats,
        cards: cards,
        events: events,
        defaultState: gameWorld.defaultState,
        worldStateModifiers: gameWorld.worldStateModifiers,
    }
}
