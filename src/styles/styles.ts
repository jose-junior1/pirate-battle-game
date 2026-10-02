import { createGlobalStyle } from "styled-components"
import colors from "./colors"

export const GlobalStyles = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body, #root {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: ${colors.black};
        color: ${colors.white};
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    .game-container {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .game-container canvas {
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 16 / 9;
        object-fit: contain;
        display: block;
        border-radius: 6px;
    }
`

