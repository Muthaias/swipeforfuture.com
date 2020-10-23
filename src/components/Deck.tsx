import React from 'react'

import Card from './Card'
import { DummyCard } from './CardView'

import { DeckProps } from './Game'

const Deck: React.FunctionComponent<Partial<DeckProps>> = ({
    onSwipe = () => {},
    card,
    tick = 0,
}) => {
    const cardStack = Array.apply(null, Array(5)).map((_, index) => index)
    return (
        <div className="deck-root">
            {cardStack.map((key, index, list) => (
                <DummyCard
                    x={0}
                    y={
                        10 +
                        list[loopingIndex(index, list.length, tick)] *
                            (50 / list.length)
                    }
                    key={index}
                    r={Math.sin(key * 2345) * 1}
                    layer={list.length - loopingIndex(index, list.length, tick)}
                />
            ))}
            {card !== undefined ? (
                <Card
                    i={0}
                    key={card.id}
                    cardData={card}
                    onSwipe={onSwipe}
                    layer={cardStack.length + 1}
                />
            ) : undefined}
        </div>
    )
}

function loopingIndex(index: number, length: number, tick: number) {
    const result = (length + index - (tick % length)) % length
    return result
}

export default Deck
