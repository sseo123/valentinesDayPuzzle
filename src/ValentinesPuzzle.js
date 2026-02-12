import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function ValentinesPuzzle() {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(1);
  const [puzzle1Solved, setPuzzle1Solved] = useState(false);
  const [puzzle2Solved, setPuzzle2Solved] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [noClickCount, setNoClickCount] = useState(0);
  const canvasRef = useRef(null);
  const [images, setImages] = useState({ puzzle1: null, puzzle2: null });

  const handleYesClick = () => {
    setShowFinalMessage(true);
    
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  useEffect(() => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    Promise.all([
      loadImage('/puzzle1.jpeg'),
      loadImage('/puzzle2.jpeg')
    ]).then(([img1, img2]) => {
      setImages({ puzzle1: img1, puzzle2: img2 });
      initializePuzzle();
    }).catch(err => {
      console.error('Error loading images:', err);
    });
  }, []);

  const initializePuzzle = () => {
    const pieceOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = [...pieceOrder].sort(() => Math.random() - 0.5);
    
    setPieces(shuffled.map((correctPos, currentIndex) => ({
      id: currentIndex,
      correctPosition: correctPos,
      currentPosition: currentIndex
    })));
  };

  useEffect(() => {
    const image = currentPuzzle === 1 ? images.puzzle1 : images.puzzle2;
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pieceSize = 200;

    ctx.clearRect(0, 0, 600, 600);

    pieces.forEach((piece, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = col * pieceSize;
      const y = row * pieceSize;

      const correctRow = Math.floor(piece.correctPosition / 3);
      const correctCol = piece.correctPosition % 3;
      const sx = correctCol * (image.width / 3);
      const sy = correctRow * (image.height / 3);

      ctx.drawImage(
        image,
        sx, sy, image.width / 3, image.height / 3,
        x, y, pieceSize, pieceSize
      );

      ctx.strokeStyle = selectedPiece === index ? '#ef4444' : '#666';
      ctx.lineWidth = selectedPiece === index ? 4 : 2;
      ctx.strokeRect(x, y, pieceSize, pieceSize);
    });
  }, [pieces, images, selectedPiece, currentPuzzle]);

  useEffect(() => {
    if (pieces.length === 0) return;
    
    const solved = pieces.every((piece, index) => piece.correctPosition === index);
    
    if (solved) {
      if (currentPuzzle === 1 && !puzzle1Solved) {
        setPuzzle1Solved(true);
        setTimeout(() => {
          setCurrentPuzzle(2);
          initializePuzzle();
          setSelectedPiece(null);
        }, 1500);
      } else if (currentPuzzle === 2 && !puzzle2Solved) {
        setPuzzle2Solved(true);
        setTimeout(() => setShowQuestion(true), 1500);
      }
    }
  }, [pieces, currentPuzzle, puzzle1Solved, puzzle2Solved]);

  const handlePieceClick = (index) => {
    if ((currentPuzzle === 1 && puzzle1Solved) || (currentPuzzle === 2 && puzzle2Solved)) return;

    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      if (selectedPiece !== index) {
        const newPieces = [...pieces];
        [newPieces[selectedPiece], newPieces[index]] = [newPieces[index], newPieces[selectedPiece]];
        setPieces(newPieces);
      }
      setSelectedPiece(null);
    }
  };

  const resetPuzzle = () => {
    setPieces([]);
    setSelectedPiece(null);
    setCurrentPuzzle(1);
    setPuzzle1Solved(false);
    setPuzzle2Solved(false);
    setShowQuestion(false);
    setShowFinalMessage(false);
    setNoClickCount(0);
    initializePuzzle();
  };

  const getYesButtonSize = () => {
    const basePadding = 12;
    const baseText = 3;
    const growth = noClickCount * 0.5;
    
    return {
      padding: `${basePadding + noClickCount * 4}px ${basePadding * 2 + noClickCount * 8}px`,
      fontSize: `${baseText + growth}rem`
    };
  };

  const getNoButtonSize = () => {
    const basePadding = 12;
    const baseText = 3;
    const shrink = noClickCount * 0.5;
    
    return {
      padding: `${Math.max(4, basePadding - noClickCount * 4)}px ${Math.max(8, basePadding * 2 - noClickCount * 8)}px`,
      fontSize: `${Math.max(0.5, baseText - shrink)}rem`,
      opacity: Math.max(0, 1 - noClickCount * 0.2)
    };
  };

if (showFinalMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-red-200 to-pink-300 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-8xl mb-8 animate-pulse">❤️</h1>
          <h2 className="text-6xl font-bold text-red-600 mb-6">Yay!</h2>
          <p className="text-3xl text-gray-800 max-w-2xl mx-auto mb-12">
            I knew you'd say yes! Happy Soon To Be Valentine's Day! 💕
          </p>
          
          <button
            onClick={resetPuzzle}
            className="px-8 py-4 bg-white text-red-600 text-xl font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
          >
            Back to Puzzle 🧩
          </button>
        </div>
      </div>
    );
  }

  if (showQuestion) {
    const yesSize = getYesButtonSize();
    const noSize = getNoButtonSize();
    const noDisappeared = noClickCount >= 5;

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-pink-200 flex items-center justify-center p-8">
        <div className="text-center bg-white/90 backdrop-blur-sm p-16 rounded-3xl shadow-2xl max-w-3xl">
          <h1 className="text-md font-bold text-red-600 mb-12">
            Our schedules didn't align so I couldn't ask you in person, but I wanted to ask you nevertheless :)
          </h1>
          <h2 className="text-7xl font-bold text-red-600 mb-12">
            Will you be my Valentine ♡??
          </h2>
          
          <div className="flex gap-8 justify-center items-center">
            <button
              onClick={handleYesClick}
              style={{
                padding: yesSize.padding,
                fontSize: yesSize.fontSize
              }}
              className="bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-all shadow-lg"
            >
              Yes!
            </button>
            
            {!noDisappeared && (
              <button
                onClick={() => setNoClickCount(prev => prev + 1)}
                style={{
                  padding: noSize.padding,
                  fontSize: noSize.fontSize,
                  opacity: noSize.opacity
                }}
                className="bg-gray-400 text-white font-bold rounded-full hover:bg-gray-500 transition-all shadow-lg"
              >
                No
              </button>
            )}
          </div>

          <div className="mt-10 text-gray-600 italic h-8">
            {noClickCount === 0 
              ? "you can't click no btw!!" 
              : noClickCount === 1 
              ? "why did you click no :(" 
              : "wow ok"}
          </div>
        </div>
      </div>
    );
  }

  const isSolved = (currentPuzzle === 1 && puzzle1Solved) || (currentPuzzle === 2 && puzzle2Solved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Valentine's Puzzle 💕</h1>
      <p className="text-2xl text-gray-700 mb-8">
        Puzzle {currentPuzzle} of 2 {puzzle1Solved && currentPuzzle === 1 ? '✓' : ''} {puzzle2Solved && currentPuzzle === 2 ? '✓' : ''}
      </p>
      
      {!images.puzzle1 || !images.puzzle2 ? (
        <div className="text-center">
          <p className="text-xl text-gray-700">Loading puzzles...</p>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            onClick={(e) => {
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const col = Math.floor(x / 200);
              const row = Math.floor(y / 200);
              const index = row * 3 + col;
              handlePieceClick(index);
            }}
            className="border-4 border-red-300 rounded-lg shadow-2xl cursor-pointer"
          />
          
          {!isSolved && (
            <p className="text-center mt-6 text-lg text-gray-600">
              Click two pieces to swap them!
            </p>
          )}
          
          {isSolved && currentPuzzle === 1 && (
            <p className="text-center mt-6 text-2xl text-red-600 font-bold animate-pulse">
              Puzzle 1 Complete! Moving to Puzzle 2... 🎉
            </p>
          )}
          
          {isSolved && currentPuzzle === 2 && (
            <p className="text-center mt-6 text-2xl text-red-600 font-bold animate-pulse">
              Both Puzzles Complete! 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
}