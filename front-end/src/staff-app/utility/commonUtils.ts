import React from 'react';
export const useDebounce = <T>(value: T, timeout = 1000) => {
	const [currentValue, setCurrentValue] = React.useState(value);

	React.useEffect(() => {
		const timeoutId = setTimeout(() => setCurrentValue(value), timeout);

		return () => clearTimeout(timeoutId);
	}, [value, timeout]);

	return currentValue;
};