'use client';

import { useState } from 'react';

export default function CalculatorPage() {
    const [display, setDisplay] = useState('0');
    const [firstNumber, setFirstNumber] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [newNumber, setNewNumber] = useState(true);

    const handleNumber = (num: string) => {
        if (newNumber) {
            setDisplay(num);
            setNewNumber(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const handleOperation = (op: string) => {
        setOperation(op);
        setFirstNumber(parseFloat(display));
        setNewNumber(true);
    };

    const handleEqual = () => {
        if (firstNumber === null || operation === null) return;
        
        const secondNumber = parseFloat(display);
        let result = 0;

        switch (operation) {
            case '+':
                result = firstNumber + secondNumber;
                break;
            case '-':
                result = firstNumber - secondNumber;
                break;
            case '*':
                result = firstNumber * secondNumber;
                break;
            case '/':
                result = firstNumber / secondNumber;
                break;
        }

        setDisplay(result.toString());
        setFirstNumber(null);
        setOperation(null);
        setNewNumber(true);
    };

    const handleClear = () => {
        setDisplay('0');
        setFirstNumber(null);
        setOperation(null);
        setNewNumber(true);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-64 bg-gray-100 rounded-lg p-4 shadow-lg">
                <div className="bg-white p-4 rounded mb-4 text-right text-2xl font-mono">
                    {display}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={handleClear} className="col-span-2 bg-red-500 text-white p-2 rounded hover:bg-red-600">
                        Clear
                    </button>
                    <button onClick={() => handleOperation('/')} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        ÷
                    </button>
                    <button onClick={() => handleOperation('*')} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        ×
                    </button>
                    
                    {[7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumber(num.toString())}
                            className="bg-gray-300 p-2 rounded hover:bg-gray-400"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={() => handleOperation('-')} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        -
                    </button>
                    
                    {[4, 5, 6].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumber(num.toString())}
                            className="bg-gray-300 p-2 rounded hover:bg-gray-400"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={() => handleOperation('+')} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        +
                    </button>
                    
                    {[1, 2, 3].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumber(num.toString())}
                            className="bg-gray-300 p-2 rounded hover:bg-gray-400"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={handleEqual} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                        =
                    </button>
                    
                    <button
                        onClick={() => handleNumber('0')}
                        className="col-span-2 bg-gray-300 p-2 rounded hover:bg-gray-400"
                    >
                        0
                    </button>
                    <button
                        onClick={() => handleNumber('.')}
                        className="bg-gray-300 p-2 rounded hover:bg-gray-400"
                    >
                        .
                    </button>
                </div>
            </div>
        </div>
    );
} 