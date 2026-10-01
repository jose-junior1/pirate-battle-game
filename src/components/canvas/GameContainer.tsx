import { useEffect, useRef } from 'react';
import { GameEngine } from '../../game/Game';
import styled from 'styled-components';

const Container = styled.div`
    background-color: #000;
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