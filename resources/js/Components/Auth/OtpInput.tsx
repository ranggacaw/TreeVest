import { forwardRef, InputHTMLAttributes, useEffect, useRef, useState } from 'react';

interface OtpInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    error?: string;
}

export default forwardRef<HTMLInputElement, OtpInputProps>(
    function OtpInput({ value = '', onChange, length = 6, error, className = '', ...props }, ref) {
        const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
        const [focusedIndex, setFocusedIndex] = useState(0);

        useEffect(() => {
            inputRefs.current = inputRefs.current.slice(0, length);
        }, [length]);

        const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;

            if (val.length === 1) {
                const newValue = value.split('');
                newValue[index] = val;
                onChange(newValue.join(''));

                if (index < length - 1) {
                    inputRefs.current[index + 1]?.focus();
                }
            } else if (val.length > 1) {
                const newValue = val.slice(0, length);
                onChange(newValue);
                if (newValue.length < length) {
                    inputRefs.current[newValue.length]?.focus();
                }
            }
        };

        const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !value[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else if (e.key === 'ArrowLeft' && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else if (e.key === 'ArrowRight' && index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        };

        const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
            onChange(pastedData.padEnd(length, ' '));
            inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
        };

        const handleFocus = (index: number) => {
            setFocusedIndex(index);
        };

        return (
            <div className={className}>
                <div className="flex gap-2">
                    {Array.from({ length }).map((_, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            {...props}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={value[index] || ''}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            onFocus={() => handleFocus(index)}
                            className={`h-12 w-12 text-center text-lg font-semibold focus:outline-none focus:ring-2 ${
                                error
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                            } rounded-md border shadow-sm`}
                        />
                    ))}
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);
