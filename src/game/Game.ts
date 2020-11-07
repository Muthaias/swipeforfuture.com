import { GameWorld, GameWorldModifier } from './ContentTypes'

export type Params = {
    vars: {
        [id: string]: number
    }
    flags: {
        [id: string]: boolean
    }
}

export type ParamQuery = {
    vars?: {
        [id: string]: [number, number]
    }
    flags?: {
        [id: string]: boolean
    }
}

export type StatDefinition<P> = {
    getValue: (state: GameState<P>) => number
    id: string
    name: string
    icon: string
    iconSize?: string
}

export type StateModifier<P> = (state: GameState<P>) => GameState<P>

export interface CardAction<P> {
    description: string
    modifier: StateModifier<P>
}

export interface Card<P> {
    image: string
    title: string
    text: string
    location: string
    match(state: GameState<P>): boolean
    weight: number
    actions: {
        left: CardAction<P>
        right: CardAction<P>
    }
}

export type GameState<P> = {
    card?: Card<P>
    params: P
}

export interface Game<P> {
    initialState: GameState<P>
    applyAction(prevState: GameState<P>, action: StateModifier<P>): GameState<P>
    stats: StatDefinition<P>[]
}

export type GameOptions<P> = {
    random: () => number
    tickModifiers: StateModifier<P>[]
}

export class BasicGame<P> implements Game<P> {
    protected _cards: Card<P>[]
    protected _random: () => number
    protected _tickModifiers: StateModifier<P>[]
    protected _stats: StatDefinition<P>[]
    protected _initialParams: P

    constructor(
        cards: Card<P>[],
        stats: StatDefinition<P>[],
        initialParams: P,
        options: Partial<GameOptions<P>> = {},
    ) {
        const { random = Math.random, tickModifiers = [] } = options
        this._cards = cards
        this._random = random
        this._tickModifiers = tickModifiers
        this._initialParams = initialParams
        console.log(this._initialParams)
        this._stats = stats
    }

    get stats() {
        return this._stats
    }

    get initialState(): GameState<P> {
        return this.applyAction(
            {
                params: this._initialParams,
            },
            (s) => s,
        )
    }

    applyAction(state: GameState<P>, action: StateModifier<P>): GameState<P> {
        const nextState = this.applyModifiers(
            {
                ...state,
                card: undefined,
            },
            [action, ...this._tickModifiers],
        )
        return nextState.card
            ? nextState
            : {
                  ...nextState,
                  card: this.selectWeightedRandomFrom(
                      this.getAvailableCards(nextState),
                  ),
              }
    }

    applyModifiers(
        state: GameState<P>,
        modifiers: StateModifier<P>[],
    ): GameState<P> {
        return modifiers.reduce((acc, modifier) => modifier(acc), state)
    }

    getAvailableCards(state: GameState<P>): Card<P>[] {
        return this._cards.filter((c) => c.match(state))
    }

    selectWeightedRandomFrom<T extends { weight: number }>(
        array: T[],
        weightFunc = (element: T) => element.weight,
    ): T {
        const { selectionList, count } = array.reduce<{
            count: number
            selectionList: number[]
        }>(
            (acc, element) => {
                acc.count += weightFunc(element)
                acc.selectionList.push(acc.count)
                return acc
            },
            { count: 0, selectionList: [] },
        )

        const selectionPosition = this._random() * count
        const selectionIndex = selectionList.findIndex((max, index, array) => {
            const min = index > 0 ? array[index - 1] : 0
            return selectionPosition >= min && selectionPosition <= max
        })

        return array[selectionIndex]
    }

    static fromGameWorldData(gameWorld: GameWorld): Game<Params> {
        const defaultParams = {
            flags: gameWorld.defaultState.flags,
            vars: gameWorld.defaultState.state,
        }
        const cards = gameWorld.cards.map<Card<Params>>((data) => {
            const paramQueries = data.isAvailableWhen.map((q) => ({
                vars: q.state,
                flags: q.flags,
            }))
            return {
                image: data.image,
                title: data.title,
                text: data.text,
                location: data.location,
                match: (s) => hasMatchingParamQuery(s.params, paramQueries),
                weight: data.weight,
                actions: {
                    left: {
                        description: data.actions.left.description ?? 'No',
                        modifier: (state) =>
                            updateParams(
                                state,
                                data.actions.left.modifier,
                                defaultParams,
                            ),
                    },
                    right: {
                        description: data.actions.left.description ?? 'Yes',
                        modifier: (state) =>
                            updateParams(
                                state,
                                data.actions.right.modifier,
                                defaultParams,
                            ),
                    },
                },
            }
        })
        const eventCards = Object.keys(gameWorld.eventCards).map<Card<Params>>(
            (key) => {
                const data = gameWorld.eventCards[key]
                return {
                    id: key,
                    image: data.image,
                    title: data.title,
                    text: data.text,
                    location: data.location,
                    match: () => false,
                    weight: 0,
                    actions: {
                        left: {
                            description: 'No',
                            modifier: (s) => s,
                        },
                        right: {
                            description: 'Yes',
                            modifier: (s) => s,
                        },
                    },
                }
            },
        )
        const stats = gameWorld.stats.map<StatDefinition<Params>>((stat) => ({
            ...stat,
            getValue: ({ params }) => params.vars[stat.id] ?? 0,
        }))
        return new BasicGame<Params>(
            [...cards, ...eventCards],
            stats,
            defaultParams,
        )
    }
}

function hasMatchingParamQuery(
    params: Params,
    worldQueries: ParamQuery[],
): boolean {
    return worldQueries.some((q) => isMatchingParamQuery(params, q))
}

function isMatchingParamQuery(
    params: Params,
    { vars = {}, flags = {} }: ParamQuery,
): boolean {
    const hasStateMatch = Object.entries(vars).every(
        ([key, [min, max]]) =>
            params.vars[key] >= min && params.vars[key] <= max,
    )

    const result =
        hasStateMatch &&
        Object.entries(flags).every(
            ([flag, value]) => !!params.flags[flag] === value,
        )

    return result
}

function updateParams(
    state: GameState<Params>,
    modifier: GameWorldModifier,
    defaultParams: Params,
): GameState<Params> {
    return {
        ...state,
        params: {
            vars: updateVars(state.params.vars, modifier, defaultParams.vars),
            flags: updateFlags(
                state.params.flags,
                modifier,
                defaultParams.flags,
            ),
        },
    }
}

function updateVars(
    params: Params['vars'],
    modifier: GameWorldModifier,
    defaultVars: Params['vars'],
): Params['vars'] {
    const currentVars: Params['vars'] =
        modifier.type === 'replace'
            ? Object.assign({}, defaultVars)
            : Object.assign({}, params)

    const stateModifier = modifier.state || {}
    const updatedWorldState = Object.entries(stateModifier).reduce<
        Params['vars']
    >((updatedState, [key, value]) => {
        const newValue =
            modifier.type === 'set' || modifier.type === 'replace'
                ? value
                : value + (updatedState[key] || 0)

        updatedState[key] = Math.min(Math.max(newValue, 0), 100)

        return updatedState
    }, currentVars)

    return updatedWorldState
}

function updateFlags(
    flags: Params['flags'],
    modifier: GameWorldModifier,
    defaultFlags: Params['flags'],
): Params['flags'] {
    const currentFlags: Params['flags'] =
        modifier.type === 'replace'
            ? Object.assign({}, defaultFlags)
            : Object.assign({}, flags)

    const flagsModifier = modifier.flags || {}
    const updatedWorldFlags = Object.entries(flagsModifier).reduce<
        Params['flags']
    >((updatedFlags, [key, value]) => {
        updatedFlags[key] = value
        return updatedFlags
    }, currentFlags)

    return updatedWorldFlags
}
