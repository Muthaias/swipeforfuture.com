import { useState, useEffect, useMemo } from 'react'
import { GameScenario } from '../game/GameScenario'
import { GameState } from '../game/GameTypes'
import {
    CardData,
    EventCard,
    StatDefinition,
    WorldState,
} from '../game/ContentTypes'
import { SwipeDirection } from '../util/constants'

export type ScenarioRuntime = {
    worldState: WorldState
    onSwipe: (card: CardData | EventCard, direction: SwipeDirection) => void
    card: (CardData | EventCard) & { id: string }
    stats: StatDefinition[]
    rounds: number
}

export function useScenarioState(scenario: GameScenario): ScenarioRuntime {
    const [state, setState] = useState<GameState>(() =>
        scenario.getInitialState(),
    )

    useEffect(() => {
        setState(scenario.getInitialState())
    }, [scenario])

    const runtime = useMemo(
        () => ({
            rounds: state.rounds,
            card: addUniqueCardId(state.card),
            worldState: state.world,
            stats: scenario.stats.map((stat) =>
                Object.assign({}, stat, {
                    value: state.world.state[stat.id],
                }),
            ),
            onSwipe(
                card: CardData | EventCard,
                direction: SwipeDirection,
            ): void {
                const action =
                    direction === SwipeDirection.Left
                        ? card.actions.left
                        : card.actions.right

                setState(scenario.getUpdatedState(state, card, action))
            },
        }),
        [scenario, state],
    )

    return runtime
}

function addUniqueCardId(
    card: CardData | EventCard,
    index: number = 0,
): (CardData | EventCard) & { id: string } {
    return {
        ...card,
        id: Date.now() + ':' + index,
    }
}
