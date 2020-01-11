import React, { Component } from 'react'
import styled from 'styled-components/macro'

import Deck from './Deck'
import Stats from './Stats'

// -------
// TODO: Move to data loader module

import {cards as gameCards} from '../data/CardBuilder'
import worldEvents from '../data/events.js'
import eventCards from '../data/event-cards.js'

for (const eventCardId of Object.keys(eventCards)) {
    eventCards[eventCardId].type = 'event'
}

// ------

const Footer = styled.footer`
    display: flex;
    justify-content: center;
    align-items: center;
`

const DIRECTION = {
    LEFT: -1,
    RIGHT: 1
}

const DEFAULT_GAME_WORLD = Object.freeze({
    state: {
        environment: 40,
        people: 60,
        security: 75,
        money: 90
    },
    flags: {}
})

export default class Game extends Component {
    state = this.getInitialState()

    render() {
        return (
            <>
                <Stats stats={this.state.world.state} />
                <Deck
                    onSwipe={this.onSwipe.bind(this)}
                    cards={[this.addUniqueCardId(this.state.card)]}
                    tick={this.state.rounds}
                />
                <Footer>
                    <div className="time-remaining"></div>
                </Footer>
            </>
        )
    }

    getInitialState() {
        return {
            world: DEFAULT_GAME_WORLD,
            card: this.selectNextCard(
                this.getAvailableCards(DEFAULT_GAME_WORLD)
            ),
            rounds: 0,
        }
    }

    getAvailableCards(world) {
        return gameCards.filter(c =>
            this.hasMatchingWorldQuery(world, c.isAvailableWhen)
        )
    }

    getAvailableEvents(world) {
        return worldEvents.filter(e =>
            this.hasMatchingWorldQuery(world, e.shouldTriggerWhen)
        )
    }

    hasMatchingWorldQuery(world, worldQueries) {
        return worldQueries.some(q => this.isMatchingWorldQuery(world, q))
    }

    isMatchingWorldQuery(world, { state = {}, flags = {} }) {
        const hasStateMatch = Object.entries(state).every(
            ([key, [min, max]]) =>
                world.state[key] >= min && world.state[key] <= max
        )

        const result =
            hasStateMatch &&
            Object.entries(flags).every(
                ([flag, value]) => world.flag[flag] === value
            )

        return result
    }

    onSwipe(card, direction) {
        const currentAction =
            direction === DIRECTION.LEFT
                ? card.actions.left
                : card.actions.right

        const updatedWorld = this.getUpdatedWorld(currentAction)

        this.setState({
            world: updatedWorld,
            card: this.getNextCard(updatedWorld, card, currentAction),
            rounds: this.state.rounds + 1,
        })
    }

    getNextCard(updatedWorld, card, currentAction) {
        const availableEvents = this.getAvailableEvents(updatedWorld)
        const eventStartingNow =
            card.type !== 'event' ? this.selectNextEvent(availableEvents) : null
        let nextCard

        const isEventCardWithPointer =
            card.type === 'event' &&
            typeof currentAction.nextEventCardId === 'string'

        // Only select the next EventCard if a specific one is given
        // Else cancel the event and continue with normal cards.
        if (isEventCardWithPointer) {
            if (!eventCards.hasOwnProperty(currentAction.nextEventCardId)) {
                throw new Error(
                    `eventCardId "${currentAction.nextEventCardId}" does not exist. Make sure it's spelled correctly`
                )
            }
            nextCard = this.selectEventCard(currentAction.nextEventCardId)
        } else if (eventStartingNow) {
            nextCard = this.selectEventCard(eventStartingNow.initialEventCardId)
        } else {
            const availableCards = this.getAvailableCards(updatedWorld)
            nextCard = this.selectNextCard(availableCards)
        }

        return nextCard
    }

    getUpdatedWorld({ modifier = {}, flags = {}, modifierType = 'add' }) {
        const updatedWorldState = this.updateWorldState(modifier, modifierType)
        const updatedWorldFlags = this.updateWorldFlags(flags, modifierType)

        return {
            state: updatedWorldState,
            flags: updatedWorldFlags
        }
    }

    updateWorldState(modifier, modifierType) {
        const currentWorldState =
            modifierType === 'replace'
                ? Object.assign({}, DEFAULT_GAME_WORLD.state)
                : Object.assign({}, this.state.world.state)

        const updatedWorldState = Object.entries(modifier).reduce(
            (updatedState, [key, value]) => {
                const newValue =
                    modifierType === 'set' || modifierType === 'replace'
                        ? value
                        : value + (updatedState[key] || 0)

                updatedState[key] = Math.min(Math.max(newValue, 0), 100)

                return updatedState
            },
            currentWorldState
        )

        return updatedWorldState
    }

    updateWorldFlags(flags, modifierType) {
        const currentWorldFlags =
            modifierType === 'replace'
                ? Object.assign({}, DEFAULT_GAME_WORLD.flags)
                : Object.assign({}, this.state.world.flags)

        const updatedWorldFlags = Object.keys(flags).reduce(
            (updatedFlags, key) => {
                updatedFlags[key] = flags[key]
                return updatedFlags
            },
            currentWorldFlags
        )

        return updatedWorldFlags
    }

    addUniqueCardId(card, index = 0) {
        return {
            ...card,
            id: Date.now() + ':' + index
        }
    }

    selectNextCard(cards = []) {
        return this.selectRandomFrom(cards)
    }

    selectNextEvent(events = []) {
        const event = this.selectRandomFrom(events)
        if (event && Math.random() < event.probability) {
            return event
        }
    }

    selectRandomFrom(array) {
        return array[Math.floor(Math.random() * array.length)]
    }

    selectEventCard(cardId) {
        return eventCards[cardId]
    }
}
