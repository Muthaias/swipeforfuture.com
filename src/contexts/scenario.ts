import { createContext } from 'react'
import { GameScenario, MockGameScenario } from '../game/GameScenario'

export const ScenarioContext = createContext<GameScenario>(
    new MockGameScenario(),
)
