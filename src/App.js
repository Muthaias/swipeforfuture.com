import React from 'react'
import styled from 'styled-components/macro'

import Game from './components/Game'

const Container = styled.main`
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    background: #546a76;
    display: grid;
    grid-template-rows: minmax(50px, 80px) auto minmax(50px, 80px);
`

function App() {
    return (
        <Container>
            <Game />
        </Container>
    )
}

export default App
