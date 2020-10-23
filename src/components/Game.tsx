import React, { ReactElement } from 'react'

import { SwipeDirection } from '../util/constants'
import { GameScenario } from '../game/GameScenario'
import { CardData, EventCard, StatDefinition } from '../game/ContentTypes'
import { useScenarioState } from '../hooks'

type GameProps = {
    scenario: GameScenario
    children: ReactElement<GameRunnerProps>[]
}

export type DeckProps = {
    onSwipe: (card: CardData | EventCard, direction: SwipeDirection) => void
    card: (CardData | EventCard) & { id: string }
    tick: number
}

export type StatsProps = {
    stats?: (StatDefinition & { value: number })[]
}

export type GameRunnerProps = DeckProps | StatsProps

const Game: React.FunctionComponent<GameProps> = ({ scenario, children }) => {
    const { rounds, onSwipe, card, stats } = useScenarioState(scenario)

    return <></>
}

export default Game
