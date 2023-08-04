import styled from "styled-components";
import JBRegular from '../assets/fonts/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Regular.woff2'
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const PageContainer = styled.div`
  @font-face {
		font-family: 'JetBrains Mono';
    src: url(${JBRegular}) format('woff2');
    font-weight: normal;
    font-style: normal;
	}
	
	h1, p {
		color: white;
		font-family: 'JetBrains Mono', monospace;
  }
	
	background: black;
	align-items: center;
	text-align: center;
	justify-content: center;
	flex-direction: column;
	position: fixed;
	width: 100%;
`

const Pong = () => {
	const canvasRef = useRef<HTMLCanvasElement | null> (null);
	const canvasWidth = 800;
	const canvasHeight = 400;

	const paddleHeight = 75;
	const paddleWidth = 10;
	const [leftPaddleY, setLeftPaddleY] = useState<number>(canvasHeight / 2 - paddleHeight / 2);
  	const [rightPaddleY, setRightPaddleY] = useState<number>(canvasHeight / 2 - paddleHeight / 2);
	const [ball, setBall] = useState<number>(0);

	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		socketRef.current = io('http://localhost:3000');

		socketRef.current.on('connect', () => {
			console.log('connected: ', socketRef.current?.id);
		})
		
		socketRef.current.on('error', (error: string) => {
			console.log("Websocket connection error: ", error);
		})

		socketRef.current.on('updateLeftPaddle', (newPositionLPY: string) => {
			setLeftPaddleY(parseInt(newPositionLPY));
		});

		socketRef.current.on('updateRightPaddle', (newPositionLPY: string) => {
			setRightPaddleY(parseInt(newPositionLPY));
		});

		socketRef.current.on('updateBallPosition', (newPositionBall: string) => {
			setBall(parseInt(newPositionBall));
		});

		socketRef.current.emit('setCanvas', {canvasHeight, paddleHeight, leftPaddleY});
		
		window.addEventListener("keydown", handleKeyDown);
		
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			socketRef.current?.disconnect();
			socketRef.current?.off('error');
			socketRef.current?.off('updatePaddlePosition');
			socketRef.current?.off('updateBallPosition');
		};
	}, []);
	
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "w") {
			socketRef.current?.emit('movePaddle', 'up');
		} else if (event.key === "s") {
			socketRef.current?.emit('movePaddle', 'down');
		}
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext("2d");
			if (context) {
				canvas.width = canvasWidth;
				canvas.height = canvasHeight;

				// make background canvas black
				context.fillStyle = 'black';
				context.fillRect(0, 0, canvas.width, canvas.height);

				// draw a white border
				context.strokeStyle = 'white';
				context.lineWidth = 3;
				context.setLineDash([]);
				context.strokeRect(0, 0, canvas.width, canvas.height);

				// draw the dashed divider line
				context.setLineDash([30, 15]);
				context.beginPath();
				context.moveTo(canvas.width / 2, 0);
				context.lineTo(canvas.width / 2, canvas.height);
				context.stroke();

				// draw both paddles
				context.fillStyle = 'white';
				context.fillRect(40, leftPaddleY, paddleWidth, paddleHeight);
				context.fillRect(canvasWidth - paddleWidth - 40, rightPaddleY, paddleWidth, paddleHeight);
			}
		}
	
	}, [leftPaddleY, rightPaddleY, ball])


	return (
		<PageContainer>
			<h1>Pong</h1>
			<canvas ref={canvasRef} />
			<p>Use the arrow keys to play the game</p>
		</PageContainer>
	)
}

export default Pong;
