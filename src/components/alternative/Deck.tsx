import React, { useContext } from 'react'
import { ScenarioContext } from '../../contexts/scenario'
import { FunctionComponent } from 'react'
import { DeckProps } from '../Game'
import styled from 'styled-components/macro'
import { useScenarioState } from '../../hooks'

const CardContainer = styled.div`
    margin: auto;
    width: 100%;
    min-width: 300px;
    max-width: 400px;

    & > .content-aspect-ratio {
        position: relative;
        width: 100%;
        padding-bottom: 180%;
        background: #eee;

        & > .content {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;

            & > .text {
                font-size: 20px;
                padding: 20px;
                margin: 20px;
                box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);
            }
        }
    }
`

function getProp<U, T extends keyof U = keyof U, R = U[T]>(
    prop: T,
    transform?: (input: U[T]) => R,
): (props: Pick<U, T>) => U[T] | R {
    const t = transform
    return t === undefined
        ? (props) => {
              return props[prop]
          }
        : (props) => {
              return t(props[prop])
          }
}

const image = getProp<CardProps>('image')
const imageSize = getProp<CardProps>('imageFormat', (f) =>
    f === 'portrait' ? '100% auto' : 'auto 100%',
)
const borderColor = getProp<CardProps>('borderColor')
const borderSize = getProp<CardProps>('borderSize')

type CardProps = {
    image: string
    imageFormat: 'portrait' | 'landscape'
    borderColor: string
    borderSize: string | number
}
const Card = styled.div<CardProps>`
    box-sizing: border-box;
    width: 100%;
    padding-bottom: 100%;
    border-radius: 10%;
    border: solid ${borderSize} ${borderColor};
    background-image: url(${image});
    background-size: ${imageSize};
    background-color: #000;
    background-position: center center;
    background-repeat: no-repeat;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);
`

export const Deck: FunctionComponent<Partial<DeckProps>> = () => {
    const scenario = useContext(ScenarioContext)
    const { card } = useScenarioState(scenario)
    return (
        <CardContainer>
            <div className="content-aspect-ratio">
                <div className="content">
                    <Card
                        image={card.image}
                        imageFormat="portrait"
                        borderColor="#fff"
                        borderSize="10px"
                    />
                    <div className="text">{card.text}</div>
                </div>
            </div>
        </CardContainer>
    )
}
