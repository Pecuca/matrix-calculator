document.addEventListener('DOMContentLoaded', function() {
    // Referencias a los elementos del DOM
    const matrixSizeSelect = document.getElementById('matrix-size');
    const operationSelect = document.getElementById('operation');
    const scalarInputDiv = document.getElementById('scalar-input');
    const scalarValueInput = document.getElementById('scalar-value');
    const matrixContainer = document.getElementById('matrix-container');
    const matrixBContainer = document.getElementById('matrix-b-container');
    const calculateBtn = document.getElementById('calculate-btn');
    const randomBtn = document.getElementById('random-btn');
    const exampleBtn = document.getElementById('example-btn');
    const clearBtn = document.getElementById('clear-btn');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');

    // Genera el HTML para los inputs de una matriz de tamaño 'size'
    function createMatrixInputsHTML(size, label, idPrefix) {
        let html = `<div><h3>${label}</h3><table class="matrix-table">`;
        for (let i = 0; i < size; i++) {
            html += '<tr>';
            for (let j = 0; j < size; j++) {
                html += `<td><input type="number" step="any" class="matrix-input" id="${idPrefix}-${i}-${j}"></td>`;
            }
            html += '</tr>';
        }
        html += '</table></div>';
        return html;
    }

    // Muestra las matrices de entrada y el área de resultado según la operación seleccionada
    function showMatrices() {
        const size = parseInt(matrixSizeSelect.value);
        const op = operationSelect.value;
        const matricesRow = document.getElementById('matrices-row');
        matricesRow.innerHTML = '';

        let html = '';
        // Si la operación requiere dos matrices (A y B)
        if (['sum', 'sub', 'sub_ba', 'mul'].includes(op)) {
            html += createMatrixInputsHTML(size, 'A', 'A');
            html += `<div class="operation-sign-big">${getOperationSymbol(op)}</div>`;
            html += createMatrixInputsHTML(size, 'B', 'B');
            html += `<div class="operation-sign-big">=</div>`;
            html += `<div id="result-below"></div>`;
        } else if (op === 'scalar') {
            // Si la operación es multiplicación por escalar
            html += `<div class="operation-sign-big">k ×</div>`;
            html += createMatrixInputsHTML(size, 'A', 'A');
            html += `<div class="operation-sign-big">=</div>`;
            html += `<div id="result-below"></div>`;
        } else {
            // Operaciones de una sola matriz
            html += createMatrixInputsHTML(size, 'A', 'A');
            html += `<div class="operation-sign-big">=</div>`;
            html += `<div id="result-below"></div>`;
        }

        matricesRow.innerHTML = html;
        scalarInputDiv.style.display = (op === 'scalar') ? 'block' : 'none';
        errorMessage.textContent = '';

        resultContainer.innerHTML = '';
        errorMessage.textContent = '';
    }

    // Obtiene los valores de una matriz desde los inputs
    function getMatrixValues(idPrefix, size) {
        const values = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const input = document.getElementById(`${idPrefix}-${i}-${j}`);
                if (!input || input.value === '' || isNaN(Number(input.value))) return null;
                row.push(Number(input.value));
            }
            values.push(row);
        }
        return values;
    }

    // Asigna valores a los inputs de una matriz
    function setMatrixValues(idPrefix, matrix) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
                const input = document.getElementById(`${idPrefix}-${i}-${j}`);
                if (input) input.value = matrix[i][j];
            }
        }
    }

    // Genera una matriz aleatoria de enteros entre -10 y 10
    function randomMatrix(size) {
        return Array.from({length: size}, () =>
            Array.from({length: size}, () => Math.floor(Math.random() * 21) - 10)
        );
    }

    // Genera una matriz de ejemplo con números consecutivos
    function exampleMatrix(size) {
        let count = 1;
        return Array.from({length: size}, () =>
            Array.from({length: size}, () => count++)
        );
    }

    // Limpia los valores de las matrices de entrada
    function clearMatrices() {
        const size = parseInt(matrixSizeSelect.value);
        setMatrixValues('A', Array(size).fill().map(() => Array(size).fill('')));
        if (['sum', 'sub', 'sub_ba', 'mul'].includes(operationSelect.value)) {
            setMatrixValues('B', Array(size).fill().map(() => Array(size).fill('')));
        }
        resultContainer.innerHTML = '';
        errorMessage.textContent = '';
    }

    // --- Operaciones básicas con matrices ---
    function addMatrices(A, B) {
        // Suma de matrices
        return A.map((row, i) => row.map((val, j) => +(val + B[i][j]).toFixed(4)));
    }
    function subMatrices(A, B) {
        // Resta de matrices
        return A.map((row, i) => row.map((val, j) => +(val - B[i][j]).toFixed(4)));
    }
    function mulMatrices(A, B) {
        // Multiplicación de matrices
        const n = A.length;
        const result = Array.from({length: n}, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
                result[i][j] = +result[i][j].toFixed(4);
            }
        }
        return result;
    }
    function scalarMulMatrix(A, k) {
        // Multiplicación por escalar
        return A.map(row => row.map(val => +(val * k).toFixed(4)));
    }
    function transposeMatrix(A) {
        // Transposición de matriz
        return A[0].map((_, i) => A.map(row => row[i]));
    }
    function identityMatrix(size) {
        // Matriz identidad
        return Array.from({length: size}, (_, i) =>
            Array.from({length: size}, (_, j) => (i === j ? 1 : 0))
        );
    }
    // Determinante por recursión (expansión de cofactores)
    function determinant(A) {
        const n = A.length;
        if (n === 1) return A[0][0];
        if (n === 2) return +(A[0][0]*A[1][1] - A[0][1]*A[1][0]).toFixed(4);
        let det = 0;
        for (let j = 0; j < n; j++) {
            const minor = A.slice(1).map(row => row.filter((_, col) => col !== j));
            det += ((j % 2 === 0 ? 1 : -1) * A[0][j] * determinant(minor));
        }
        return +det.toFixed(4); // Limita a 4 decimales
    }
    // Inversa por Gauss-Jordan
    function inverseMatrix(A) {
        const n = A.length;
        let M = A.map(row => row.slice());
        let I = identityMatrix(n);
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let k = i+1; k < n; k++) {
                if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
            }
            if (M[maxRow][i] === 0) return null;
            [M[i], M[maxRow]] = [M[maxRow], M[i]];
            [I[i], I[maxRow]] = [I[maxRow], I[i]];
            let div = M[i][i];
            for (let j = 0; j < n; j++) {
                M[i][j] /= div;
                I[i][j] /= div;
            }
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    let factor = M[k][i];
                    for (let j = 0; j < n; j++) {
                        M[k][j] -= factor * M[i][j];
                        I[k][j] -= factor * I[i][j];
                    }
                }
            }
        }
        return I.map(row => row.map(val => +val.toFixed(4)));
    }

    // Muestra una matriz como tabla HTML
    function displayMatrix(matrix, title = '') {
        let html = title ? `<h4>${title}</h4>` : '';
        html += '<table class="matrix-table">';
        matrix.forEach(row => {
            html += '<tr>' + row.map(val => `<td>${val}</td>`).join('') + '</tr>';
        });
        html += '</table>';
        return html;
    }

    // Devuelve el símbolo de la operación para mostrar en la interfaz
    function getOperationSymbol(op) {
        switch (op) {
            case 'sum': return '+';
            case 'sub': return '−';
            case 'sub_ba': return '−';
            case 'mul': return '×';
            case 'scalar': return '×';
            case 'transpose': return '→';
            case 'det': return '| |';
            case 'inv': return '⁻¹';
            case 'identity': return '=';
            default: return '';
        }
    }

    // --- Eventos de la interfaz ---
    matrixSizeSelect.addEventListener('change', showMatrices);
    operationSelect.addEventListener('change', showMatrices);

    // Botón para generar matrices aleatorias
    randomBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeSelect.value);
        setMatrixValues('A', randomMatrix(size));
        if (['sum', 'sub', 'sub_ba', 'mul'].includes(operationSelect.value)) {
            setMatrixValues('B', randomMatrix(size));
        }
    });

    // Botón para cargar matrices de ejemplo
    exampleBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeSelect.value);
        setMatrixValues('A', exampleMatrix(size));
        if (['sum', 'sub', 'sub_ba', 'mul'].includes(operationSelect.value)) {
            setMatrixValues('B', exampleMatrix(size));
        }
    });

    // Botón para limpiar matrices
    clearBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeSelect.value);
        setMatrixValues('A', Array(size).fill().map(() => Array(size).fill('')));
        if (['sum', 'sub', 'sub_ba', 'mul'].includes(operationSelect.value)) {
            setMatrixValues('B', Array(size).fill().map(() => Array(size).fill('')));
        }
        resultContainer.innerHTML = '';
        errorMessage.textContent = '';
    });

    // Botón para calcular el resultado de la operación seleccionada
    calculateBtn.addEventListener('click', () => {
        errorMessage.textContent = '';
        const size = parseInt(matrixSizeSelect.value);
        const op = operationSelect.value;
        const A = getMatrixValues('A', size);
        if (!A) {
            errorMessage.textContent = 'Por favor, ingresa todos los valores numéricos válidos en la matriz A.';
            return;
        }
        let B = null;
        if (['sum', 'sub', 'sub_ba', 'mul'].includes(op)) {
            B = getMatrixValues('B', size);
            if (!B) {
                errorMessage.textContent = 'Por favor, ingresa todos los valores numéricos válidos en la matriz B.';
                return;
            }
        }
        let result = '';
        switch (op) {
            case 'sum':
                result = displayMatrix(addMatrices(A, B), 'A + B');
                break;
            case 'sub':
                result = displayMatrix(subMatrices(A, B), 'A - B');
                break;
            case 'sub_ba':
                result = displayMatrix(subMatrices(B, A), 'B - A');
                break;
            case 'mul':
                result = displayMatrix(mulMatrices(A, B), 'A × B');
                break;
            case 'scalar':
                const k = parseFloat(scalarValueInput.value);
                if (isNaN(k)) {
                    errorMessage.textContent = 'Por favor, ingresa un valor escalar válido.';
                    return;
                }
                result = displayMatrix(scalarMulMatrix(A, k), `k × A (k=${k})`);
                break;
            case 'transpose':
                result = displayMatrix(A, 'Matriz Original (A)');
                result += displayMatrix(transposeMatrix(A), 'Transpuesta (Aᵗ)');
                break;
            case 'det':
                result = `<p>det(A) = <b>${determinant(A)}</b></p>`;
                break;
            case 'inv':
                const detA = determinant(A);
                if (detA === 0) {
                    errorMessage.textContent = 'La matriz no es invertible (det(A) = 0).';
                    return;
                }
                const invA = inverseMatrix(A);
                if (!invA) {
                    errorMessage.textContent = 'No se pudo calcular la inversa.';
                    return;
                }
                result = displayMatrix(invA, 'A⁻¹');
                // Verificación: A × A⁻¹ = I
                const prod = mulMatrices(A, invA);
                result += displayMatrix(prod, 'A × A⁻¹');
                break;
            case 'identity':
                result = displayMatrix(identityMatrix(size), `Matriz Identidad I${size}`);
                break;
        }
        // Muestra el resultado debajo de las matrices
        const resultBelow = document.getElementById('result-below');
        if (resultBelow) resultBelow.innerHTML = result;
    });

    // Inicialización: muestra las matrices al cargar la página
    showMatrices();

});