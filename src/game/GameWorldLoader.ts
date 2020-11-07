import {
    GameWorld,
    GameWorldModifier,
    CardActionData,
    EventCardActionData,
} from './ContentTypes'
import {
    Game,
    GameState,
    Card,
    CardAction,
    Params,
    StateModifier,
    Stat,
    ParamQuery,
} from './Types'
import { BasicGame } from './BasicGame'
import { stateExtensionFromData } from './StateExtensions'

export function load(gameWorld: GameWorld): Game<Params> {
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
                left: dataToAction(data.actions.left, defaultParams, 'No'),
                right: dataToAction(data.actions.right, defaultParams, 'Yes'),
            },
        }
    })
    const eventCards = Object.keys(gameWorld.eventCards).reduce<{
        [x: string]: Card<Params>
    }>((acc, key) => {
        const data = gameWorld.eventCards[key]
        acc[key] = {
            image: data.image,
            title: data.title,
            text: data.text,
            location: data.location,
            match: () => false,
            weight: 0,
            actions: {
                left: dataToAction(data.actions.left, defaultParams, 'No'),
                right: dataToAction(data.actions.right, defaultParams, 'Yes'),
            },
        }
        return acc
    }, {})
    for (const cardId in eventCards) {
        const data = gameWorld.eventCards[cardId]
        const eventCard = eventCards[cardId]

        eventCard.actions.left.modifier = eventCardChain(
            data.actions.left,
            eventCards,
            eventCard.actions.left.modifier,
        )
        eventCard.actions.right.modifier = eventCardChain(
            data.actions.right,
            eventCards,
            eventCard.actions.right.modifier,
        )
    }
    const events: StateModifier<Params>[] = gameWorld.events.map((event) => {
        const paramQueries = event.isAvailableWhen.map((q) => ({
            vars: q.state,
            flags: q.flags,
        }))
        const card = eventCards[event.initialEventCardId]
        return (state) => {
            const shouldExecute = Math.random() <= event.probability
            return !state.card &&
                shouldExecute &&
                hasMatchingParamQuery(state.params, paramQueries)
                ? {
                      ...state,
                      card: card,
                  }
                : state
        }
    })
    const parameterLimits = parameterLimiter(
        gameWorld.stats.map((stat) => stat.id),
        [0, 100],
    )
    const stats = gameWorld.stats.map<Stat<Params>>((stat) => ({
        ...stat,
        getValue: ({ params }) => params.vars[stat.id] ?? 0,
    }))
    const stateExtensions = stateExtensionFromData(
        gameWorld.worldStateModifiers,
    )
    return new BasicGame<Params>([...cards], stats, defaultParams, {
        tickModifiers: [...events, ...stateExtensions, parameterLimits],
    })
}

function eventCardChain(
    data: EventCardActionData,
    eventCards: { [x: string]: Card<Params> },
    modifier: StateModifier<Params>,
): StateModifier<Params> {
    const targetCard =
        data.nextEventCardId !== null ? eventCards[data.nextEventCardId] : null
    return targetCard
        ? (state) => ({
              ...modifier(state),
              card: targetCard,
          })
        : modifier
}

function dataToAction(
    data: CardActionData,
    defaultParams: Params,
    defaultDescription: string,
): CardAction<Params> {
    return {
        description: data.description ?? defaultDescription,
        modifier: (state) => updateParams(state, data.modifier, defaultParams),
    }
}

function parameterLimiter(
    ids: string[],
    [min, max]: [number, number],
): StateModifier<Params> {
    return (state) => ({
        ...state,
        params: {
            flags: state.params.flags,
            vars: {
                ...state.params.vars,
                ...ids.reduce<Params['vars']>((acc, id) => {
                    const value = state.params.vars[id]
                    if (value !== undefined) {
                        acc[id] = Math.max(min, Math.min(max, value))
                    }
                    return acc
                }, {}),
            },
        },
    })
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
