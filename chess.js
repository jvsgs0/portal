const board = document.getElementById('board');
const restartButton = document.getElementById('restartButton');
const promotionModal = document.getElementById('promotionModal');
const promotionOptions = document.querySelectorAll('.promotionOption');
const turnIndicator = document.createElement('div');
let selectedPiece = null;
let selectedSquare = null;
let gameOver = false;
let promotionSquare = null;
let currentPlayer = 'white'; // 'white' ou 'black'

// Peças em notação Unicode para facilitar
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

// Posição inicial das peças em FEN (Forsyth-Edwards Notation)
const initialPosition = [
    'rnbqkbnr',
    'pppppppp',
    '........',
    '........',
    '........',
    '........',
    'PPPPPPPP',
    'RNBQKBNR'
];

function createBoard() {
    board.innerHTML = ''; // Limpa o tabuleiro

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
            square.setAttribute('data-row', i);
            square.setAttribute('data-col', j);
            
            const piece = initialPosition[i][j];
            if (piece !== '.') {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.textContent = pieces[piece];
                pieceElement.setAttribute('data-piece', piece);
                pieceElement.setAttribute('data-row', i);
                pieceElement.setAttribute('data-col', j);
                square.appendChild(pieceElement);
            }
            
            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
        }
    }

    // Adiciona o indicador de turno ao corpo
    turnIndicator.id = 'turnIndicator';
    turnIndicator.textContent = `Jogador atual: ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;
    document.body.insertBefore(turnIndicator, board);
}

function handleSquareClick(e) {
    if (gameOver) return;

    const square = e.currentTarget;
    const row = parseInt(square.getAttribute('data-row'));
    const col = parseInt(square.getAttribute('data-col'));

    if (selectedPiece) {
        const validMove = isValidMove(selectedPiece, selectedSquare, row, col);

        if (validMove) {
            // Verificar se o movimento é para capturar uma peça
            if (square.firstChild) {
                const targetPiece = square.firstChild;
                if (isOpponentPiece(selectedPiece, targetPiece)) {
                    if (targetPiece.getAttribute('data-piece').toLowerCase() === 'k') {
                        endGame(selectedPiece.getAttribute('data-piece'));
                    }
                    square.removeChild(targetPiece);  // Remove a peça capturada
                } else {
                    selectedPiece = null;
                    selectedSquare = null;
                    return;
                }
            }
            square.appendChild(selectedPiece);
            selectedPiece.setAttribute('data-row', row);
            selectedPiece.setAttribute('data-col', col);
            
            // Verificar promoção de peão
            if (selectedPiece.getAttribute('data-piece').toLowerCase() === 'p' && (row === 0 || row === 7)) {
                promotionSquare = square;
                promotionModal.style.display = 'flex';
            } else {
                // Alternar turnos
                currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
                turnIndicator.textContent = `Jogador atual: ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;
            }

            selectedPiece = null;
            selectedSquare = null;
        } else {
            selectedPiece = null;
            selectedSquare = null;
        }
    } else if (square.firstChild) {
        const piece = square.firstChild;
        const pieceColor = piece.getAttribute('data-piece').toUpperCase() === piece.getAttribute('data-piece') ? 'white' : 'black';
        if (pieceColor === currentPlayer) {
            selectedPiece = piece;
            selectedSquare = { row, col };
        }
    }
}

function isValidMove(piece, fromSquare, toRow, toCol) {
    const pieceType = piece.getAttribute('data-piece').toLowerCase();
    const fromRow = fromSquare.row;
    const fromCol = fromSquare.col;

    switch (pieceType) {
        case 'p': // Peão
            return isValidPawnMove(piece, fromRow, fromCol, toRow, toCol);
        case 'r': // Torre
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'n': // Cavalo
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b': // Bispo
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'q': // Rainha
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k': // Rei
            return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default:
            return false;
    }
}

function isOpponentPiece(selectedPiece, targetPiece) {
    const selectedColor = selectedPiece.getAttribute('data-piece').toUpperCase() === selectedPiece.getAttribute('data-piece') ? 'white' : 'black';
    const targetColor = targetPiece.getAttribute('data-piece').toUpperCase() === targetPiece.getAttribute('data-piece') ? 'white' : 'black';
    return selectedColor !== targetColor;
}

function endGame(winningPiece) {
    gameOver = true;
    const winner = winningPiece === 'K' ? 'Brancas' : 'Pretas';
    alert(`Fim de jogo! ${winner} venceram.`);
}

function restartGame() {
    gameOver = false;
    selectedPiece = null;
    selectedSquare = null;
    promotionSquare = null;
    promotionModal.style.display = 'none';
    currentPlayer = 'white'; // Começa sempre com as brancas
    turnIndicator.textContent = `Jogador atual: Brancas`;
    createBoard();
}

function promotePawn(newPiece) {
    const pieceElement = document.createElement('div');
    pieceElement.classList.add('piece');
    pieceElement.textContent = pieces[newPiece];
    pieceElement.setAttribute('data-piece', newPiece);
    pieceElement.setAttribute('data-row', promotionSquare.getAttribute('data-row'));
    pieceElement.setAttribute('data-col', promotionSquare.getAttribute('data-col'));
    promotionSquare.appendChild(pieceElement);
    promotionModal.style.display = 'none';
    selectedPiece = null;
    selectedSquare = null;
    promotionSquare = null;
    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white'; // Alterna o turno após a promoção
}

promotionOptions.forEach(option => {
    option.addEventListener('click', () => {
        const newPiece = option.getAttribute('data-piece');
        promotePawn(newPiece);
    });
});

// Funções para validar os movimentos das peças
function isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
    const direction = piece.getAttribute('data-piece') === 'P' ? -1 : 1;
    const startRow = piece.getAttribute('data-piece') === 'P' ? 1 : 6;

    // Movimento simples para frente
    if (fromCol === toCol && fromRow + direction === toRow && !document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`).firstChild) {
        return true;
    }
    
    // Captura na diagonal
    if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow) {
        const targetSquare = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
        return targetSquare.firstChild && isOpponentPiece(piece, targetSquare.firstChild);
    }
    
    // Movimento inicial duplo para frente
    if (fromCol === toCol && fromRow + 2 * direction === toRow && fromRow === startRow &&
        !document.querySelector(`[data-row='${fromRow + direction}'][data-col='${fromCol}']`).firstChild &&
        !document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`).firstChild) {
        return true;
    }

    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false; // Movimento não reto
    if (fromRow === toRow) {  // Movimento horizontal
        const step = (fromCol < toCol) ? 1 : -1;
        for (let col = fromCol + step; col !== toCol; col += step) {
            if (document.querySelector(`[data-row='${fromRow}'][data-col='${col}']`).firstChild) {
                return false;
            }
        }
    } else {  // Movimento vertical
        const step = (fromRow < toRow) ? 1 : -1;
        for (let row = fromRow + step; row !== toRow; row += step) {
            if (document.querySelector(`[data-row='${row}'][data-col='${fromCol}']`).firstChild) {
                return false;
            }
        }
    }
    return true;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2); // Movimento em "L"
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

    // Verificar se há uma peça no caminho
    const rowStep = (fromRow < toRow) ? 1 : -1;
    const colStep = (fromCol < toCol) ? 1 : -1;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (row !== toRow && col !== toCol) {
        if (document.querySelector(`[data-row='${row}'][data-col='${col}']`).firstChild) {
            return false;
        }
        row += rowStep;
        col += colStep;
    }
    return true;
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

// Inicializa o tabuleiro e define o manipulador de eventos para o botão de reinício
createBoard();
restartButton.addEventListener('click', restartGame);

function isCastlingMove(fromRow, fromCol, toRow, toCol) {
    const piece = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}']`).firstChild;
    if (piece && piece.getAttribute('data-piece').toLowerCase() === 'k') {
        // Verifique Roque Pequeno (lado do rei)
        if (fromRow === toRow && fromCol === 4 && toCol === 6) {
            return isValidShortCastling(fromRow, fromCol);
        }
        // Verifique Roque Grande (lado da dama)
        if (fromRow === toRow && fromCol === 4 && toCol === 2) {
            return isValidLongCastling(fromRow, fromCol);
        }
    }
    return false;
}

function isValidShortCastling(row, col) {
    // Verifique se o rei e a torre não se moveram
    const kingMoved = document.querySelector(`[data-row='${row}'][data-col='${col}']`).firstChild.hasAttribute('data-moved');
    const rookMoved = document.querySelector(`[data-row='${row}'][data-col='${col + 3}']`).firstChild.hasAttribute('data-moved');
    if (kingMoved || rookMoved) return false;

    // Verifique se as casas entre o rei e a torre estão vazias e não estão atacadas
    const squares = [
        document.querySelector(`[data-row='${row}'][data-col='${col + 1}']`),
        document.querySelector(`[data-row='${row}'][data-col='${col + 2}']`)
    ];

    return squares.every(sq => !sq.firstChild && !isSquareUnderAttack(sq));
}

function isValidLongCastling(row, col) {
    // Verifique se o rei e a torre não se moveram
    const kingMoved = document.querySelector(`[data-row='${row}'][data-col='${col}']`).firstChild.hasAttribute('data-moved');
    const rookMoved = document.querySelector(`[data-row='${row}'][data-col='${col - 4}']`).firstChild.hasAttribute('data-moved');
    if (kingMoved || rookMoved) return false;

    // Verifique se as casas entre o rei e a torre estão vazias e não estão atacadas
    const squares = [
        document.querySelector(`[data-row='${row}'][data-col='${col - 1}']`),
        document.querySelector(`[data-row='${row}'][data-col='${col - 2}']`),
        document.querySelector(`[data-row='${row}'][data-col='${col - 3}']`)
    ];

    return squares.every(sq => !sq.firstChild && !isSquareUnderAttack(sq));
}

function isSquareUnderAttack(square) {
    // Verifique se a casa está sob ataque por qualquer peça adversária
    const row = parseInt(square.getAttribute('data-row'));
    const col = parseInt(square.getAttribute('data-col'));
    // Implementar lógica para verificar se a casa está sob ataque
    return false; // Para simplificação
}

function performCastling(fromRow, fromCol, toRow, toCol) {
    // Executa o Roque
    const king = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}']`).firstChild;
    const rook = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol + (toCol > fromCol ? 3 : -4)}']`).firstChild;

    // Move o rei
    document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`).appendChild(king);
    king.setAttribute('data-row', toRow);
    king.setAttribute('data-col', toCol);
    king.setAttribute('data-moved', true);

    // Move a torre
    document.querySelector(`[data-row='${toRow}'][data-col='${toCol - (toCol > fromCol ? 1 : -1)}']`).appendChild(rook);
    rook.setAttribute('data-row', toRow);
    rook.setAttribute('data-col', toCol - (toCol > fromCol ? 1 : -1));
    rook.setAttribute('data-moved', true);

    // Alternar turnos após o Roque
    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
    turnIndicator.textContent = `Jogador atual: ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;
}


// Atualize a função handleSquareClick para incluir o Roque
function handleSquareClick(e) {
    if (gameOver) return;

    const square = e.currentTarget;
    const row = parseInt(square.getAttribute('data-row'));
    const col = parseInt(square.getAttribute('data-col'));

    if (selectedPiece) {
        const validMove = isValidMove(selectedPiece, selectedSquare, row, col) || isCastlingMove(selectedSquare.row, selectedSquare.col, row, col);

        if (validMove) {
            // Verificar se o movimento é para capturar uma peça
            if (square.firstChild) {
                const targetPiece = square.firstChild;
                if (isOpponentPiece(selectedPiece, targetPiece)) {
                    if (targetPiece.getAttribute('data-piece').toLowerCase() === 'k') {
                        endGame(selectedPiece.getAttribute('data-piece'));
                    }
                    square.removeChild(targetPiece);  // Remove a peça capturada
                } else {
                    selectedPiece = null;
                    selectedSquare = null;
                    return;
                }
            }
            if (isCastlingMove(selectedSquare.row, selectedSquare.col, row, col)) {
                performCastling(selectedSquare.row, selectedSquare.col, row, col);
            } else {
                square.appendChild(selectedPiece);
                selectedPiece.setAttribute('data-row', row);
                selectedPiece.setAttribute('data-col', col);

                // Verificar promoção de peão
                if (selectedPiece.getAttribute('data-piece').toLowerCase() === 'p' && (row === 0 || row === 7)) {
                    promotionSquare = square;
                    promotionModal.style.display = 'flex';
                } else {
                    // Alternar turnos
                    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
                    turnIndicator.textContent = `Jogador atual: ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;
                }
            }

            selectedPiece = null;
            selectedSquare = null;
        } else {
            selectedPiece = null;
            selectedSquare = null;
        }
    } else if (square.firstChild) {
        const piece = square.firstChild;
        const pieceColor = piece.getAttribute('data-piece').toUpperCase() === piece.getAttribute('data-piece') ? 'white' : 'black';
        if (pieceColor === currentPlayer) {
            selectedPiece = piece;
            selectedSquare = { row, col };
        }
    }
}
