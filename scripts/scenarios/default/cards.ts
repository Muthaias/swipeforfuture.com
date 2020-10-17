import { CardData } from '../../../src/game/ContentTypes'
import {
    worldQuery,
    addAction,
    unsplashImage,
    pexelsImage,
} from '../../content-utils'
import { cardContent, cardGameProperties } from "./card-utils";
import { ENVIRONMENT, MONEY, PEOPLE, SECURITY, POPULARITY } from './stats'
import { VARS } from './vars'
import { FLAGS } from './flags'

const germanEnergyCompetition = cardContent(
    unsplashImage('1497435334941-8c899ee9e8e9'),
    "Our solar project is ready!",
    "Congratulations! We beat the initial German energy expansion ⚡️",
    "The greener other side",
    ["At what cost?", "That's great!"]
);

const brownCoalForSale = cardContent(
    pexelsImage('3044473'),
    "Cheap but dirty brown coal for sale",
    "We've got an interesting offer: Buy a modern brown coal power plant cheaply to generate electricity. Deal? Great! (WATCH OUT FOR ENVIRA though...)",
    "Working class district",
    ["I have other offers to consider.", "Give me some of that!"]
);

export const otherCards: CardData[] = [
    cardGameProperties(
        germanEnergyCompetition,
        [
            worldQuery(
                {
                    [VARS.SOLAR_INVESTMENTS]: [1, 1],
                },
                {
                    [FLAGS.INFRAN_INIT]: true,
                },
            ),
        ],
        [
            addAction({
                [ENVIRONMENT]: 30,
                [PEOPLE]: 15,
                [SECURITY]: 15,
                [MONEY]: 5,
                [POPULARITY]: 20,
                [VARS.SOLAR_INVESTMENTS]: 100,
            }),
            addAction({
                [ENVIRONMENT]: 30,
                [PEOPLE]: 15,
                [SECURITY]: 15,
                [MONEY]: 5,
                [POPULARITY]: 20,
                [VARS.SOLAR_INVESTMENTS]: 100,
            })
        ],
        100
    ),
    cardGameProperties(
        brownCoalForSale,
        [
            worldQuery({
                [ENVIRONMENT]: [21, 100],
                [MONEY]: [15, 100],
                [VARS.BROWN_COAL_PLANTS]: [0, 0],
            }),
        ],
        [
            addAction(
                {
                    [ENVIRONMENT]: 10,
                    [PEOPLE]: 10,
                    [SECURITY]: 15,
                    [MONEY]: -5,
                    [POPULARITY]: 25,
                    [VARS.BROWN_COAL_PLANTS]: 0,
                }
            ),
            addAction(
                {
                    [ENVIRONMENT]: -20,
                    [PEOPLE]: -15,
                    [SECURITY]: -10,
                    [MONEY]: 40,
                    [POPULARITY]: -20,
                    [VARS.BROWN_COAL_PLANTS]: 1,
                }
            )
        ],
        100
    ),
]
