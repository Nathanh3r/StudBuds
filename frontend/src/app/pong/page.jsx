"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function PongPage() {
  // Reference to the canvas that is being drawn
  const canvasRef = useRef(null);

  // The score of each player
  const [playerScore, setPlayerScore] = useState(0); // left paddle this is going to be you
  const [aiScore, setAiScore] = useState(0);         //  right paddle the bot that is fighting you

  // Renders game logic
  useEffect(() => {
    // get the canvas we drew
    const canvas = canvasRef.current;
    if (!canvas) return; // safety check

    // Get drawing
    const ctx = canvas.getContext("2d");

    // Canvas drawing setting
    const width = canvas.width;
    const height = canvas.height;

    let animationFrameId; // stores animation for game

    //objects for the game

    // Paddle size in game
    const paddleWidth = 10;
    const paddleHeight = 60;

    // Paddle positions begin the game centered
    let leftPaddleY = height / 2 - paddleHeight / 2;
    let rightPaddleY = height / 2 - paddleHeight / 2;

    // what the ball can do
    const ballRadius = 6;
    let ballX = width / 2;
    let ballY = height / 2;
    let ballSpeedX = 3;     // x ball speed
    let ballSpeedY = 2.3;   // y ball speed

    // Paddle movement speeds
    const playerSpeed = 9; // ball is fast
    const aiSpeed = 2.0;   // ai moves slower now

    // AI reaction randomness 
    const deadZone = 25;        // AI ignores small differences
    const aiReactChance = 0.8;  // AI reacts only 80% of frames

    // find which key was pressed
    let upPressed = false;
    let downPressed = false;

    //starting the controls

    // Detect when keys are pressed
    const keyDownHandler = (e) => 
        {
      if (e.key === "ArrowUp" || e.key === "w")
        {
             upPressed = true;
        }
      if (e.key === "ArrowDown" || e.key === "s")
        {
             downPressed = true;
        }
    };

    // Detect when keys are released
    const keyUpHandler = (e) => {
      if (e.key === "ArrowUp" || e.key === "w")
        {
             upPressed = false;
        }
      if (e.key === "ArrowDown" || e.key === "s") 
        {
            downPressed = false;
        }
    };

    // make keyboard trackers
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    //ball gets set to a point
    const resetBall = () => {
      ballX = width / 2;
      ballY = height / 2;

      // Send the ball back toward the scoring player
      ballSpeedX = -ballSpeedX;

      // Give ball a random vertical direction
      ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 2.2;
    };

   //runs animation to draw the ball
    const draw = () => {

      //clear screen
      ctx.fillStyle = "#020617";         // dark background
      ctx.fillRect(0, 0, width, height); // fill entire canvas

      // middle line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]); // reset dash

      
      if (upPressed)
        {
             leftPaddleY -= playerSpeed;
        }
      if (downPressed)
        {
             leftPaddleY += playerSpeed;
        }

      // Prevent paddle from off screen
      leftPaddleY = Math.max(0, Math.min(height - paddleHeight, leftPaddleY));

      //move once the paddle is here

      // AI tries to follow ball
      const paddleCenter = rightPaddleY + paddleHeight / 2;
      const diff = ballY - paddleCenter;

      // Only react if ball is far from center AND random chance succeeds
      if (Math.abs(diff) > deadZone && Math.random() < aiReactChance) {
        if (diff < 0)
            {
                 rightPaddleY -= aiSpeed;
            }
        else
            {
                 rightPaddleY += aiSpeed;
            }
      }

      // Keep AI paddle on screen
      rightPaddleY = Math.max(0, Math.min(height - paddleHeight, rightPaddleY));

      //make the paddles
      ctx.fillStyle = "#4f46e5"; // blue-purple
      ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);
      ctx.fillRect(width - 10 - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);

     //ball begins to move
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      //wall colisons
      if (ballY - ballRadius < 0 || ballY + ballRadius > height) {
        ballSpeedY = -ballSpeedY; // bounce vertical
      }

      //left paddle 
      if (
        ballX - ballRadius < 10 + paddleWidth &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + paddleHeight
      ) {
        ballSpeedX = -ballSpeedX;
        ballX = 10 + paddleWidth + ballRadius;
      }

      //right paddle
      if (
        ballX + ballRadius > width - 10 - paddleWidth &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + paddleHeight
      ) {
        ballSpeedX = -ballSpeedX;
        ballX = width - 10 - paddleWidth - ballRadius;
      }

      //scoring

      // Player misses then AI scores
      if (ballX + ballRadius < 0) {
        setAiScore((prev) => prev + 1);
        resetBall();
      }

      // AI misses then Player scores
      if (ballX - ballRadius > width) {
        setPlayerScore((prev) => prev + 1);
        resetBall();
      }

      //draw ball 
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#e5e7eb"; // light gray
      ctx.fill();
      ctx.closePath();

      // draw the frame
      animationFrameId = requestAnimationFrame(draw);
    };

    draw(); // Start animation

    //when leaving the page allow the animation to fade
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, [setPlayerScore, setAiScore]);

  //return for ui 
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 px-4">
      
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-2">Pong – Study Break</h1>

      {/* Scoreboard */}
      <div className="mb-4 flex items-center gap-6 text-sm font-semibold">
        
        {/* Player score */}
        <div className="flex flex-col items-center">
          <span className="text-slate-300 text-[11px] uppercase tracking-wide">You</span>
          <span className="text-2xl text-emerald-400">{playerScore}</span>
        </div>

        {/* Separator */}
        <span className="text-slate-500 text-lg">:</span>

        {/* AI score */}
        <div className="flex flex-col items-center">
          <span className="text-slate-300 text-[11px] uppercase tracking-wide">Computer</span>
          <span className="text-2xl text-pink-400">{aiScore}</span>
        </div>
      </div>

      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={260}
        className="rounded-2xl border border-slate-800 bg-slate-900 max-w-full"
      />

      {/* Instructions */}
      <p className="mt-2 text-xs text-slate-400">
        Controls: ↑ / ↓ or W / S to move your paddle.
      </p>

      {/* Back link */}
      <Link
        href="/messages"
        className="mt-6 text-xs px-4 py-2 rounded-full border border-slate-500 hover:bg-slate-800"
      >
        ⬅ Back to messages
      </Link>
    </div>
  );
}
