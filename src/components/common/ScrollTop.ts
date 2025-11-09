import { useEffect, ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollTopProps {
	children: ReactNode;
}

const ScrollTop = ({ children }: ScrollTopProps) => {
	const { pathname } = useLocation();
	const prevPath = useRef<string | null>(null);

	useEffect(() => {
		if (prevPath.current === '/redeem/camera' && pathname !== '/redeem/camera') {
			window.location.reload();
			return;
		}

		window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});

		prevPath.current = pathname;
	}, [pathname]);

	return children || null;
};

export default ScrollTop;
