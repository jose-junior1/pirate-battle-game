import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { GameEngine } from '../../game/Game';
import colors from '../../styles/colors';

const Container = styled.div`
    background-color: ${colors.oceanBlue};
`;

export const GameContainer = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const game = new GameEngine();
        game.init(containerRef.current);

        return () => {
            game.destroy()
        }
    }, []);

    return <Container className="game-container" ref={containerRef} />;
}