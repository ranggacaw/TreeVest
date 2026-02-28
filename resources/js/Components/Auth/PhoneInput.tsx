import { forwardRef, InputHTMLAttributes } from 'react';
import PhoneInput from 'react-phone-number-input';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string;
    onChange: (value: string | undefined) => void;
    error?: string;
    label?: string;
}

export default forwardRef<HTMLInputElement, PhoneInputProps>(
    function CustomPhoneInput({ value, onChange, error, label, className = '', ...props }, ref) {
        return (
            <div className={className}>
                {label && (
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <PhoneInput
                        {...props}
                        international
                        countryCallingCodeEditable={false}
                        value={value}
                        onChange={onChange}
                        defaultCountry="MY"
                        limitMaxLength={true}
                        inputRef={ref as React.RefObject<HTMLInputElement>}
                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);
