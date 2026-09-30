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

`

